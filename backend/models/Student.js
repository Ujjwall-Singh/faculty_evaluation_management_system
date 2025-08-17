const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  // Authentication fields
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Student' },
  
  // Email Verification Fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  
  // Academic Information
  admissionNo: { 
    type: String, 
    required: function() {
      // Only required for new accounts (not legacy accounts)
      return !this.isLegacyAccount;
    }, 
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return !this.isNew || this.isLegacyAccount; // Allow empty for legacy accounts
        // Allow temporary admission numbers (starting with T) to have digits after T
        if (v.startsWith('T') && this.isLegacyAccount) {
          return v.length >= 8 && v.length <= 15;
        }
        return /^[A-Z0-9]{8,15}$/.test(v); // Alphanumeric, 8-15 characters
      },
      message: 'Admission number must be 8-15 alphanumeric characters'
    }
  },
  universityRollNo: { 
    type: String, 
    required: function() {
      // Only required for new accounts (not legacy accounts)
      return !this.isLegacyAccount;
    }, 
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return !this.isNew || this.isLegacyAccount; // Allow empty for legacy accounts
        return /^\d{6,25}$/.test(v); // Digits only, 6-25 characters
      },
      message: 'University roll number must be 6-25 digits'
    }
  },
  semester: {
    type: String,
    required: function() {
      // Only required for new accounts (not legacy accounts)
      return !this.isLegacyAccount;
    },
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'],
    validate: {
      validator: function(v) {
        if (!v) return !this.isNew || this.isLegacyAccount; // Allow empty for legacy accounts
        return ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].includes(v);
      },
      message: 'Semester must be between 1st and 8th'
    }
  },
  section: {
    type: String,
    required: function() {
      // Only required for new accounts (not legacy accounts)
      return !this.isLegacyAccount;
    },
    enum: ['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Super60', 'Uniques'],
    validate: {
      validator: function(v) {
        if (!v) return !this.isNew || this.isLegacyAccount; // Allow empty for legacy accounts
        return ['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Super60', 'Uniques'].includes(v);
      },
      message: 'Section must be one of: Section A, Section B, Section C, Section D, Section E, Super60, or Uniques'
    }
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: false,
    trim: true,
    maxLength: [100, 'Full name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    required: false,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        const today = new Date();
        const age = today.getFullYear() - v.getFullYear();
        return age >= 16 && age <= 50; // Reasonable age range for students
      },
      message: 'Date of birth must represent an age between 16 and 50 years'
    }
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[+]?[\d\s-()]{10,15}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  
  // Academic Details
  department: {
    type: String,
    required: false,
    enum: [
      'Computer Science',
      'Information Technology', 
      'Electronics & Communication',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Chemical Engineering',
      'Biotechnology',
      'Mathematics',
      'Physics',
      'Chemistry',
      'English',
      'Economics',
      'Management',
      'Other'
    ]
  },
  course: {
    type: String,
    required: false,
    enum: ['B.Tech', 'B.E', 'B.Sc', 'B.A', 'B.Com', 'M.Tech', 'M.E', 'M.Sc', 'M.A', 'M.Com', 'MBA', 'MCA', 'PhD', 'Other']
  },
  batch: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^\d{4}-\d{4}$/.test(v); // Format: 2020-2024
      },
      message: 'Batch must be in format YYYY-YYYY (e.g., 2020-2024)'
    }
  },
  
  // Address Information
  address: {
    street: { type: String, trim: true, maxLength: 100 },
    city: { type: String, trim: true, maxLength: 50 },
    state: { type: String, trim: true, maxLength: 50 },
    pincode: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^\d{6}$/.test(v); // Indian pincode format
        },
        message: 'Pincode must be 6 digits'
      }
    },
    country: { type: String, trim: true, default: 'India', maxLength: 50 }
  },
  
  // Guardian Information
  guardianInfo: {
    name: { type: String, trim: true, maxLength: 100 },
    relationship: { 
      type: String, 
      enum: ['Father', 'Mother', 'Guardian', 'Other'],
      default: 'Father'
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^[+]?[\d\s-()]{10,15}$/.test(v);
        },
        message: 'Please enter a valid guardian phone number'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid guardian email address'
      }
    }
  },
  
  // Academic Performance
  currentCGPA: {
    type: Number,
    min: [0, 'CGPA cannot be negative'],
    max: [10, 'CGPA cannot exceed 10'],
    default: 0
  },
  
  // System fields
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String, // URL or base64 string
    default: ''
  },
  
  // Privacy settings
  privacySettings: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showAddress: { type: Boolean, default: false }
  },
  
  // Legacy account support
  isLegacyAccount: {
    type: Boolean,
    default: false
  },
  needsProfileCompletion: {
    type: Boolean,
    default: false
  },
  profileNeedsUpdate: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for full address
StudentSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, pincode, country } = this.address;
  return [street, city, state, pincode, country].filter(Boolean).join(', ');
});

// Virtual field for age calculation
StudentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual field for academic year
StudentSchema.virtual('academicYear').get(function() {
  if (!this.batch) return null;
  return this.batch;
});

// Virtual field for semester progress
StudentSchema.virtual('semesterProgress').get(function() {
  const semesterNumber = parseInt(this.semester);
  return {
    current: semesterNumber,
    total: 8,
    percentage: Math.round((semesterNumber / 8) * 100)
  };
});

// Method to calculate profile completeness
StudentSchema.methods.calculateProfileCompleteness = function() {
  const requiredFields = [
    'username', 'email', 'admissionNo', 'universityRollNo', 'semester', 'section',
    'fullName', 'dateOfBirth', 'phoneNumber', 'department', 'course'
  ];
  
  const optionalFields = [
    'address.street', 'address.city', 'address.state', 'address.pincode',
    'guardianInfo.name', 'guardianInfo.phoneNumber', 'batch'
  ];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  // Check required fields
  requiredFields.forEach(field => {
    if (this[field] && this[field].toString().trim() !== '') {
      completedRequired++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const fieldParts = field.split('.');
    let value = this;
    
    for (const part of fieldParts) {
      value = value?.[part];
    }
    
    if (value && value.toString().trim() !== '') {
      completedOptional++;
    }
  });
  
  // Calculate completeness (70% weight for required, 30% for optional)
  const requiredPercentage = (completedRequired / requiredFields.length) * 70;
  const optionalPercentage = (completedOptional / optionalFields.length) * 30;
  
  this.profileCompleteness = Math.round(requiredPercentage + optionalPercentage);
  return this.profileCompleteness;
};

// Method to check if student can login
StudentSchema.methods.canLogin = function() {
  return this.isEmailVerified && this.isActive && !this.isLocked;
};

// Method to verify email
StudentSchema.methods.verifyEmail = function() {
  this.isEmailVerified = true;
  this.emailVerificationToken = null;
  this.emailVerificationExpires = null;
  this.updatedAt = new Date();
  return this.save();
};

// Method to increment login attempts
StudentSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we're at max attempts and not already locked, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // Lock for 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
StudentSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Method to get student summary
StudentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.fullName || this.username,
    admissionNo: this.admissionNo,
    universityRollNo: this.universityRollNo,
    semester: this.semester,
    section: this.section,
    department: this.department,
    course: this.course,
    email: this.email,
    isEmailVerified: this.isEmailVerified,
    profileCompleteness: this.profileCompleteness,
    isActive: this.isActive
  };
};

// Pre-save middleware to calculate profile completeness
StudentSchema.pre('save', function(next) {
  this.calculateProfileCompleteness();
  next();
});

// Indexes for better query performance (excluding fields that already have unique: true)
// admissionNo, universityRollNo, and email already have unique indexes, so we don't duplicate them
StudentSchema.index({ semester: 1, department: 1 });
StudentSchema.index({ semester: 1, section: 1 });
StudentSchema.index({ department: 1, section: 1 });
StudentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Student', StudentSchema);
