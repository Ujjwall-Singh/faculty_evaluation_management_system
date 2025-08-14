const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
require('dotenv').config();

async function verifyAllFaculty() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Force verify all faculty
    console.log('\n=== Verifying ALL faculty for testing ===');
    const result = await Faculty.updateMany(
      {}, // Update all faculty
      { 
        $set: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          status: 'approved', // Also approve them for testing
          approvedAt: new Date()
        }
      }
    );
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    // Check updated results
    const verifiedFaculty = await Faculty.find(
      { isEmailVerified: true }, 
      'email name isEmailVerified status department'
    );
    console.log(`\n=== Now ${verifiedFaculty.length} faculty are verified and approved ===`);
    
    if (verifiedFaculty.length < 10) {
      verifiedFaculty.forEach((faculty, index) => {
        console.log(`${index + 1}. ${faculty.name} (${faculty.email}) - ${faculty.department} - Status: ${faculty.status}`);
      });
    } else {
      console.log('First 5 verified faculty:');
      verifiedFaculty.slice(0, 5).forEach((faculty, index) => {
        console.log(`${index + 1}. ${faculty.name} (${faculty.email}) - ${faculty.department} - Status: ${faculty.status}`);
      });
      console.log(`... and ${verifiedFaculty.length - 5} more`);
    }

    mongoose.connection.close();
    console.log('\n✅ All faculty are now verified and approved for testing!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAllFaculty();
