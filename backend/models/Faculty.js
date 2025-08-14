const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  department: { type: String, required: true },
  subject: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Faculty' },
  
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
  
  // Approval System Fields
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  
  // Additional Information
  qualification: { type: String, trim: true },
  experience: { type: String, trim: true },
  specialization: { type: String, trim: true },
  employeeId: { type: String, unique: true, sparse: true, trim: true },
  
  // Security Fields
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for better query performance
FacultySchema.index({ email: 1, status: 1 });
FacultySchema.index({ department: 1, status: 1 });

// Virtual for account lock status
FacultySchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to check if faculty is approved and email verified
FacultySchema.methods.canLogin = function() {
  return this.status === 'approved' && this.isEmailVerified && !this.isLocked;
};

// Method to check if faculty is approved
FacultySchema.methods.isApproved = function() {
  return this.status === 'approved';
};

// Method to approve faculty
FacultySchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = null;
  this.updatedAt = new Date();
  return this.save();
};

// Method to reject faculty
FacultySchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.rejectionReason = reason;
  this.approvedAt = null;
  this.updatedAt = new Date();
  return this.save();
};

// Method to verify email
FacultySchema.methods.verifyEmail = function() {
  this.isEmailVerified = true;
  this.emailVerificationToken = null;
  this.emailVerificationExpires = null;
  this.updatedAt = new Date();
  return this.save();
};

// Method to increment login attempts
FacultySchema.methods.incLoginAttempts = function() {
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
FacultySchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Static method to find by email with all necessary checks
FacultySchema.statics.findForLogin = function(email) {
  return this.findOne({ 
    email: email.toLowerCase(),
    isEmailVerified: true
  });
};

module.exports = mongoose.model('Faculty', FacultySchema);
