import axiosInstance from './utils/axiosConfig';

// Test backend connectivity
export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Test root endpoint
    const healthResponse = await axiosInstance.get('/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test a specific API endpoint
    const adminTestResponse = await axiosInstance.post('/api/adminlogin', {
      email: 'test@test.com',
      password: 'test123'
    });
    
    return {
      success: true,
      health: healthResponse.data,
      message: 'Backend is reachable'
    };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    
    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        error: 'Network Error - Backend server is not reachable',
        details: error.message
      };
    } else if (error.response) {
      return {
        success: false,
        error: `Server responded with ${error.response.status}`,
        details: error.response.data
      };
    } else {
      return {
        success: false,
        error: 'Unknown connection error',
        details: error.message
      };
    }
  }
};

// Call this function when app starts
if (process.env.NODE_ENV === 'development') {
  testBackendConnection().then(result => {
    console.log('Backend connection test result:', result);
  });
}
