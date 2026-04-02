FROM node:18-alpine

WORKDIR /app

# Non-root user for security
RUN chown node:node /app
USER node

# Copy package files (caching layer)
COPY --chown=node:node package*.json ./

# Install dependencies (runtime only)
RUN npm ci --only=production

# Copy source code
COPY --chown=node:node ./src ./src

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start server
CMD ["npm", "start"]
