const mongoose = require('mongoose');

const EmailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  verificationToken: {
    type: String,
    required: true,
    unique: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userType: {
    type: String,
    enum: ['Student', 'Faculty'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Maximum 5 verification attempts
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Document expires after 24 hours (86400 seconds)
  },
  resendCount: {
    type: Number,
    default: 0,
    max: 3 // Maximum 3 resend attempts
  },
  lastResendAt: {
    type: Date,
    default: null
  }
});

// Index for faster queries
EmailVerificationSchema.index({ email: 1, verificationToken: 1 });
EmailVerificationSchema.index({ userId: 1, userType: 1 });
EmailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Method to check if verification code matches
EmailVerificationSchema.methods.isValidCode = function(inputCode) {
  return this.verificationCode === inputCode.toString().toUpperCase();
};

// Method to check if verification token matches
EmailVerificationSchema.methods.isValidToken = function(inputToken) {
  return this.verificationToken === inputToken;
};

// Method to verify email
EmailVerificationSchema.methods.verify = function() {
  this.isVerified = true;
  this.verifiedAt = new Date();
  return this.save();
};

// Static method to generate verification code
EmailVerificationSchema.statics.generateVerificationCode = function() {
  // Generate 6-digit verification code
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Static method to find verification by token or code
EmailVerificationSchema.statics.findByTokenOrCode = function(identifier, email) {
  return this.findOne({
    email: email.toLowerCase(),
    $or: [
      { verificationToken: identifier },
      { verificationCode: identifier.toUpperCase() }
    ],
    isVerified: false
  });
};

// Static method to clean up expired verifications
EmailVerificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
};

module.exports = mongoose.model('EmailVerification', EmailVerificationSchema);
