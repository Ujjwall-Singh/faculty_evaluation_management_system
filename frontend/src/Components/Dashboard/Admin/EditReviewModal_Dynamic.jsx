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
  FaSchool,
  FaLayerGroup,
  FaHistory,
  FaInfoCircle,
  FaCalendarAlt
} from 'react-icons/fa';
import './ReviewList.css';

const EditReviewModal = ({ review, faculty, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    admissionNo: '',
    branch: '',
    semester: '',
    section: '',
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
  const [activeTab, setActiveTab] = useState('basic');

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

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

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

  useEffect(() => {
    if (review) {
      // Parse branch semester string to extract individual components
      const branchSemesterParts = review.branchSemester?.split(' - ') || [];
      const branch = branchSemesterParts[0] || '';
      const semesterPart = branchSemesterParts[1] || '';
      const sectionPart = branchSemesterParts[2] || '';
      
      const semester = semesterPart.replace(' Semester', '');
      const section = sectionPart.replace('Section ', '');

      setFormData({
        studentName: review.studentName || '',
        admissionNo: review.admissionNo || '',
        branch: branch,
        semester: semester,
        section: section,
        teacherName: review.teacherName || '',
        teacherSubject: review.teacherSubject || '',
        teacherDepartment: review.teacherDepartment || '',
        ratings: review.ratings || {
          teachingQuality: 5,
          communicationSkills: 5,
          subjectKnowledge: 5,
          punctuality: 5,
          studentSupport: 5,
          classroomManagement: 5,
          assessmentMethods: 5,
          innovation: 5
        },
        suggestions: review.suggestions || '',
        overallEvaluation: review.overallEvaluation || 5
      });
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

    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }

    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    }

    if (!formData.section) {
      newErrors.section = 'Section is required';
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
      setActiveTab('basic');
      return;
    }

    setLoading(true);
    try {
      // Combine branch and semester for compatibility
      const reviewData = {
        ...formData,
        branchSemester: `${formData.branch} - ${formData.semester} Semester - Section ${formData.section}`
      };
      await onUpdate(review._id, reviewData);
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
      <div className="star-rating-input">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(category, star)}
            className={`star-btn ${star <= rating ? 'active' : ''}`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dynamic-modal large" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-dynamic">
          <div className="header-content">
            <div className="header-title">
              <FaEdit className="header-icon" />
              <div>
                <h2>Edit Review</h2>
                <p>Review ID: {review?._id}</p>
              </div>
            </div>
            <div className="review-meta">
              <div className="meta-item">
                <FaCalendarAlt />
                <span>Created: {review?.createdAt ? formatDate(review.createdAt) : 'N/A'}</span>
              </div>
              {review?.updatedAt && review.updatedAt !== review.createdAt && (
                <div className="meta-item">
                  <FaHistory />
                  <span>Updated: {formatDate(review.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <FaUser />
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'ratings' ? 'active' : ''}`}
            onClick={() => setActiveTab('ratings')}
          >
            <FaStar />
            Ratings
          </button>
          <button
            className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <FaComments />
            Feedback
          </button>
          <button
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FaInfoCircle />
            Review Info
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="tab-content">
              <div className="form-sections">
                {/* Student Information */}
                <div className="form-section">
                  <div className="section-header">
                    <h4>
                      <FaUser />
                      Student Details
                    </h4>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="studentName">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        placeholder="Enter full name"
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
                        Admission Number *
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

                  <div className="form-grid three-col">
                    <div className="form-group">
                      <label htmlFor="branch">
                        <FaSchool />
                        Branch *
                      </label>
                      <select
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        className={errors.branch ? 'error' : ''}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))}
                      </select>
                      {errors.branch && (
                        <span className="error-message">
                          <FaExclamationTriangle /> {errors.branch}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="semester">
                        <FaGraduationCap />
                        Semester *
                      </label>
                      <select
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        className={errors.semester ? 'error' : ''}
                      >
                        <option value="">Select Semester</option>
                        {semesters.map(sem => (
                          <option key={sem} value={sem}>
                            {sem} Semester
                          </option>
                        ))}
                      </select>
                      {errors.semester && (
                        <span className="error-message">
                          <FaExclamationTriangle /> {errors.semester}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="section">
                        <FaLayerGroup />
                        Section *
                      </label>
                      <select
                        id="section"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        className={errors.section ? 'error' : ''}
                      >
                        <option value="">Select Section</option>
                        {sections.map(section => (
                          <option key={section} value={section}>
                            Section {section}
                          </option>
                        ))}
                      </select>
                      {errors.section && (
                        <span className="error-message">
                          <FaExclamationTriangle /> {errors.section}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teacher Information */}
                <div className="form-section">
                  <div className="section-header">
                    <h4>
                      <FaUser />
                      Teacher Details
                    </h4>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="teacherName">
                        Teacher Name *
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
                        <FaBookOpen />
                        Subject
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
                      <FaSchool />
                      Department
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
            </div>
          )}

          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div className="tab-content">
              <div className="ratings-container">
                <div className="ratings-grid-modern">
                  {Object.entries(ratingCategories).map(([key, label]) => (
                    <div key={key} className="rating-card">
                      <div className="rating-info">
                        <h5>{label}</h5>
                        <div className="rating-score">
                          <span className="score">{formData.ratings[key]}</span>
                          <span className="max">/5</span>
                        </div>
                      </div>
                      <div className="rating-input">
                        {renderStars(formData.ratings[key], handleRatingChange, key)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overall-evaluation">
                  <div className="overall-card">
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
                      <div className="overall-score">
                        <span className="score">{formData.overallEvaluation}</span>
                        <span className="max">/5</span>
                      </div>
                      <div className="overall-label">
                        {formData.overallEvaluation >= 4.5 ? 'Excellent' :
                         formData.overallEvaluation >= 3.5 ? 'Good' :
                         formData.overallEvaluation >= 2.5 ? 'Average' :
                         formData.overallEvaluation >= 1.5 ? 'Below Average' : 'Poor'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="tab-content">
              <div className="feedback-section">
                <div className="form-group">
                  <label htmlFor="suggestions">
                    <FaComments />
                    Feedback & Suggestions *
                  </label>
                  <textarea
                    id="suggestions"
                    name="suggestions"
                    value={formData.suggestions}
                    onChange={handleChange}
                    placeholder="Please provide detailed feedback about the teacher's performance, teaching methods, communication skills, and any suggestions for improvement..."
                    rows={10}
                    className={errors.suggestions ? 'error' : ''}
                  />
                  <div className="textarea-footer">
                    <span className={`char-count ${formData.suggestions.length < 10 ? 'warning' : ''}`}>
                      {formData.suggestions.length} characters (minimum 10 required)
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

          {/* Review Information Tab */}
          {activeTab === 'info' && (
            <div className="tab-content">
              <div className="review-info-section">
                <div className="info-cards">
                  <div className="info-card">
                    <h4>Review Metadata</h4>
                    <div className="info-items">
                      <div className="info-item">
                        <label>Review ID:</label>
                        <span>{review?._id}</span>
                      </div>
                      <div className="info-item">
                        <label>Created:</label>
                        <span>{review?.createdAt ? formatDate(review.createdAt) : 'N/A'}</span>
                      </div>
                      {review?.updatedAt && review.updatedAt !== review.createdAt && (
                        <div className="info-item">
                          <label>Last Updated:</label>
                          <span>{formatDate(review.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-card">
                    <h4>Current Review Summary</h4>
                    <div className="info-items">
                      <div className="info-item">
                        <label>Student:</label>
                        <span>{formData.studentName || 'Not specified'}</span>
                      </div>
                      <div className="info-item">
                        <label>Admission No:</label>
                        <span>{formData.admissionNo || 'Not specified'}</span>
                      </div>
                      <div className="info-item">
                        <label>Academic Info:</label>
                        <span>
                          {formData.branch ? formData.branch : 'Not specified'} 
                          {formData.semester ? ` - ${formData.semester} Semester` : ''} 
                          {formData.section ? ` - Section ${formData.section}` : ''}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Teacher:</label>
                        <span>{formData.teacherName || 'Not selected'}</span>
                      </div>
                      <div className="info-item">
                        <label>Department:</label>
                        <span>{formData.teacherDepartment || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Overall Rating:</label>
                        <div className="rating-summary">
                          <div className="summary-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                              <FaStar
                                key={star}
                                className={`star ${star <= formData.overallEvaluation ? 'filled' : 'empty'}`}
                              />
                            ))}
                          </div>
                          <span className="summary-score">{formData.overallEvaluation}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="modal-footer-dynamic">
            <div className="footer-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Updating Review...
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
