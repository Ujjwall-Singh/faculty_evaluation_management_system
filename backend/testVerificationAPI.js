// Test email verification API directly
const axios = require('axios');

async function testVerificationAPI() {
  try {
    console.log('🧪 Testing Email Verification API...');
    
    const email = 'ujjwalraj95083@gmail.com';
    const token = 'fa73c7be485e1c2ad3c3e9f66876556895ba0466ba5c4e7ce33291a55197379a';
    
    console.log('📤 Sending verification request:');
    console.log('Email:', email);
    console.log('Token:', token);
    
    const response = await axios.post('http://localhost:5000/api/email-verification/verify-token', {
      email: email,
      token: token
    });
    
    console.log('✅ Verification successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Verification failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Network Error:', error.message);
    }
  }
}

testVerificationAPI();
