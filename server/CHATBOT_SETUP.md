# Chatbot Integration Setup Guide

## 🎉 Integration Complete!
The chatbot has been successfully integrated with GPT OSS 20B through the OpenRouter API. 

## ✅ What's Been Done
- ✅ Removed all LM Studio/Qwen3 code and dependencies
- ✅ Integrated OpenRouter API with OpenAI SDK
- ✅ Created beautiful chatbot UI with floating action button
- ✅ Added proper error handling for missing API keys
- ✅ Configured multi-turn conversation support
- ✅ Set up environment variables structure

## Configuration

### 1. Get your OpenRouter API Key
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Navigate to [API Keys](https://openrouter.ai/keys)
3. Create a new API key
4. Copy the key for use in the next step

### 2. Configure Environment Variables

Update the `server/.env` file with your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
SITE_URL=http://localhost:5173  # Update for production
SITE_NAME=DevServe  # Your application name
```

For production, update `SITE_URL` to your actual domain.

## Running the Application

### Start the Backend Server
```bash
cd server
npm install  # If not already installed
npm run dev
```
The server will run on `http://localhost:8000`

### Start the Frontend Client
Open a new terminal:
```bash
cd client
npm install  # If not already installed
npm run dev
```
The client will run on `http://localhost:5173`

## Testing the Chatbot

### Manual Testing
1. Open your browser to `http://localhost:5173`
2. Click the chat icon in the bottom-right corner
3. Type a message and press Enter or click Send
4. The bot should respond instantly using GPT OSS 20B

### Automated Testing
Run the integration tests:
```bash
cd server
node tests/chatbot_openrouter_test.mjs
```

## Features

### Chatbot UI Component
- **Location**: `client/src/components/chatbot/Chatbot.tsx`
- Floating chat window with message history
- User and assistant message bubbles
- Loading animations
- Timestamp display
- Dark mode support

### Floating Action Button
- **Location**: `client/src/components/chatbot/ChatbotFAB.tsx`
- Animated chat button with notification indicator
- Toggles chatbot visibility

### Backend API Endpoints

#### POST `/api/chatbot/chat`
Send messages to the chatbot:
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

#### GET `/api/chatbot/daily-tip`
Get a daily AI tip (used on the homepage)

## Architecture

### Backend
- **OpenAI Client**: `server/src/lib/openai.ts` - Configured OpenRouter client
- **API Handlers**: `server/src/api/chatbot.ts` - Chat completion logic
- **Routes**: `server/src/routes/chatbot.ts` - Express routes

### Frontend
- **Chatbot Component**: Full chat interface with message history
- **ChatbotFAB**: Floating action button to toggle chat
- **Integration**: Added to `App.tsx` for global availability

## Model Information

Currently configured to use `openai/gpt-4o-mini` through OpenRouter. To use GPT OSS 20B specifically:

1. Check available models at [OpenRouter Models](https://openrouter.ai/models)
2. Find the exact model ID for GPT OSS 20B
3. Update the model in `server/src/api/chatbot.ts`:
```typescript
model: 'gpt-oss/gpt-4o-20b', // Replace with actual model ID
```

## Troubleshooting

### API Key Issues
- Ensure your OpenRouter API key is valid
- Check that the `.env` file is properly formatted
- Verify the API key has sufficient credits

### CORS Issues
- The backend is configured to accept requests from `http://localhost:5173`
- For production, update CORS settings in `server/src/app.ts`

### Connection Errors
- Ensure both backend and frontend servers are running
- Check that ports 8000 and 5173 are not in use
- Verify your internet connection for OpenRouter API access

## Removed Components
The following LM Studio/Qwen3 related files have been removed:
- `server/tests/qwen3_integration_test.md`
- `server/tests/chatbot_test.mjs`

## Next Steps
1. Add your OpenRouter API key to `.env`
2. Test the chatbot locally
3. Customize the chatbot's appearance and behavior
4. Deploy to production with updated environment variables
5. Consider implementing:
   - Message persistence in database
   - User authentication for chat history
   - Rate limiting per user
   - Custom system prompts for specialized assistance
