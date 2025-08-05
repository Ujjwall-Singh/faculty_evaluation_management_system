// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const morgan = require('morgan');
// const facultyRoute = require('./routes/facultyLogin');
// require('dotenv').config();

// // Initialize Express App
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());
// app.use(morgan('dev')); // Log requests to the console

// // Environment Variable Check
// if (!process.env.MONGO_URI) {
//   console.error('Error: MONGO_URI is not set in the environment variables');
//   process.exit(1);
// }

// // Database Connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('Failed to connect to MongoDB:', err.message);
//     process.exit(1); // Exit the process with failure
//   }
// };

// // Routes
// app.use('/api/review', require('./routes/review'));
// app.use('/api/signup', require('./routes/signup'));
// app.use('/api/login', require('./routes/login'));
// app.use('/api/facultylogin', facultyRoute);
// app.use('/api/adminlogin', require('./routes/adminLogin'));
// app.use('/api/faculty', require('./routes/faculty'));

// // Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   connectDB(); // Connect to the database after the server starts
// });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const facultyRoute = require('./routes/facultyLogin');
require('dotenv').config();
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(express.json());

// Enhanced CORS configuration for production security
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      'https://fems-live.vercel.app',
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200 // For legacy browser support
}));

app.use(morgan('dev')); // Log requests

// Enhanced preflight handling
app.options('*', cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://fems-live.vercel.app',
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200
}));

// MongoDB Connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return true;
  }

  const mongoUri = process.env.MONGO_URI;
  console.log('MONGO_URI exists:', !!mongoUri);
  console.log('MONGO_URI length:', mongoUri ? mongoUri.length : 0);
  
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not set in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
    return false;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string preview:', mongoUri.substring(0, 20) + '...');
    
    const options = {
      serverSelectionTimeoutMS: 15000, // Increased timeout for serverless
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    };
    
    await mongoose.connect(mongoUri, options);
    isConnected = true;
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.error('Error details:', err);
    isConnected = false;
    return false;
  }
};

// Force connection on startup
connectDB().then(success => {
  console.log('Initial connection attempt:', success ? 'SUCCESS' : 'FAILED');
}).catch(err => {
  console.error('Initial connection error:', err.message);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    database: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host
    }
  });
});

// Debug endpoint for environment variables
app.get('/debug-env', (req, res) => {
  res.json({
    mongoUriExists: !!process.env.MONGO_URI,
    mongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    nodeEnv: process.env.NODE_ENV,
    adminEmail: process.env.ADMIN_EMAIL,
    availableVars: Object.keys(process.env).filter(key => 
      key.includes('MONGO') || key.includes('ADMIN') || key.includes('PORT')
    )
  });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    // Force reconnection if needed
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    // Test a simple database operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ 
      status: 'Database working', 
      collections: collections.map(c => c.name),
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database test failed', 
      details: error.message,
      connectionState: mongoose.connection.readyState
    });
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'FEMS Backend API is running!', 
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health',
      '/debug-env', 
      '/test-db',
      '/api/adminlogin',
      '/api/facultylogin',
      '/api/login',
      '/api/signup',
      '/api/faculty',
      '/api/review'
    ]
  });
});

app.use('/api/review', require('./routes/review'));
app.use('/api/signup', require('./routes/signup'));
app.use('/api/login', require('./routes/login'));
app.use('/api/facultylogin', facultyRoute);
app.use('/api/adminlogin', require('./routes/adminLogin'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/student', require('./routes/student'));
app.use('/api/student-profile', require('./routes/studentProfile'));
app.use('/api/admin', require('./routes/admin')); // Admin routes enabled

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app;
module.exports.handler = serverless(app);
