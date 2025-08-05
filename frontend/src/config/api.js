// API configuration with environment variable support
let API_BASE_URL = process.env.REACT_APP_API_URL || 'https://fems-livebackend.vercel.app';

// Remove trailing slash if present to avoid double slash issues
API_BASE_URL = API_BASE_URL.replace(/\/$/, '');

// Debug logging
console.log('API_BASE_URL being used:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('Environment variable REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export default API_BASE_URL;
