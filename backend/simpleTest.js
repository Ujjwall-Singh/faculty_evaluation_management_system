const http = require('http');

const postData = JSON.stringify({
  token: "fa73c7be485e1c2ad3c3e9f66876556895ba0466ba5c4e7ce33291a55197379a",
  email: "ujjwalraj95083@gmail.com"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/email-verification/verify-token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing email verification with Node.js HTTP...');
console.log('📤 Request:', options);

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log('📥 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('📋 Parsed response:', parsed);
    } catch (e) {
      console.log('⚠️ Could not parse JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e);
});

req.write(postData);
req.end();
