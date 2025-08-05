const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting student profile migration...');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Get existing Student model without strict validation
const StudentMigration = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));

const migrateStudents = async () => {
  try {
    console.log('Fetching existing students...');
    
    // Find all students
    const students = await StudentMigration.find({});
    console.log(`Found ${students.length} existing students`);
    
    let updatedCount = 0;
    
    for (let student of students) {
      let needsUpdate = false;
      const updates = {};
      
      // Check and add missing required fields with default values
      if (!student.admissionNo) {
        // Create a shorter temporary admission number (max 15 chars)
        const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
        const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 random chars
        updates.admissionNo = `T${timestamp}${randomStr}`; // T + 8 digits + 4 chars = 13 chars total
        updates.needsProfileCompletion = true;
        needsUpdate = true;
        console.log(`Adding temporary admission number for student: ${student.email || student.username}`);
      }
      
      if (!student.universityRollNo) {
        // Create shorter temporary roll number (6-25 digits)
        const timestamp = Date.now().toString().slice(-10); // Last 10 digits
        updates.universityRollNo = timestamp;
        updates.needsProfileCompletion = true;
        needsUpdate = true;
        console.log(`Adding temporary roll number for student: ${student.email || student.username}`);
      }
      
      if (!student.semester) {
        updates.semester = '1st'; // Default to 1st semester
        updates.needsProfileCompletion = true;
        needsUpdate = true;
        console.log(`Adding default semester for student: ${student.email || student.username}`);
      }
      
      if (!student.section) {
        updates.section = 'Section A'; // Default to Section A
        updates.needsProfileCompletion = true;
        needsUpdate = true;
        console.log(`Adding default section for student: ${student.email || student.username}`);
      }
      
      // Ensure username is set if missing
      if (!student.username && student.name) {
        updates.username = student.name;
        needsUpdate = true;
      } else if (!student.username && student.email) {
        updates.username = student.email.split('@')[0];
        needsUpdate = true;
      }
      
      // Add profile completion flag
      if (needsUpdate) {
        updates.isLegacyAccount = true; // Mark as legacy account
        updates.profileNeedsUpdate = true;
        updates.lastUpdated = new Date();
        
        await StudentMigration.updateOne(
          { _id: student._id },
          { $set: updates }
        );
        
        updatedCount++;
        console.log(`✅ Updated student: ${student.email || student.username}`);
      } else {
        console.log(`✓ Student already complete: ${student.email || student.username}`);
      }
    }
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total students: ${students.length}`);
    console.log(`🔄 Students updated: ${updatedCount}`);
    console.log(`✅ Students already complete: ${students.length - updatedCount}`);
    
    if (updatedCount > 0) {
      console.log(`\n⚠️  Important Notes:`);
      console.log(`• ${updatedCount} students have temporary academic data`);
      console.log(`• These students should update their profiles after logging in`);
      console.log(`• Temporary admission numbers start with "TEMP"`);
      console.log(`• All legacy accounts are marked with isLegacyAccount: true`);
    }
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await connectDB();
    await migrateStudents();
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
runMigration();
