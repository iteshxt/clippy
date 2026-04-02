import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const fingerprintStore = new Map();

function generateFingerprint(req) {
  const userAgent = req.get('user-agent') || 'unknown';
  const acceptLanguage = req.get('accept-language') || 'unknown';
  const combined = `${userAgent}|${acceptLanguage}`;
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 3600000), // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 50), // 50 requests per hour
  keyGenerator: (req, res) => req.fingerprint,
  skip: (req, res) => {
    // Skip rate limiting for GET requests (only limit uploads)
    return req.method === 'GET' || req.path === '/health';
  },
  message: {
    error: 'Too many uploads from this device. Please try again later.',
  },
});

export function fingerprintMiddleware(req, res, next) {
  const fingerprint = generateFingerprint(req);
  req.fingerprint = fingerprint;
  return limiter(req, res, next);
}
