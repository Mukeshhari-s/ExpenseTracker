import http from 'http';

const API_URL = 'http://localhost:5000';

// Test health endpoint
function testHealthEndpoint() {
  console.log('Testing API health endpoint...');
  
  http.get(`${API_URL}/api/health`, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Health check passed:', response);
      } catch (error) {
        console.log('❌ Health check failed:', error.message);
      }
    });
  }).on('error', (err) => {
    console.log('❌ Cannot connect to server. Make sure backend is running on port 5000');
    console.log('   Run: cd backend && npm run dev');
  });
}

// Run test
testHealthEndpoint();
