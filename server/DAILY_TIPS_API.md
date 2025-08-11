# Daily Tips API Documentation

## Overview

The Daily Tips API provides AI-generated tips with server-side caching to optimize performance and provide consistent content to all users throughout the day. The system automatically refreshes tips at midnight UTC and provides both cached and fresh tip endpoints.

## Architecture

### Server-Side Caching
- **Cache Duration**: 24 hours (midnight to midnight UTC)
- **Storage**: JSON file cache with in-memory backup
- **Auto-refresh**: Scheduled refresh at midnight UTC
- **Fallback**: Multiple fallback layers for reliability

### API Endpoints

#### `GET /api/chatbot/daily-tip/cached`
Returns the cached daily tip that is shared across all users for the current day.

**Response Format:**
```json
{
  "content": "**AI Tip:** This is today's tip with *markdown* support including `code` and [links](https://example.com).",
  "tip": "**AI Tip:** This is today's tip with *markdown* support including `code` and [links](https://example.com).",
  "expiresIn": 43200
}
```

**Features:**
- Same tip for all users during the day
- Minimal API calls (cached content)
- Automatic fallback to previous cached tip on error
- Rich text markdown support

#### `GET /api/chatbot/daily-tip/fresh`
Generates a new tip bypassing the cache, without affecting the daily cached tip.

**Response Format:**
```json
{
  "content": "**Fresh AI Tip:** This is a newly generated tip.",
  "tip": "**Fresh AI Tip:** This is a newly generated tip.",
  "expiresIn": 43200,
  "fresh": true
}
```

**Features:**
- Always generates new content
- Individual tip per request
- Fallback to cached tip on generation failure
- Does not update the daily cache

#### `GET /api/chatbot/daily-tip/stats`
Returns cache statistics for monitoring and debugging.

**Response Format:**
```json
{
  "hasCache": true,
  "lastGenerated": 1702934400000,
  "expiresAt": 1703020800000,
  "isValid": true,
  "expiresIn": 43200,
  "message": "Daily tips cache statistics",
  "timestamp": "2023-12-19T12:00:00.000Z"
}
```

#### `POST /api/chatbot/daily-tip/refresh`
Force refreshes the daily cache (admin/debugging endpoint).

**Response Format:**
```json
{
  "content": "**Refreshed Tip:** Newly generated tip content.",
  "tip": "**Refreshed Tip:** Newly generated tip content.",
  "expiresIn": 86400,
  "message": "Daily tip cache forcefully refreshed",
  "refreshed": true
}
```

#### `GET /api/chatbot/daily-tip` (Legacy)
Legacy endpoint that redirects to the cached version for backward compatibility.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `content` | string | The tip content with markdown formatting |
| `tip` | string | Same as content (for backward compatibility) |
| `expiresIn` | number | Seconds until next daily refresh |
| `fresh` | boolean | Present only in fresh responses (always true) |
| `refreshed` | boolean | Present only in force refresh responses |
| `warning` | string | Present when using fallback content |

## Error Handling

### Configuration Errors
When OpenRouter API key is not configured:
```json
{
  "error": "Chatbot service is not configured. Please add your OpenRouter API key.",
  "content": "**AI features coming soon!** Configure your API key...",
  "expiresIn": 43200
}
```

### API Errors
When the AI service fails:
```json
{
  "error": "Failed to generate fresh AI tip",
  "content": "**Fresh AI Tip:** Embrace failure as a learning opportunity!...",
  "expiresIn": 43200
}
```

### Rate Limiting
```json
{
  "error": "Rate limit exceeded for fresh tips",
  "content": "**Rate Limited:** Patience is a virtue in API development!...",
  "expiresIn": 43200
}
```

## Fallback Strategy

1. **Primary**: Generate fresh tip using OpenRouter API
2. **Secondary**: Return cached tip from memory/file
3. **Tertiary**: Return contextual fallback message based on error type
4. **Final**: Return generic helpful tip with proper formatting

## Cache Management

### Automatic Refresh
- Scheduled at midnight UTC daily
- Uses variadic prompts for content diversity
- Persistent storage with JSON file backup
- Graceful handling of generation failures

### Manual Refresh
- Force refresh via `/refresh` endpoint
- Admin/debugging functionality
- Updates cache for all users
- Immediate effect

## Performance Characteristics

### Cached Endpoints
- **Latency**: ~10ms (memory lookup)
- **API Calls**: 1 per day maximum
- **Reliability**: High (multiple fallback layers)

### Fresh Endpoints
- **Latency**: ~2-5 seconds (OpenRouter API call)
- **API Calls**: 1 per request
- **Reliability**: Good (fallback to cached content)

## Frontend Integration

### Client-Side Caching
The server's `expiresIn` field allows clients to implement their own caching:

```javascript
// Example client-side cache implementation
const cacheKey = 'daily-tip-cache';
const cached = localStorage.getItem(cacheKey);

if (cached) {
  const { content, expiresAt } = JSON.parse(cached);
  if (Date.now() < expiresAt) {
    return content; // Use cached content
  }
}

// Fetch from server and cache
const response = await fetch('/api/chatbot/daily-tip/cached');
const data = await response.json();

localStorage.setItem(cacheKey, JSON.stringify({
  content: data.content,
  expiresAt: Date.now() + (data.expiresIn * 1000)
}));
```

### Countdown Timer Synchronization
The `expiresIn` field enables precise countdown timers:

```javascript
// Countdown to next refresh
const updateCountdown = (expiresIn) => {
  const hours = Math.floor(expiresIn / 3600);
  const minutes = Math.floor((expiresIn % 3600) / 60);
  const seconds = expiresIn % 60;
  
  return { hours, minutes, seconds };
};
```

## Configuration

### Environment Variables
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
SITE_URL=https://your-domain.com
SITE_NAME=Your App Name
```

### Cache File Location
```
server/daily-tips-cache.json
```

## Monitoring

### Health Checks
- Monitor cache statistics via `/stats` endpoint
- Track error rates and fallback usage
- Monitor API response times

### Logging
- Cache hits/misses
- API generation success/failure
- Automatic refresh events
- Manual refresh requests

## Testing

### Unit Tests
Run the daily tips API tests:
```bash
npm test -- dailyTips.test.ts
```

### Manual Testing
```bash
# Test cached endpoint
curl http://localhost:5000/api/chatbot/daily-tip/cached

# Test fresh endpoint
curl http://localhost:5000/api/chatbot/daily-tip/fresh

# Check cache stats
curl http://localhost:5000/api/chatbot/daily-tip/stats

# Force refresh (POST)
curl -X POST http://localhost:5000/api/chatbot/daily-tip/refresh
```

## Deployment Considerations

### File Permissions
Ensure the server can write to the cache file location:
```bash
chmod 644 daily-tips-cache.json
```

### Process Persistence
The automatic refresh scheduler requires the server process to remain running. Consider using:
- PM2 for process management
- Docker containers with restart policies
- Kubernetes deployments with proper health checks

### Scaling
For multiple server instances:
- Use Redis for shared cache storage
- Implement distributed locks for cache updates
- Consider load balancer sticky sessions

## Security

### API Key Management
- Store OpenRouter API key in environment variables
- Use secure key rotation practices
- Monitor API usage and costs

### Rate Limiting
- Built-in OpenRouter rate limiting
- Consider additional application-level rate limiting
- Monitor for abuse patterns

## Changelog

### Version 1.0.0
- Initial implementation with file-based caching
- Automatic midnight refresh
- Fresh tip endpoint
- Rich markdown support
- Comprehensive error handling
- Full test coverage
