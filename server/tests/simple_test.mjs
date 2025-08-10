
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/chat';

const testQuery = {
  name: 'Introduction',
  query: 'Hello, can you introduce yourself?',
};

const runTest = async () => {
  console.log(`--- Testing: ${testQuery.name} ---`);
  try {
    const response = await axios.post(API_URL, {
      messages: [{ role: 'user', content: testQuery.query }],
    });
    if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      console.log('Response:');
      console.log(content);
    } else {
      console.error('Invalid response format.');
      console.error(response.data);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API request failed.');
      console.error(`Status: ${error.response?.status}`);
      console.error('Response Data:', error.response?.data);
    } else {
      console.error('An unexpected error occurred.');
      console.error(error);
    }
  }
};

runTest();
