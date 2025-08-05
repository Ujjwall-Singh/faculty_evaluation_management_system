import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaGraduationCap, 
  FaStar, 
  FaComments, 
  FaPlus,
  FaBookOpen,
  FaExclamationTriangle,
  FaSave
} from 'react-icons/fa';

const AddReviewModal = ({ faculty, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    admissionNo: '',
    branchSemester: '',
    teacherName: '',
    teacherSubject: '',
    teacherDepartment: '',
    ratings: {
      teachingQuality: 5,
      communicationSkills: 5,
      subjectKnowledge: 5,
      punctuality: 5,
      studentSupport: 5,
      classroomManagement: 5,
      assessmentMethods: 5,
      innovation: 5
    },
    suggestions: '',
    overallEvaluation: 5
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology'
  ];

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const ratingCategories = {
    teachingQuality: 'Teaching Quality',
    communicationSkills: 'Communication Skills',
    subjectKnowledge: 'Subject Knowledge',
    punctuality: 'Punctuality',
    studentSupport: 'Student Support',
    classroomManagement: 'Classroom Management',
    assessmentMethods: 'Assessment Methods',
    innovation: 'Innovation & Creativity'
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.admissionNo.trim()) {
      newErrors.admissionNo = 'Admission number is required';
    }

    if (!formData.branchSemester) {
      newErrors.branchSemester = 'Branch and semester is required';
    }

    if (!formData.teacherName) {
      newErrors.teacherName = 'Teacher is required';
    }

    if (!formData.suggestions.trim()) {
      newErrors.suggestions = 'Feedback is required';
    }

    if (formData.suggestions.trim().length < 10) {
      newErrors.suggestions = 'Feedback must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setCurrentStep(1); // Go back to first step if validation fails
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: rating
      }
    }));
    
    // Calculate overall evaluation as average of all ratings
    const newRatings = { ...formData.ratings, [category]: rating };
    const avgRating = Object.values(newRatings).reduce((a, b) => a + b, 0) / Object.values(newRatings).length;
    setFormData(prev => ({
      ...prev,
      overallEvaluation: Math.round(avgRating * 10) / 10
    }));
  };

  const handleTeacherChange = (e) => {
    const teacherName = e.target.value;
    setFormData(prev => ({
      ...prev,
      teacherName,
      teacherSubject: teacherName ? faculty.find(f => f.name === teacherName)?.subject || '' : '',
      teacherDepartment: teacherName ? faculty.find(f => f.name === teacherName)?.department || '' : ''
    }));
  };

  const renderStars = (rating, onRatingChange, category) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(category, star)}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="enhanced-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2>
              <FaPlus className="header-icon" />
              Add New Review
            </h2>
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Student & Teacher Information */}
          {currentStep === 1 && (
            <div className="form-step">
              <div className="step-header">
                <h3>
                  <FaUser className="step-icon" />
                  Student & Teacher Information
                </h3>
                <p>Enter basic information about the student and teacher</p>
              </div>

              <div className="form-section">
                <h4>Student Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="studentName">
                      <FaUser /> Student Name *
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      placeholder="Enter student full name"
                      className={errors.studentName ? 'error' : ''}
                    />
                    {errors.studentName && (
                      <span className="error-message">
                        <FaExclamationTriangle /> {errors.studentName}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="admissionNo">
                      <FaUser /> Admission Number *
                    </label>
                    <input
                      type="text"
                      id="admissionNo"
                      name="admissionNo"
                      value={formData.admissionNo}
                      onChange={handleChange}
                      placeholder="Enter admission number"
                      className={errors.admissionNo ? 'error' : ''}
                    />
                    {errors.admissionNo && (
                      <span className="error-message">
                        <FaExclamationTriangle /> {errors.admissionNo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="branchSemester">
                    <FaGraduationCap /> Branch & Semester *
                  </label>
                  <select
                    id="branchSemester"
                    name="branchSemester"
                    value={formData.branchSemester}
                    onChange={handleChange}
                    className={errors.branchSemester ? 'error' : ''}
                  >
                    <option value="">Select Branch & Semester</option>
                    {branches.map(branch => 
                      semesters.map(semester => (
                        <option key={`${branch}-${semester}`} value={`${branch} - ${semester} Semester`}>
                          {branch} - {semester} Semester
                        </option>
                      ))
                    )}
                  </select>
                  {errors.branchSemester && (
                    <span className="error-message">
                      <FaExclamationTriangle /> {errors.branchSemester}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4>Teacher Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="teacherName">
                      <FaUser /> Teacher Name *
                    </label>
                    <select
                      id="teacherName"
                      name="teacherName"
                      value={formData.teacherName}
                      onChange={handleTeacherChange}
                      className={errors.teacherName ? 'error' : ''}
                    >
                      <option value="">Select Teacher</option>
                      {faculty.map(teacher => (
                        <option key={teacher._id} value={teacher.name}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                    {errors.teacherName && (
                      <span className="error-message">
                        <FaExclamationTriangle /> {errors.teacherName}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="teacherSubject">
                      <FaBookOpen /> Subject
                    </label>
                    <input
                      type="text"
                      id="teacherSubject"
                      name="teacherSubject"
                      value={formData.teacherSubject}
                      readOnly
                      placeholder="Auto-filled when teacher is selected"
                      className="readonly-field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="teacherDepartment">
                    <FaGraduationCap /> Department
                  </label>
                  <input
                    type="text"
                    id="teacherDepartment"
                    name="teacherDepartment"
                    value={formData.teacherDepartment}
                    readOnly
                    placeholder="Auto-filled when teacher is selected"
                    className="readonly-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Detailed Ratings */}
          {currentStep === 2 && (
            <div className="form-step">
              <div className="step-header">
                <h3>
                  <FaStar className="step-icon" />
                  Detailed Ratings
                </h3>
                <p>Rate the teacher on various aspects (1-5 stars)</p>
              </div>

              <div className="ratings-grid">
                {Object.entries(ratingCategories).map(([key, label]) => (
                  <div key={key} className="rating-item">
                    <div className="rating-label">
                      <span className="rating-title">{label}</span>
                      <span className="rating-value">{formData.ratings[key]}/5</span>
                    </div>
                    {renderStars(formData.ratings[key], handleRatingChange, key)}
                  </div>
                ))}
              </div>

              <div className="overall-rating">
                <h4>Overall Evaluation</h4>
                <div className="overall-display">
                  <div className="overall-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FaStar
                        key={star}
                        className={`star ${star <= formData.overallEvaluation ? 'filled' : 'empty'}`}
                      />
                    ))}
                  </div>
                  <span className="overall-number">{formData.overallEvaluation}/5</span>
                  <span className="overall-label">
                    {formData.overallEvaluation >= 4.5 ? 'Excellent' :
                     formData.overallEvaluation >= 3.5 ? 'Good' :
                     formData.overallEvaluation >= 2.5 ? 'Average' :
                     formData.overallEvaluation >= 1.5 ? 'Below Average' : 'Poor'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Feedback */}
          {currentStep === 3 && (
            <div className="form-step">
              <div className="step-header">
                <h3>
                  <FaComments className="step-icon" />
                  Student Feedback
                </h3>
                <p>Provide detailed feedback and suggestions</p>
              </div>

              <div className="form-group">
                <label htmlFor="suggestions">
                  <FaComments /> Feedback & Suggestions *
                </label>
                <textarea
                  id="suggestions"
                  name="suggestions"
                  value={formData.suggestions}
                  onChange={handleChange}
                  placeholder="Please provide detailed feedback about the teacher's performance, teaching methods, and any suggestions for improvement..."
                  rows={6}
                  className={errors.suggestions ? 'error' : ''}
                />
                <div className="textarea-info">
                  <span className={`char-count ${formData.suggestions.length < 10 ? 'warning' : ''}`}>
                    {formData.suggestions.length} characters (minimum 10)
                  </span>
                </div>
                {errors.suggestions && (
                  <span className="error-message">
                    <FaExclamationTriangle /> {errors.suggestions}
                  </span>
                )}
              </div>

              <div className="review-summary">
                <h4>Review Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Student:</label>
                    <span>{formData.studentName}</span>
                  </div>
                  <div className="summary-item">
                    <label>Teacher:</label>
                    <span>{formData.teacherName}</span>
                  </div>
                  <div className="summary-item">
                    <label>Department:</label>
                    <span>{formData.teacherDepartment}</span>
                  </div>
                  <div className="summary-item">
                    <label>Overall Rating:</label>
                    <span className="rating-summary">
                      {formData.overallEvaluation}/5 
                      <div className="summary-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <FaStar
                            key={star}
                            className={`star ${star <= formData.overallEvaluation ? 'filled' : 'empty'}`}
                          />
                        ))}
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="modal-footer">
            <div className="step-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success"
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Adding Review...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Add Review
                    </>
                  )}
                </button>
              )}
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
