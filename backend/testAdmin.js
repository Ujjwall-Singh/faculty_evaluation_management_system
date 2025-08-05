const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Faculty_Evaluation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testAdmin = async () => {
  try {
    console.log('Testing admin connection...');
    
    // Check if admin exists
    const admin = await Admin.findOne({ email: 'nnikhill2004@gmail.com' });
    
    if (admin) {
      console.log('Admin user found:');
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('Role:', admin.role);
    } else {
      console.log('Admin user not found');
      
      // List all admins
      const allAdmins = await Admin.find();
      console.log('All admins in database:', allAdmins);
    }
    
  } catch (error) {
    console.error('Error testing admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

testAdmin(); 