import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaGraduationCap, 
  FaStar, 
  FaComments, 
  FaEdit,
  FaBookOpen,
  FaExclamationTriangle,
  FaSave,
  FaHistory
} from 'react-icons/fa';

const EditReviewModal = ({ review, faculty, onClose, onUpdate }) => {
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
    overallEvaluation: 5,
    adminNotes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [hasChanges, setHasChanges] = useState(false);

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

  // Populate form with review data when component mounts
  useEffect(() => {
    if (review) {
      const initialData = {
        studentName: review.studentName || '',
        admissionNo: review.admissionNo || '',
        branchSemester: review.branchSemester || '',
        teacherName: review.teacherName || '',
        teacherSubject: review.teacherSubject || '',
        teacherDepartment: review.teacherDepartment || '',
        ratings: {
          teachingQuality: 5,
          communicationSkills: 5,
          subjectKnowledge: 5,
          punctuality: 5,
          studentSupport: 5,
          classroomManagement: 5,
          assessmentMethods: 5,
          innovation: 5,
          ...(review.ratings || {})
        },
        suggestions: review.suggestions || '',
        overallEvaluation: review.overallEvaluation || 5,
        adminNotes: review.adminNotes || ''
      };
      setFormData(initialData);
    }
  }, [review]);

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
      setCurrentTab('basic');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(review._id, formData);
    } catch (error) {
      console.error('Error updating review:', error);
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
    
    setHasChanges(true);
    
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
    
    setHasChanges(true);
    
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
    setHasChanges(true);
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

  const resetForm = () => {
    if (review) {
      setFormData({
        studentName: review.studentName || '',
        admissionNo: review.admissionNo || '',
        branchSemester: review.branchSemester || '',
        teacherName: review.teacherName || '',
        teacherSubject: review.teacherSubject || '',
        teacherDepartment: review.teacherDepartment || '',
        ratings: review.ratings || {},
        suggestions: review.suggestions || '',
        overallEvaluation: review.overallEvaluation || 5,
        adminNotes: review.adminNotes || ''
      });
      setHasChanges(false);
      setErrors({});
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="enhanced-modal edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2>
              <FaEdit className="header-icon" />
              Edit Review
            </h2>
            <div className="review-meta">
              <span className="review-id">ID: {review?._id?.slice(-6)}</span>
              <span className="review-date">
                <FaHistory />
                {new Date(review?.createdAt || review?._id).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            type="button"
            onClick={() => setCurrentTab('basic')}
            className={`tab ${currentTab === 'basic' ? 'active' : ''}`}
          >
            <FaUser /> Basic Info
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('ratings')}
            className={`tab ${currentTab === 'ratings' ? 'active' : ''}`}
          >
            <FaStar /> Ratings
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('feedback')}
            className={`tab ${currentTab === 'feedback' ? 'active' : ''}`}
          >
            <FaComments /> Feedback
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('admin')}
            className={`tab ${currentTab === 'admin' ? 'active' : ''}`}
          >
            <FaEdit /> Admin Notes
          </button>
        </div>

        {hasChanges && (
          <div className="changes-indicator">
            <FaExclamationTriangle />
            You have unsaved changes
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Tab */}
          {currentTab === 'basic' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Student Information</h3>
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
                <h3>Teacher Information</h3>
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

          {/* Ratings Tab */}
          {currentTab === 'ratings' && (
            <div className="tab-content">
              <div className="ratings-section">
                <h3>Detailed Ratings</h3>
                <p>Rate the teacher on various aspects (1-5 stars)</p>
                
                <div className="ratings-grid">
                  {Object.entries(ratingCategories).map(([key, label]) => (
                    <div key={key} className="rating-item">
                      <div className="rating-label">
                        <span className="rating-title">{label}</span>
                        <span className="rating-value">{formData.ratings[key] || 5}/5</span>
                      </div>
                      {renderStars(formData.ratings[key] || 5, handleRatingChange, key)}
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
            </div>
          )}

          {/* Feedback Tab */}
          {currentTab === 'feedback' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Student Feedback</h3>
                <div className="form-group">
                  <label htmlFor="suggestions">
                    <FaComments /> Feedback & Suggestions *
                  </label>
                  <textarea
                    id="suggestions"
                    name="suggestions"
                    value={formData.suggestions}
                    onChange={handleChange}
                    placeholder="Detailed feedback about the teacher's performance, teaching methods, and suggestions for improvement..."
                    rows={8}
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
              </div>
            </div>
          )}

          {/* Admin Notes Tab */}
          {currentTab === 'admin' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Admin Notes</h3>
                <p>Internal notes and observations about this review</p>
                <div className="form-group">
                  <label htmlFor="adminNotes">
                    <FaEdit /> Admin Notes
                  </label>
                  <textarea
                    id="adminNotes"
                    name="adminNotes"
                    value={formData.adminNotes}
                    onChange={handleChange}
                    placeholder="Add internal notes, observations, or action items related to this review..."
                    rows={6}
                  />
                  <div className="admin-note-info">
                    <small>These notes are only visible to administrators and will not be shown to students or faculty.</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="modal-footer">
            <div className="footer-actions">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={!hasChanges}
              >
                Reset Changes
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Review
                  </>
                )}
              </button>
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

export default EditReviewModal;
