const validator = require('validator');

class ValidationService {
  
  // Email domain whitelist for educational institutions
  static ALLOWED_DOMAINS = [
    // Common educational domains
    'edu', 'ac.in', 'edu.in', 'ernet.in',
    // University-specific domains (add your institution domains here)
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', // Remove these in production
    // Add your college/university domains
    'college.edu', 'university.edu', 'institute.ac.in'
  ];

  // Validate email format and domain
  static validateEmail(email) {
    const result = {
      isValid: false,
      errors: []
    };

    // Basic email format validation
    if (!email || typeof email !== 'string') {
      result.errors.push('Email is required');
      return result;
    }

    // Trim and lowercase
    email = email.trim().toLowerCase();

    // Check email format using validator
    if (!validator.isEmail(email)) {
      result.errors.push('Please provide a valid email address format');
      return result;
    }

    // Check email length
    if (email.length > 254) {
      result.errors.push('Email address is too long');
      return result;
    }

    // Extract domain
    const domain = email.split('@')[1];
    
    // Check if domain is in allowed list
    const isDomainAllowed = this.ALLOWED_DOMAINS.some(allowedDomain => {
      return domain === allowedDomain || domain.endsWith('.' + allowedDomain);
    });

    if (!isDomainAllowed) {
      result.errors.push(`Email domain '${domain}' is not allowed. Please use an institutional email address.`);
      return result;
    }

    // Check for suspicious patterns
    if (this.hasSuspiciousPatterns(email)) {
      result.errors.push('Email address contains suspicious patterns');
      return result;
    }

    result.isValid = true;
    result.email = email;
    return result;
  }

  // Check for suspicious email patterns
  static hasSuspiciousPatterns(email) {
    const suspiciousPatterns = [
      /\d{10,}/, // Too many consecutive digits
      /(.)\1{4,}/, // Same character repeated 5+ times
      /^[a-z]{1,2}@/, // Very short local part
      /\+.*\+/, // Multiple plus signs
      /\.{2,}/, // Multiple consecutive dots
      /^\./, // Starts with dot
      /\.$/, // Ends with dot
    ];

    return suspiciousPatterns.some(pattern => pattern.test(email));
  }

  // Validate password strength
  static validatePassword(password) {
    const result = {
      isValid: false,
      errors: [],
      strength: 'weak'
    };

    if (!password) {
      result.errors.push('Password is required');
      return result;
    }

    // Length check (reduced for development)
    if (password.length < 6) {
      result.errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 128) {
      result.errors.push('Password is too long (maximum 128 characters)');
    }

    // Simplified character variety checks for development - REMOVED COMPLEXITY REQUIREMENT
    const checks = {
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    // REMOVED - No complexity requirement, only length check
    // if (passedChecks < 2) {
    //   result.errors.push('Password must contain at least 2 of the following: lowercase letters, uppercase letters, numbers, special characters');
    // }

    // Only check for extremely weak passwords (commented out for development)
    const extremelyWeakPatterns = [
      /^(.)\1+$/, // All same character like "aaaaa"
      // /^(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/, // Sequential numbers
      // /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/, // Sequential letters
      // /password|123456|qwerty|admin|login|user/i // Common weak passwords (disabled for development)
    ];

    if (extremelyWeakPatterns.some(pattern => pattern.test(password))) {
      result.errors.push('Password is too simple - avoid using all same characters');
    }

    // Determine strength
    if (result.errors.length === 0) {
      if (passedChecks >= 4 && password.length >= 12) {
        result.strength = 'strong';
      } else if (passedChecks >= 3 && password.length >= 8) {
        result.strength = 'medium';
      }
      result.isValid = true;
    }

    return result;
  }

  // Validate name
  static validateName(name) {
    const result = {
      isValid: false,
      errors: []
    };

    if (!name || typeof name !== 'string') {
      result.errors.push('Name is required');
      return result;
    }

    name = name.trim();

    if (name.length < 2) {
      result.errors.push('Name must be at least 2 characters long');
      return result;
    }

    if (name.length > 100) {
      result.errors.push('Name is too long (maximum 100 characters)');
      return result;
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
      result.errors.push('Name can only contain letters, spaces, hyphens, apostrophes, and periods');
      return result;
    }

    // Check for suspicious patterns
    if (/(.)\1{3,}/.test(name)) {
      result.errors.push('Name contains suspicious character repetition');
      return result;
    }

    result.isValid = true;
    result.name = name;
    return result;
  }

  // Validate phone number (Lenient for development)
  static validatePhone(phone) {
    const result = {
      isValid: false,
      errors: []
    };

    if (!phone) {
      // Make phone optional for development
      result.isValid = true;
      result.phone = '';
      return result;
    }

    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');

    // Lenient length check
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      result.errors.push('Phone number must be between 8-15 digits');
      return result;
    }

    // For development - accept any reasonable phone number pattern
    // Comment out strict Indian mobile validation for now
    /*
    const indianMobilePattern = /^[6-9]\d{9}$/;
    if (cleanPhone.length === 10 && !indianMobilePattern.test(cleanPhone)) {
      result.errors.push('Please provide a valid Indian mobile number');
      return result;
    }
    */

    // Check for suspicious patterns (only extremely obvious ones)
    if (/(\d)\1{8,}/.test(cleanPhone)) {
      result.errors.push('Phone number contains too many repeated digits');
      return result;
    }

    result.isValid = true;
    result.phone = cleanPhone;
    return result;
  }

  // Validate admission number
  static validateAdmissionNumber(admissionNo) {
    const result = {
      isValid: false,
      errors: []
    };

    if (!admissionNo) {
      result.errors.push('Admission number is required');
      return result;
    }

    admissionNo = admissionNo.trim().toUpperCase();

    // Check length
    if (admissionNo.length < 8 || admissionNo.length > 15) {
      result.errors.push('Admission number must be between 8-15 characters');
      return result;
    }

    // Check format (alphanumeric)
    if (!/^[A-Z0-9]+$/.test(admissionNo)) {
      result.errors.push('Admission number can only contain letters and numbers');
      return result;
    }

    result.isValid = true;
    result.admissionNo = admissionNo;
    return result;
  }

  // Validate university roll number
  static validateUniversityRollNo(rollNo) {
    const result = {
      isValid: false,
      errors: []
    };

    if (!rollNo) {
      result.errors.push('University roll number is required');
      return result;
    }

    rollNo = rollNo.trim();

    // Check if it's all digits
    if (!/^\d+$/.test(rollNo)) {
      result.errors.push('University roll number must contain only digits');
      return result;
    }

    // Check length
    if (rollNo.length < 6 || rollNo.length > 25) {
      result.errors.push('University roll number must be between 6-25 digits');
      return result;
    }

    result.isValid = true;
    result.rollNo = rollNo;
    return result;
  }

  // Comprehensive validation for user registration
  static validateRegistration(userData, userType) {
    const errors = [];
    const validatedData = {};

    // Validate email
    const emailValidation = this.validateEmail(userData.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    } else {
      validatedData.email = emailValidation.email;
    }

    // Validate name
    const nameValidation = this.validateName(userData.name || userData.username);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      validatedData.name = nameValidation.name;
    }

    // Validate password
    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Validate phone
    if (userData.phone || userData.phoneNumber) {
      const phoneValidation = this.validatePhone(userData.phone || userData.phoneNumber);
      if (!phoneValidation.isValid) {
        errors.push(...phoneValidation.errors);
      } else {
        validatedData.phone = phoneValidation.phone;
      }
    }

    // Student-specific validations
    if (userType === 'Student') {
      if (userData.admissionNo) {
        const admissionValidation = this.validateAdmissionNumber(userData.admissionNo);
        if (!admissionValidation.isValid) {
          errors.push(...admissionValidation.errors);
        } else {
          validatedData.admissionNo = admissionValidation.admissionNo;
        }
      }

      if (userData.universityRollNo) {
        const rollNoValidation = this.validateUniversityRollNo(userData.universityRollNo);
        if (!rollNoValidation.isValid) {
          errors.push(...rollNoValidation.errors);
        } else {
          validatedData.universityRollNo = rollNoValidation.rollNo;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      validatedData: validatedData
    };
  }

  // Rate limiting check
  static checkRateLimit(attempts, timeWindow = 15 * 60 * 1000) { // 15 minutes
    const now = Date.now();
    const recentAttempts = attempts.filter(attempt => (now - attempt) < timeWindow);
    
    return {
      isAllowed: recentAttempts.length < 5, // Max 5 attempts in 15 minutes
      attemptsLeft: Math.max(0, 5 - recentAttempts.length),
      resetTime: recentAttempts.length > 0 ? new Date(recentAttempts[0] + timeWindow) : null
    };
  }
}

module.exports = ValidationService;
