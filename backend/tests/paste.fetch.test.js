import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

vi.mock('../src/middleware/fingerprint.js', () => ({
  fingerprintMiddleware: (req, res, next) => next()
}));
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB, clearDB } from './dbUtils.js';
import { Paste } from '../src/models/Paste.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('GET /api/paste/:id', () => {

  it('2.1 Should fetch existing text paste', async () => {
    const createRes = await request(app)
      .post('/api/paste')
      .send({ content: 'fetch code', contentType: 'text' });
    
    const res = await request(app).get(`/api/paste/${createRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.content).toBe('fetch code');
    expect(res.body.contentType).toBe('text');
  });

  it('2.2 Should fetch existing file paste', async () => {
    const createRes = await request(app)
      .post('/api/paste')
      .field('contentType', 'file')
      .attach('file', Buffer.from('hello file'), 'test.txt');

    const res = await request(app).get(`/api/paste/${createRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.contentType).toBe('file');
    expect(res.body.fileName).toBe('test.txt');
    expect(res.body.mimeType).toBe('text/plain');
    expect(res.body.content).toBe(Buffer.from('hello file').toString('base64'));
  });

  it('2.3 Should fetch existing link paste', async () => {
    const createRes = await request(app)
      .post('/api/paste')
      .send({ content: 'https://example.com', contentType: 'link' });
    
    const res = await request(app).get(`/api/paste/${createRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.content).toBe('https://example.com');
  });

  it('2.4 Should return 404 for non-existent ID', async () => {
    const res = await request(app).get('/api/paste/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Paste not found or expired');
  });

  it('2.5 Should return 400 for invalid format - letters', async () => {
    const res = await request(app).get('/api/paste/abcd');
    expect(res.status).toBe(400);
  });

  it('2.6 Should return 400 for invalid format - 3 digits', async () => {
    const res = await request(app).get('/api/paste/123');
    expect(res.status).toBe(400);
  });

  it('2.7 Should return 400 for invalid format - 5 digits', async () => {
    const res = await request(app).get('/api/paste/12345');
    expect(res.status).toBe(400);
  });

  it('2.8 Should return 404 for expired paste', async () => {
    const createRes = await request(app)
      .post('/api/paste')
      .send({ content: 'fetch code', contentType: 'text' });
    
    const id = createRes.body.id;
    // Manually force expire in DB
    await Paste.updateOne({ id }, { expiresAt: new Date(Date.now() - 1000) });

    const res = await request(app).get(`/api/paste/${id}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Paste has expired');
  });

  it('2.9 Should verify expired paste is deleted from DB', async () => {
    const createRes = await request(app)
      .post('/api/paste')
      .send({ content: 'to be deleted', contentType: 'text' });
    
    const id = createRes.body.id;
    await Paste.updateOne({ id }, { expiresAt: new Date(Date.now() - 1000) });

    // The GET request should delete it
    await request(app).get(`/api/paste/${id}`);

    const dbPaste = await Paste.findOne({ id });
    expect(dbPaste).toBeNull();
  });

  it('2.10 Should not include fileName/mimeType for text pastes', async () => {
    const createRes = await request(app)
      .post('/api/paste')
      .send({ content: 'fetch code', contentType: 'text' });
    
    const res = await request(app).get(`/api/paste/${createRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.fileName).toBeUndefined();
    expect(res.body.mimeType).toBeUndefined();
  });

});
