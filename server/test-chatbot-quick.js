/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
// Quick test script to verify chatbot API is responding
// Run with: node test-chatbot-quick.js

const http = require('http');

// Test daily tip endpoint
const testDailyTip = () => {
  console.log('Testing Daily AI Tip endpoint...');
  
  http.get('http://localhost:8000/api/chatbot/daily-tip', (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Status:', res.statusCode);
      
      if (res.statusCode === 500 && response.error?.includes('not configured')) {
        console.log('✓ API is working but needs OpenRouter API key configuration');
        console.log('Message:', response.content || response.error);
      } else if (res.statusCode === 200) {
        console.log('✓ API is working with valid OpenRouter key!');
        console.log('AI Tip:', response.content);
      } else {
        console.log('✗ Unexpected response:', response);
      }
    });
  }).on('error', (err) => {
    console.log('✗ Server is not running or not accessible');
    console.log('Error:', err.message);
    console.log('\nMake sure the server is running with: cd server && npm run dev');
  });
};

// Test chat endpoint
const testChat = () => {
  console.log('\nTesting Chat endpoint...');
  
  const postData = JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }]
  });
  
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/chatbot/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Status:', res.statusCode);
      
      if (res.statusCode === 500 && response.error?.includes('not configured')) {
        console.log('✓ Chat API is working but needs OpenRouter API key configuration');
        console.log('Message:', response.error);
      } else if (res.statusCode === 200) {
        console.log('✓ Chat API is working with valid OpenRouter key!');
        console.log('Response:', response.content);
      } else {
        console.log('✗ Unexpected response:', response);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log('✗ Server is not running or not accessible');
    console.log('Error:', err.message);
  });
  
  req.write(postData);
  req.end();
};

console.log('🤖 Chatbot API Quick Test\n');
console.log('This test verifies that the chatbot endpoints are responding correctly.');
console.log('If you see "not configured" messages, you need to add your OpenRouter API key.\n');

// Run tests
testDailyTip();
setTimeout(testChat, 1000);
