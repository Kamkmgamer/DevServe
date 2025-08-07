
import request from 'supertest';
import app from '../app';

describe('App', () => {
  it('should return 200 OK for the health check endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', message: 'API is healthy' });
  });

  it('should return 404 for a non-existent route', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Route not found' });
  });
});
