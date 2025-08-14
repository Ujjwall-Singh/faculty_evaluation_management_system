// Quick test simple password validation
const ValidationService = require('./utils/validationService');

// Test simple passwords
const passwords = [
  'simple',        // 6 chars - should work
  '123456',        // 6 digits - should work  
  'abcdef',        // 6 letters - should work
  '12345',         // 5 chars - should fail
  'verylongpasswordwithoutspecialchars'  // long simple - should work
];

console.log('=== Testing Simplified Password Validation ===\n');

passwords.forEach((password, index) => {
  const result = ValidationService.validatePassword(password);
  console.log(`${index + 1}. Password: "${password}"`);
  console.log(`   Length: ${password.length} chars`);
  console.log(`   Valid: ${result.isValid ? '✅ YES' : '❌ NO'}`);
  if (!result.isValid) {
    console.log(`   Errors: ${result.errors.join(', ')}`);
  }
  console.log('');
});
