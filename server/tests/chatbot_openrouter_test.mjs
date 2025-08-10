import axios from 'axios';

const API_URL = 'http://localhost:3000/api/chatbot/chat';
const DAILY_TIP_URL = 'http://localhost:3000/api/chatbot/daily-tip';

const testQueries = [
  {
    name: 'Introduction',
    query: 'Hello, can you introduce yourself briefly?',
  },
  {
    name: 'DevServe Info',
    query: 'What is DevServe and what services does it offer?',
  },
  {
    name: 'Tech Question',
    query: 'What are the benefits of using React for web development?',
  },
  {
    name: 'Code Help',
    query: 'Write a simple JavaScript function to reverse a string.',
  },
];

const runTests = async () => {
  console.log('🚀 Starting GPT OSS 20B Chatbot Integration Tests via OpenRouter');
  console.log('=' .repeat(60));

  // Test chat completion endpoint
  for (const test of testQueries) {
    console.log(`\n📝 Testing: ${test.name}`);
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(API_URL, {
        messages: [{ role: 'user', content: test.query }],
      });
      
      const endTime = Date.now();
      const latency = (endTime - startTime) / 1000;
      
      console.log(`⏱️  Response time: ${latency.toFixed(2)} seconds`);
      
      if (response.status === 200 && response.data) {
        const content = response.data.content || response.data.message?.content;
        
        if (content) {
          console.log('📢 Response:');
          console.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
          console.log('✅ Test Passed');
        } else {
          console.error('❌ Test Failed: No content in response');
          console.error(response.data);
        }
      } else {
        console.error('❌ Test Failed: Invalid response format');
        console.error(response.data);
      }
    } catch (error) {
      const endTime = Date.now();
      const latency = (endTime - startTime) / 1000;
      
      console.error(`❌ Error after ${latency.toFixed(2)} seconds`);
      
      if (axios.isAxiosError(error)) {
        console.error(`Status: ${error.response?.status}`);
        console.error('Response:', error.response?.data);
      } else {
        console.error('Unexpected error:', error.message);
      }
    }
  }

  // Test daily tip endpoint
  console.log('\n📝 Testing: Daily AI Tip Endpoint');
  console.log('-'.repeat(40));
  
  const tipStartTime = Date.now();
  
  try {
    const response = await axios.get(DAILY_TIP_URL);
    const tipEndTime = Date.now();
    const tipLatency = (tipEndTime - tipStartTime) / 1000;
    
    console.log(`⏱️  Response time: ${tipLatency.toFixed(2)} seconds`);
    
    if (response.status === 200 && response.data) {
      const content = response.data.content || response.data.message?.content;
      
      if (content) {
        console.log('📢 Daily Tip:');
        console.log(content);
        console.log('✅ Daily Tip Test Passed');
      } else {
        console.error('❌ Daily Tip Test Failed: No content in response');
      }
    }
  } catch (error) {
    console.error('❌ Daily Tip Test Failed:', error.message);
  }

  // Test conversation context
  console.log('\n📝 Testing: Multi-turn Conversation');
  console.log('-'.repeat(40));
  
  const conversation = [
    { role: 'user', content: 'My name is Alex.' },
    { role: 'assistant', content: 'Nice to meet you, Alex! How can I help you today?' },
    { role: 'user', content: 'What is my name?' },
  ];
  
  try {
    const response = await axios.post(API_URL, {
      messages: conversation,
    });
    
    if (response.status === 200 && response.data) {
      const content = response.data.content || response.data.message?.content;
      
      if (content && content.toLowerCase().includes('alex')) {
        console.log('✅ Conversation Context Test Passed - Bot remembered the name');
      } else {
        console.log('⚠️  Bot might not have retained context');
      }
      console.log('Response:', content);
    }
  } catch (error) {
    console.error('❌ Conversation Test Failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 All tests completed!');
  console.log('\n💡 Note: Make sure OPENROUTER_API_KEY is set in your .env file');
};

// Run the tests
runTests().then(() => process.exit(0)).catch(() => process.exit(1));
