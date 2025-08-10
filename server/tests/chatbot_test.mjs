import axios from 'axios';

const API_URL = 'http://localhost:3000/api/chat';

const testQueries = [
  {
    name: 'Introduction',
    query: 'Hello, can you introduce yourself?',
  },
  {
    name: 'Summarize Blog Post',
    query: 'Summarize the latest blog post from DevServe in 3 sentences.',
  },
  {
    name: 'Explain DevServe',
    query: 'Explain what DevServe does in simple terms.',
  },
  {
    name: 'Website Performance Tips',
    query: "Give me three tips to improve a website's performance.",
  },
];

const runTests = async () => {
  console.log('--- Starting Chatbot Integration Tests ---');

  for (const test of testQueries) {
    console.log(`
--- Testing: ${test.name} ---`);
    const startTime = Date.now();
    try {
      const response = await axios.post(API_URL, {
        messages: [{ role: 'user', content: test.query }],
      });
      const endTime = Date.now();
      const latency = (endTime - startTime) / 1000;
      console.log(`Response received in ${latency.toFixed(2)} seconds.`);

      if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        console.log('Response:');
        console.log(content);
        if (content.includes('placeholder') || content.includes('debug')) {
          console.error('** Test Failed: Response contains placeholder or debug text. **');
        } else {
          console.log('** Test Passed **');
        }
      } else {
        console.error('** Test Failed: Invalid response format. **');
        console.error(response.data);
      }
    } catch (error) {
      const endTime = Date.now();
      const latency = (endTime - startTime) / 1000;
      console.error(`Error after ${latency.toFixed(2)} seconds.`);
      if (axios.isAxiosError(error)) {
        console.error('** Test Failed: API request failed. **');
        console.error(`Status: ${error.response?.status}`);
        console.error('Response Data:', error.response?.data);
      } else {
        console.error('** Test Failed: An unexpected error occurred. **');
        console.error(error);
      }
    }
  }

  console.log('
--- Testing Error Handling ---');
  console.log('Please disconnect the LM Studio API now, then press Enter to continue.');

  process.stdin.once('data', async () => {
    console.log('
--- Sending query to disconnected API... ---');
    const startTime = Date.now();
    try {
      await axios.post(API_URL, {
        messages: [{ role: 'user', content: 'This should fail.' }],
      });
    } catch (error) {
      const endTime = Date.now();
      const latency = (endTime - startTime) / 1000;
      console.error(`Error after ${latency.toFixed(2)} seconds.`);
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        console.log('** Error Handling Test Passed: Received expected 500 error. **');
        console.log('Response Data:', error.response?.data);
      } else {
        console.error('** Error Handling Test Failed: Did not receive expected 500 error. **');
        if (axios.isAxiosError(error)) {
          console.error(`Status: ${error.response?.status}`);
          console.error('Response Data:', error.response?.data);
        } else {
          console.error(error);
        }
      }
    }
    process.exit();
  });
};

runTests();