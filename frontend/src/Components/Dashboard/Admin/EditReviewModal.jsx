import React from 'react';
import EnhancedFacultyEvaluationSystem from './EnhancedFacultyEvaluationSystem';

// Integration wrapper that acts as a drop-in replacement for EditReviewModal
const EditReviewModal = (props) => {
  // This is a compatibility layer for any existing code that expects EditReviewModal
  // Redirect to the new Enhanced Faculty Evaluation System
  console.warn('EditReviewModal is deprecated. Use EnhancedFacultyEvaluationSystem directly.');
  return <EnhancedFacultyEvaluationSystem {...props} />;
};

export default EditReviewModal;
export { EnhancedFacultyEvaluationSystem };