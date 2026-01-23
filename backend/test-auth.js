import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

async function test() {
  try {
    console.log('📝 Testing Registration...');
    const registerRes = await API.post('/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      currency: 'USD'
    });
    console.log('✅ Registration successful:', registerRes.data);

    const { token, user } = registerRes.data;

    console.log('\n🔐 Testing Login...');
    const loginRes = await API.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginRes.data);

    console.log('\n👤 Testing Get Current User...');
    const meRes = await API.get('/auth/me', {
      headers: { Authorization: `Bearer ${loginRes.data.token}` }
    });
    console.log('✅ Get current user successful:', meRes.data);

  } catch (error) {
    if (error.response) {
      console.error('❌ Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ No response:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

test();
