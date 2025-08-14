const express = require('express');
const router = express.Router();
const EmailVerification = require('../models/EmailVerification');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const ValidationService = require('../utils/validationService');
const emailService = require('../utils/emailService');

// Verify email with token or code
router.post('/verify', async (req, res) => {
  try {
    const { email, token, code } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!token && !code) {
      return res.status(400).json({ error: 'Verification token or code is required' });
    }

    // Validate email format
    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: emailValidation.errors 
      });
    }

    const validatedEmail = emailValidation.email;

    // Find verification record
    const verification = await EmailVerification.findByTokenOrCode(
      token || code,
      validatedEmail
    );

    if (!verification) {
      return res.status(404).json({ 
        error: 'Invalid or expired verification token/code',
        message: 'Please request a new verification email'
      });
    }

    // Check if already verified
    if (verification.isVerified) {
      return res.status(400).json({ 
        error: 'Email already verified',
        message: 'You can now login with your credentials'
      });
    }

    // Check attempts limit
    if (verification.attempts >= 5) {
      return res.status(429).json({ 
        error: 'Too many verification attempts',
        message: 'Please request a new verification email'
      });
    }

    // Validate token/code
    const isValid = token ? 
      verification.isValidToken(token) : 
      verification.isValidCode(code);

    if (!isValid) {
      // Increment attempts
      verification.attempts += 1;
      await verification.save();

      return res.status(400).json({ 
        error: 'Invalid verification token/code',
        attemptsLeft: Math.max(0, 5 - verification.attempts),
        message: 'Please check your email for the correct verification code'
      });
    }

    // Find user and verify email
    let user;
    if (verification.userType === 'Faculty') {
      user = await Faculty.findById(verification.userId);
    } else {
      user = await Student.findById(verification.userId);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify email for both user and verification record
    await user.verifyEmail();
    await verification.verify();

    // Send welcome email for students (faculty needs admin approval first)
    if (verification.userType === 'Student') {
      try {
        await emailService.sendWelcomeEmail(
          validatedEmail,
          user.username || user.name,
          'Student'
        );
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    res.json({
      success: true,
      message: verification.userType === 'Faculty' 
        ? 'Email verified successfully! Your account is now pending admin approval.'
        : 'Email verified successfully! You can now login to your account.',
      userType: verification.userType,
      nextSteps: verification.userType === 'Faculty' 
        ? [
            'Your email has been verified',
            'Your account is pending admin approval',
            'You will receive an email once approved',
            'After approval, you can login to your dashboard'
          ]
        : [
            'Your email has been verified',
            'You can now login with your credentials',
            'Complete your profile after login',
            'Start using the evaluation system'
          ]
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      details: error.message 
    });
  }
});

// Resend verification email
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: emailValidation.errors 
      });
    }

    const validatedEmail = emailValidation.email;

    // Find existing verification record
    const existingVerification = await EmailVerification.findOne({
      email: validatedEmail,
      isVerified: false
    }).sort({ createdAt: -1 }); // Get the latest one

    if (!existingVerification) {
      return res.status(404).json({ 
        error: 'No pending verification found for this email',
        message: 'Please signup first or this email is already verified'
      });
    }

    // Check resend limit
    if (existingVerification.resendCount >= 3) {
      return res.status(429).json({ 
        error: 'Maximum resend limit reached',
        message: 'Please contact support for assistance'
      });
    }

    // Check resend cooldown (5 minutes)
    if (existingVerification.lastResendAt) {
      const timeSinceLastResend = Date.now() - existingVerification.lastResendAt.getTime();
      const cooldownTime = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastResend < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - timeSinceLastResend) / 1000 / 60);
        return res.status(429).json({ 
          error: 'Please wait before requesting another verification email',
          message: `You can resend in ${remainingTime} minute(s)`
        });
      }
    }

    // Find user to get name
    let user;
    if (existingVerification.userType === 'Faculty') {
      user = await Faculty.findById(existingVerification.userId);
    } else {
      user = await Student.findById(existingVerification.userId);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new code (keep same token)
    const newCode = EmailVerification.generateVerificationCode();
    existingVerification.verificationCode = newCode;
    existingVerification.resendCount += 1;
    existingVerification.lastResendAt = new Date();
    existingVerification.attempts = 0; // Reset attempts
    await existingVerification.save();

    // Send verification email
    await emailService.sendEmailVerification(
      validatedEmail,
      user.name || user.username,
      existingVerification.verificationToken,
      newCode
    );

    res.json({
      success: true,
      message: 'Verification email sent successfully!',
      resendCount: existingVerification.resendCount,
      maxResends: 3,
      cooldownMinutes: 5
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      error: 'Failed to resend verification email',
      details: error.message 
    });
  }
});

// Check verification status
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Validate email format
    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: emailValidation.errors 
      });
    }

    const validatedEmail = emailValidation.email;

    // Check verification status
    const verification = await EmailVerification.findOne({
      email: validatedEmail
    }).sort({ createdAt: -1 });

    if (!verification) {
      return res.status(404).json({ 
        error: 'No verification record found',
        message: 'Please signup first'
      });
    }

    // Check user verification status
    let user;
    if (verification.userType === 'Faculty') {
      user = await Faculty.findById(verification.userId).select('isEmailVerified status');
    } else {
      user = await Student.findById(verification.userId).select('isEmailVerified isActive');
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      email: validatedEmail,
      isVerified: verification.isVerified && user.isEmailVerified,
      userType: verification.userType,
      attempts: verification.attempts,
      maxAttempts: 5,
      resendCount: verification.resendCount,
      maxResends: 3,
      canResend: verification.resendCount < 3,
      verifiedAt: verification.verifiedAt,
      ...(verification.userType === 'Faculty' && {
        approvalStatus: user.status,
        requiresApproval: user.status !== 'approved'
      })
    });

  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({ 
      error: 'Failed to check verification status',
      details: error.message 
    });
  }
});

// Verify email with token (from email link)
router.post('/verify-token', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    console.log('Token verification request:', { 
      email: email ? 'provided' : 'missing',
      token: token ? 'provided' : 'missing',
      tokenLength: token ? token.length : 0
    });

    if (!email || !token) {
      return res.status(400).json({ 
        error: 'Email and token are required' 
      });
    }

    // Validate email format
    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.isValid) {
      console.log('Email validation failed:', emailValidation.errors);
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: emailValidation.errors 
      });
    }

    const validatedEmail = emailValidation.email;
    console.log('Looking for user with email:', validatedEmail);

    // Find user and update verification status
    let user = await Faculty.findOne({ 
      email: validatedEmail,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    let userType = 'Faculty';
    
    if (!user) {
      console.log('Faculty not found, checking students...');
      user = await Student.findOne({ 
        email: validatedEmail,
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });
      userType = 'Student';
    }

    if (!user) {
      console.log('No user found with valid token');
      // Let's check if user exists but token is expired or wrong
      let existingUser = await Faculty.findOne({ email: validatedEmail });
      if (!existingUser) {
        existingUser = await Student.findOne({ email: validatedEmail });
      }
      
      if (existingUser) {
        console.log('User exists but token mismatch:', {
          userToken: existingUser.emailVerificationToken,
          providedToken: token,
          tokenExpires: existingUser.emailVerificationExpires,
          isExpired: existingUser.emailVerificationExpires < Date.now()
        });
      }
      
      return res.status(400).json({ 
        error: 'Invalid or expired verification token',
        message: 'Please request a new verification email'
      });
    }

    if (user.isEmailVerified) {
      console.log('Email already verified');
      return res.json({
        success: true,
        message: 'Email already verified. You can now login.',
        alreadyVerified: true
      });
    }

    console.log('Verifying email for user:', user.name || user.username);
    // Verify email
    await user.verifyEmail();
    console.log('Email verified successfully');

    res.json({
      success: true,
      message: `Email verified successfully! Your ${userType.toLowerCase()} account is now active.`,
      userType: userType
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: 'Please try again or request a new verification email',
      details: error.message
    });
  }
});

// Verify email with code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        error: 'Email and verification code are required' 
      });
    }

    // Validate email format
    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: emailValidation.errors 
      });
    }

    const validatedEmail = emailValidation.email;

    // Find verification record
    const verification = await EmailVerification.findOne({ 
      email: validatedEmail,
      verificationCode: code.toUpperCase(),
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification code',
        message: 'Please check your code or request a new one'
      });
    }

    if (verification.isVerified) {
      return res.json({
        success: true,
        message: 'Email already verified. You can now login.',
        alreadyVerified: true
      });
    }

    // Find user and verify email
    let user = await Faculty.findOne({ email: validatedEmail });
    let userType = 'Faculty';
    
    if (!user) {
      user = await Student.findOne({ email: validatedEmail });
      userType = 'Student';
    }

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No account found with this email address'
      });
    }

    // Verify email and mark verification as used
    await user.verifyEmail();
    verification.isVerified = true;
    verification.verifiedAt = new Date();
    await verification.save();

    res.json({
      success: true,
      message: `Email verified successfully! Your ${userType.toLowerCase()} account is now active.`,
      userType: userType
    });

  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: 'Please try again or request a new verification code'
    });
  }
});

// Clean up expired verifications (admin endpoint)
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await EmailVerification.cleanupExpired();
    res.json({
      success: true,
      message: 'Expired verifications cleaned up',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      error: 'Failed to cleanup expired verifications',
      details: error.message 
    });
  }
});

module.exports = router;
