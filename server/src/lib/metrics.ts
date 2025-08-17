import client from 'prom-client';

// Create a Registry which registers the metrics
export const register = new client.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// Histogram to measure HTTP request durations
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  // Reasonable buckets for web latencies
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

register.registerMetric(httpRequestDurationSeconds);

export async function metricsHandler(_: any, res: any) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}
