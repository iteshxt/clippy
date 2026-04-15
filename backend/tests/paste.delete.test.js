import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

vi.mock('../src/middleware/fingerprint.js', () => ({
  fingerprintMiddleware: (req, res, next) => next()
}));
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

describe('DELETE /api/paste/:id', () => {

  it('3.1 Should delete existing paste', async () => {
    const createRes = await request(app)
      .post('/api/paste')
      .send({ content: 'to delete', contentType: 'text' });
    
    const id = createRes.body.id;
    const res = await request(app).delete(`/api/paste/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Paste deleted successfully');
  });

  it('3.2 Should verify deleted paste cannot be fetched', async () => {
    const createRes = await request(app)
      .post('/api/paste')
      .send({ content: 'to delete', contentType: 'text' });
    
    const id = createRes.body.id;
    await request(app).delete(`/api/paste/${id}`);
    
    const res = await request(app).get(`/api/paste/${id}`);
    expect(res.status).toBe(404);
  });

  it('3.3 Should return 404 when deleting non-existent ID', async () => {
    const res = await request(app).delete('/api/paste/9999');
    expect(res.status).toBe(404);
  });

  it('3.4 Should return 400 for invalid format', async () => {
    const res = await request(app).delete('/api/paste/abc');
    expect(res.status).toBe(400);
  });

});
