import request from 'supertest';
import app from '../app';

describe('Monitoring and 404 handlers', () => {
  it('GET /metrics exposes Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    // prom-client sets a text/plain content type for exposition format
    expect(res.headers['content-type']).toContain('text/plain');
    // Should include at least one of our metric names
    expect(res.text).toContain('http_request_duration_seconds');
  });

  it('GET /non-existent returns standardized 404 error', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Route not found');
    // requestId is optional but should be defined generally
    expect(Object.keys(res.body.error)).toEqual(
      expect.arrayContaining(['code', 'message'])
    );
  });
});
