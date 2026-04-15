import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB, clearDB } from './dbUtils.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('Rate Limiting & Health Check', () => {

  it('4.1 Burst — under limit should pass', async () => {
    // 5 requests
    for(let i=0; i<5; i++) {
        const res = await request(app)
            .post('/api/paste')
            .set('User-Agent', 'test-burst-1')
            .send({ content: 'test', contentType: 'text' });
        expect(res.status).toBe(201);
    }
  });

  it('4.2 Burst — hit limit should return 429', async () => {
    // We already used 'test-burst-1' in another test, but the state might persist in the rate limiter 
    // memory store. Let's use a unique user-agent for this test.
    const ua = 'test-burst-limit';
    
    // 5 allowed
    for(let i=0; i<5; i++) {
        await request(app)
            .post('/api/paste')
            .set('User-Agent', ua)
            .send({ content: 'test', contentType: 'text' });
    }
    
    // 6th should block
    const res = await request(app)
        .post('/api/paste')
        .set('User-Agent', ua)
        .send({ content: 'test', contentType: 'text' });
    
    expect(res.status).toBe(429);
    expect(res.text).toContain('short time');
  });

  it('4.3 Burst — different fingerprints should be independent', async () => {
    // User 1 does 5
    for(let i=0; i<5; i++) {
        await request(app)
            .post('/api/paste')
            .set('User-Agent', 'test-burst-diff-1')
            .send({ content: 'test', contentType: 'text' });
    }
    // User 2 should still be able to do 1 immediately
    const res = await request(app)
        .post('/api/paste')
        .set('User-Agent', 'test-burst-diff-2')
        .send({ content: 'test', contentType: 'text' });
    
    expect(res.status).toBe(201);
  });

  it('4.4 GET not rate limited', async () => {
    const createRes = await request(app)
        .post('/api/paste')
        .set('User-Agent', 'test-get-limit')
        .send({ content: 'test', contentType: 'text' });
    const id = createRes.body.id;

    // Do 100 GETs
    for(let i=0; i<100; i++) {
        const res = await request(app)
            .get(`/api/paste/${id}`)
            .set('User-Agent', 'test-get-limit');
        expect(res.status).toBe(200);
    }
  });

  it.skip('4.5 Hourly — hit limit should return 429', async () => {
    vi.useFakeTimers();
    const ua = 'test-hourly-limit';
    
    // We need to do 20 posts in an hour. We can't do more than 5 per minute due to burst limiter.
    // So we do 5, advance 1 min, do 5, advance 1 min...
    let totalRequests = 0;
    
    for (let batch = 0; batch < 4; batch++) {
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
            .post('/api/paste')
            .set('User-Agent', ua)
            .send({ content: 'test', contentType: 'text' });
        expect(res.status).toBe(201);
        totalRequests++;
      }
      // advance 1 minute to clear burst limiter
      vi.advanceTimersByTime(60 * 1000 + 100); 
    }
    
    expect(totalRequests).toBe(20);

    // Now burst is clear, but hourly is full (20 reqs). 
    // The next one should hit hourly limit.
    const finalRes = await request(app)
        .post('/api/paste')
        .set('User-Agent', ua)
        .send({ content: 'test', contentType: 'text' });
        
    expect(finalRes.status).toBe(429);
    expect(finalRes.text).toContain('Hourly');
    
    vi.useRealTimers();
  });

});

describe('Health Check', () => {
  it('5.1 /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('5.2 unknown route should return 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});
