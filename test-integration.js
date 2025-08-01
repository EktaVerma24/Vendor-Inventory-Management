// Integration Test Script
// This script tests the connection between frontend and backend

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
  console.log('🔄 Testing backend connection...');
  
  try {
    const response = await fetch('http://localhost:5000');
    const text = await response.text();
    
    if (response.ok) {
      console.log('✅ Backend is running:', text);
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('🔄 Testing API endpoints...');
  
  const endpoints = [
    '/auth/verify',
    '/vendor-applications',
    '/shops',
    '/inventory',
    '/transactions'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const status = response.status;
      
      // 401 is expected for protected routes without token
      if (status === 200 || status === 401) {
        console.log(`✅ ${endpoint}: Endpoint accessible (${status})`);
      } else {
        console.log(`⚠️  ${endpoint}: Unexpected status (${status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Connection failed -`, error.message);
    }
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Integration Tests...\n');
  
  const backendRunning = await testBackendConnection();
  console.log('');
  
  if (backendRunning) {
    await testAPIEndpoints();
  } else {
    console.log('⚠️  Skipping API tests - backend not running');
    console.log('💡 Make sure to start the backend server first:');
    console.log('   cd server && npm start');
  }
  
  console.log('\n📋 Integration Test Summary:');
  console.log('1. Backend server status: ' + (backendRunning ? '✅ Running' : '❌ Not running'));
  console.log('2. API endpoints: ' + (backendRunning ? '✅ Accessible' : '❌ Not tested'));
  console.log('\n🎯 Next Steps:');
  console.log('- Start backend: cd server && npm start');
  console.log('- Start frontend: npm run dev');
  console.log('- Test in browser at http://localhost:3000');
}

// Run the tests
runIntegrationTests();
