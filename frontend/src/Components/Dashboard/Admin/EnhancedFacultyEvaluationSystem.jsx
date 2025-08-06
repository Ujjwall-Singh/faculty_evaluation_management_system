import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaGraduationCap, 
  FaStar, 
  FaComments, 
  FaEdit,
  FaEye,
  FaTrash,
  FaPlus,
  FaSearch,
  FaDownload,
  FaSync,
  FaChalkboardTeacher,
  FaSave,
  FaSchool,
  FaUserGraduate,
  FaIdCard,
  FaFilter,
  FaEnvelope,
  FaChartBar,
  FaAward,
  FaClock
} from 'react-icons/fa';
import './EnhancedFacultyEvaluation.css';

const EnhancedFacultyEvaluationSystem = ({ 
  reviews, 
  faculty, 
  searchTerm: externalSearchTerm = '',
  filterDepartment: externalFilterDepartment = '',
  onUpdate, 
  onDelete, 
  onRefresh,
  loading 
}) => {
  // State Management
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'card'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    section: '',
    branch: '',
    faculty: '',
    rating: '',
    dateRange: 'all'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder] = useState('desc');
  // Removed pagination - showing all reviews in scrollable view

  // Form Data for Edit/Create
  const [formData, setFormData] = useState({
    studentName: '',
    admissionNo: '',
    branchSemester: '',
    teacherName: '',
    teacherSubject: '',
    teacherDepartment: '',
    ratings: {
      conceptExplanation: 3,
      subjectKnowledge: 3,
      contentOrganization: 3,
      classTiming: 3,
      learningEnvironment: 3,
      studentParticipation: 3,
      feedbackQuality: 3,
      resourceUtilization: 3,
      innovation: 3,
      accessibility: 3,
      supportiveness: 3,
      professionalism: 3
    },
    suggestions: '',
    overallEvaluation: 3
  });

  // Student Data Integration
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [enhancedReviews, setEnhancedReviews] = useState([]);
  const [loadingEnhancement, setLoadingEnhancement] = useState(false);

  // Rating Categories with Professional Labels
  const ratingCategories = {
    conceptExplanation: 'Concept Explanation',
    subjectKnowledge: 'Subject Knowledge',
    contentOrganization: 'Content Organization',
    classTiming: 'Class Timing & Punctuality',
    learningEnvironment: 'Learning Environment',
    studentParticipation: 'Student Participation',
    feedbackQuality: 'Feedback Quality',
    resourceUtilization: 'Resource Utilization',
    innovation: 'Innovation & Creativity',
    accessibility: 'Accessibility & Support',
    supportiveness: 'Supportiveness',
    professionalism: 'Professionalism'
  };

  const ratingLabels = {
    1: "Poor", 2: "Below Average", 3: "Average", 4: "Good", 5: "Excellent"
  };

  // Fetch Student Details from Backend
  const fetchStudentDetails = async (admissionNo, studentName) => {
    if (!admissionNo && !studentName) return;
    
    setLoadingStudentDetails(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      let response;
      if (admissionNo) {
        response = await fetch(`${API_BASE_URL}/api/student?admissionNo=${encodeURIComponent(admissionNo)}`);
      } else if (studentName) {
        response = await fetch(`${API_BASE_URL}/api/student?name=${encodeURIComponent(studentName)}`);
      }

      if (response.ok) {
        const data = await response.json();
        if (data.students && data.students.length > 0) {
          const student = data.students[0];
          setStudentDetails(student);
          
          console.log('Student details fetched:', student);
          console.log('Student department:', student.department);
          console.log('Student semester:', student.semester);
          console.log('Student section:', student.section);
          
          // Auto-populate form with backend data
          if (modalMode === 'edit' || modalMode === 'create') {
            // Create detailed branchSemester string
            let branchSemesterString = '';
            
            // Handle department (fallback to a default if undefined)
            const department = student.department || 'Computer Science Engineering';
            const semester = student.semester;
            const section = student.section;
            
            if (department && semester) {
              branchSemesterString = `${department} - ${semester} Semester`;
              if (section) {
                branchSemesterString += ` - ${section}`;
              }
              console.log('Generated branchSemester:', branchSemesterString);
            }
            
            setFormData(prev => ({
              ...prev,
              studentName: student.fullName || student.username || prev.studentName,
              admissionNo: student.admissionNo || prev.admissionNo,
              branchSemester: branchSemesterString || prev.branchSemester
            }));
          }
          
          return student;
        } else {
          setStudentDetails(null);
        }
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      setStudentDetails(null);
    } finally {
      setLoadingStudentDetails(false);
    }
    return null;
  };

  // Enhanced Academic Info Generator
  const generateEnhancedAcademicInfo = (review, studentData = null) => {
    if (studentData) {
      const department = studentData.department || review.branchSemester.split(' - ')[0] || 'Computer Science Engineering';
      const semester = studentData.semester || 'Not Available';
      const section = studentData.section || 'Not Available';
      
      return `${department} - ${semester} Semester - ${section}`;
    }
    
    // If no student data, return original or try to enhance existing data
    if (review.branchSemester && review.branchSemester.includes(' - ') && review.branchSemester.split(' - ').length >= 3) {
      return review.branchSemester; // Already has section info
    }
    
    return review.branchSemester || 'Academic Info Not Available';
  };

  // Helper functions to extract filter data
  const extractBranchFromAcademicInfo = (academicInfo) => {
    if (!academicInfo) return '';
    const parts = academicInfo.split(' - ');
    return parts[0] || '';
  };

  const extractSemesterFromAcademicInfo = (academicInfo) => {
    if (!academicInfo) return '';
    const parts = academicInfo.split(' - ');
    if (parts.length >= 2) {
      return parts[1].replace(' Semester', '').trim();
    }
    return '';
  };

  const extractSectionFromAcademicInfo = (academicInfo) => {
    if (!academicInfo) return '';
    const parts = academicInfo.split(' - ');
    if (parts.length >= 3) {
      return parts[2].trim();
    }
    return '';
  };

  // Enhance Reviews with Student Data
  const enhanceReviewsWithStudentData = useCallback(async () => {
    if (!reviews || reviews.length === 0) return;
    
    setLoadingEnhancement(true);
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    try {
      const enhancedReviewsData = await Promise.all(
        reviews.map(async (review) => {
          try {
            // Try to fetch student data for each review
            if (review.admissionNo) {
              const response = await fetch(`${API_BASE_URL}/api/student?admissionNo=${encodeURIComponent(review.admissionNo)}`);
              if (response.ok) {
                const data = await response.json();
                if (data.students && data.students.length > 0) {
                  const studentData = data.students[0];
                  return {
                    ...review,
                    enhancedBranchSemester: generateEnhancedAcademicInfo(review, studentData),
                    studentData: studentData
                  };
                }
              }
            }
            
            // If no student data found, return original review
            return {
              ...review,
              enhancedBranchSemester: generateEnhancedAcademicInfo(review),
              studentData: null
            };
          } catch (error) {
            console.error(`Error enhancing review ${review._id}:`, error);
            return {
              ...review,
              enhancedBranchSemester: generateEnhancedAcademicInfo(review),
              studentData: null
            };
          }
        })
      );
      
      setEnhancedReviews(enhancedReviewsData);
      console.log('Enhanced reviews with student data:', enhancedReviewsData.length);
    } catch (error) {
      console.error('Error enhancing reviews:', error);
      setEnhancedReviews(reviews.map(review => ({
        ...review,
        enhancedBranchSemester: generateEnhancedAcademicInfo(review),
        studentData: null
      })));
    } finally {
      setLoadingEnhancement(false);
    }
  }, [reviews]);

  // Auto-enhance reviews when reviews change
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      enhanceReviewsWithStudentData();
    }
  }, [reviews, enhanceReviewsWithStudentData]);

  // Sync external filters with internal state
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  useEffect(() => {
    if (externalFilterDepartment !== undefined) {
      setFilters(prev => ({
        ...prev,
        department: externalFilterDepartment
      }));
    }
  }, [externalFilterDepartment]);

  // Modal Management
  const openModal = (review, mode) => {
    setSelectedReview(review);
    setModalMode(mode);
    setShowModal(true);
    setErrors({});
    
    if (mode === 'edit' && review) {
      // Populate form with review data
      setFormData({
        studentName: review.studentName || '',
        admissionNo: review.admissionNo || '',
        branchSemester: review.branchSemester || '',
        teacherName: review.teacherName || '',
        teacherSubject: review.teacherSubject || '',
        teacherDepartment: review.teacherDepartment || '',
        ratings: { ...review.ratings },
        suggestions: review.suggestions || '',
        overallEvaluation: review.overallEvaluation || 3
      });
      
      // Fetch student details
      fetchStudentDetails(review.admissionNo, review.studentName);
    } else if (mode === 'create') {
      // Reset form for new review
      setFormData({
        studentName: '',
        admissionNo: '',
        branchSemester: '',
        teacherName: '',
        teacherSubject: '',
        teacherDepartment: '',
        ratings: {
          conceptExplanation: 3, subjectKnowledge: 3, contentOrganization: 3,
          classTiming: 3, learningEnvironment: 3, studentParticipation: 3,
          feedbackQuality: 3, resourceUtilization: 3, innovation: 3,
          accessibility: 3, supportiveness: 3, professionalism: 3
        },
        suggestions: '',
        overallEvaluation: 3
      });
      setStudentDetails(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReview(null);
    setModalMode('view');
    setStudentDetails(null);
    setErrors({});
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.admissionNo.trim()) newErrors.admissionNo = 'Admission number is required';
    if (!formData.branchSemester) newErrors.branchSemester = 'Branch/Semester is required';
    if (!formData.teacherName) newErrors.teacherName = 'Teacher is required';
    if (!formData.suggestions.trim()) newErrors.suggestions = 'Feedback is required';
    if (formData.suggestions.trim().length < 10) newErrors.suggestions = 'Feedback must be at least 10 characters long';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (modalMode === 'edit') {
        await onUpdate(selectedReview._id, formData);
      } else if (modalMode === 'create') {
        // Handle create new review logic here
        console.log('Creating new review:', formData);
      }
      closeModal();
      onRefresh();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Rating Change
  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: rating }
    }));
    
    // Calculate overall evaluation
    const newRatings = { ...formData.ratings, [category]: rating };
    const avgRating = Object.values(newRatings).reduce((a, b) => a + b, 0) / Object.values(newRatings).length;
    setFormData(prev => ({ ...prev, overallEvaluation: Math.round(avgRating * 10) / 10 }));
  };

  // Faculty Selection Handler
  const handleFacultyChange = (e) => {
    const teacherName = e.target.value;
    const teacher = faculty.find(f => f.name === teacherName);
    setFormData(prev => ({
      ...prev,
      teacherName,
      teacherSubject: teacher?.subject || '',
      teacherDepartment: teacher?.department || ''
    }));
  };

  // Star Rating Component
  const renderStars = (rating, onRatingChange = null, category = null, readonly = false) => (
    <div className="star-rating-input">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange && onRatingChange(category, star)}
          className={`star-btn ${star <= rating ? 'active' : ''} ${readonly ? 'readonly' : ''}`}
          disabled={readonly}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );

  // Get Rating Badge Class
  const getRatingBadgeClass = (rating) => {
    if (rating >= 4.5) return 'excellent';
    if (rating >= 3.5) return 'good';
    if (rating >= 2.5) return 'average';
    if (rating >= 1.5) return 'poor';
    return 'very-poor';
  };

  // Filter and Search Logic - Enhanced with external filters
  const filteredReviews = (enhancedReviews.length > 0 ? enhancedReviews : reviews).filter(review => {
    const academicInfo = review.enhancedBranchSemester || review.branchSemester || '';
    const reviewBranch = extractBranchFromAcademicInfo(academicInfo);
    const reviewSemester = extractSemesterFromAcademicInfo(academicInfo);
    const reviewSection = extractSectionFromAcademicInfo(academicInfo);

    // Combine internal and external search terms
    const effectiveSearchTerm = externalSearchTerm || searchTerm;
    
    const matchesSearch = !effectiveSearchTerm || 
      review.studentName.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
      review.admissionNo.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
      review.teacherName.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
      review.teacherSubject.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
      academicInfo.toLowerCase().includes(effectiveSearchTerm.toLowerCase());

    // Combine internal and external department filters
    const effectiveDepartmentFilter = externalFilterDepartment || filters.department;
    
    const matchesFilters = 
      (!effectiveDepartmentFilter || 
       review.teacherDepartment === effectiveDepartmentFilter ||
       review.branch === effectiveDepartmentFilter ||
       (review.branchSemester && review.branchSemester.split(' - ')[0] === effectiveDepartmentFilter) ||
       review.studentDepartment === effectiveDepartmentFilter ||
       review.department === effectiveDepartmentFilter
      ) &&
      (!filters.branch || reviewBranch.toLowerCase().includes(filters.branch.toLowerCase())) &&
      (!filters.semester || reviewSemester.toLowerCase().includes(filters.semester.toLowerCase())) &&
      (!filters.section || reviewSection.toLowerCase().includes(filters.section.toLowerCase())) &&
      (!filters.faculty || review.teacherName === filters.faculty) &&
      (!filters.rating || getRatingBadgeClass(review.overallEvaluation) === filters.rating);

    return matchesSearch && matchesFilters;
  });

  // Sorting Logic
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'overallEvaluation') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Remove pagination - show all filtered and sorted reviews
  const currentReviews = sortedReviews;

  // Get unique filter values
  const currentReviewsData = enhancedReviews.length > 0 ? enhancedReviews : reviews;
  
  const uniqueBranches = [...new Set(currentReviewsData.map(review => {
    const academicInfo = review.enhancedBranchSemester || review.branchSemester || '';
    return extractBranchFromAcademicInfo(academicInfo);
  }).filter(Boolean))].sort();
  
  const uniqueSemesters = [...new Set(currentReviewsData.map(review => {
    const academicInfo = review.enhancedBranchSemester || review.branchSemester || '';
    return extractSemesterFromAcademicInfo(academicInfo);
  }).filter(Boolean))].sort();
  
  const uniqueSections = [...new Set(currentReviewsData.map(review => {
    const academicInfo = review.enhancedBranchSemester || review.branchSemester || '';
    return extractSectionFromAcademicInfo(academicInfo);
  }).filter(Boolean))].sort();

  // Check if any filters are applied
  const isFiltered = Boolean(
    (externalSearchTerm && externalSearchTerm.trim()) ||
    (externalFilterDepartment && externalFilterDepartment !== 'all') ||
    (searchTerm && searchTerm.trim()) ||
    (filters.department && filters.department !== '') ||
    (filters.semester && filters.semester !== '') ||
    (filters.section && filters.section !== '') ||
    (filters.branch && filters.branch !== '') ||
    (filters.faculty && filters.faculty !== '') ||
    (filters.rating && filters.rating !== '')
  );

  // Analytics Calculations - Based on filtered reviews for dynamic updates
  const analytics = {
    totalReviews: filteredReviews.length,
    averageRating: filteredReviews.length > 0 ? 
      (filteredReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / filteredReviews.length).toFixed(1) : 0,
    excellentReviews: filteredReviews.filter(r => r.overallEvaluation >= 4.5).length,
    recentReviews: filteredReviews.filter(r => 
      new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="review-list">
      {/* Header Section */}
      <div className="list-header">
        <h2>Faculty Reviews ({analytics.totalReviews})</h2>
        <p>Manage and view all faculty performance evaluations</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        {isFiltered && (
          <div className="filter-indicator" style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <FaFilter />
            Showing filtered results
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '12px'
            }}>
              {analytics.totalReviews} of {currentReviewsData.length} reviews
            </span>
          </div>
        )}
        
        <div className="stat-card">
          <div className="stat-number">{analytics.totalReviews}</div>
          <div className="stat-label">
            {isFiltered ? 'Filtered Reviews' : 'Total Reviews'}
          </div>
          <div className="stat-icon">
            <FaChartBar />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{analytics.averageRating}/5</div>
          <div className="stat-label">
            {isFiltered ? 'Filtered Avg Rating' : 'Average Rating'}
          </div>
          <div className="stat-icon">
            <FaStar />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{analytics.excellentReviews}</div>
          <div className="stat-label">
            {isFiltered ? 'Filtered Excellence' : 'Excellence Awards'}
          </div>
          <div className="stat-icon">
            <FaAward />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{analytics.recentReviews}</div>
          <div className="stat-label">
            {isFiltered ? 'Filtered Recent' : 'This Week'}
          </div>
          <div className="stat-icon">
            <FaClock />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="header-actions" style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <button 
          className="btn btn-primary"
          onClick={() => openModal(null, 'create')}
        >
          <FaPlus /> New Review
        </button>
        <button 
          className="btn btn-outline"
          onClick={onRefresh}
          disabled={loading}
        >
          <FaSync className={loading ? 'spinning' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        <button className="btn btn-outline">
          <FaDownload /> Export Data
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="search-filter-container">
        <div className="search-section">
          {/* Only show internal search if no external search is provided */}
          {!externalSearchTerm && (
            <div className="search-group">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by student name, admission no, teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="review-view-controls">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
            >
              Card View
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Department</label>
              <select
                className="filter-select"
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              >
                <option value="">All Departments</option>
                {[...new Set((enhancedReviews.length > 0 ? enhancedReviews : reviews).map(r => r.teacherDepartment))].map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Branch</label>
              <select
                className="filter-select"
                value={filters.branch}
                onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
              >
                <option value="">All Branches</option>
                {uniqueBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Semester</label>
              <select
                className="filter-select"
                value={filters.semester}
                onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
              >
                <option value="">All Semesters</option>
                {uniqueSemesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Section</label>
              <select
                className="filter-select"
                value={filters.section}
                onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
              >
                <option value="">All Sections</option>
                {uniqueSections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Faculty</label>
              <select
                className="filter-select"
                value={filters.faculty}
                onChange={(e) => setFilters(prev => ({ ...prev, faculty: e.target.value }))}
              >
                <option value="">All Faculty</option>
                {[...new Set((enhancedReviews.length > 0 ? enhancedReviews : reviews).map(r => r.teacherName))].map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Performance</label>
              <select
                className="filter-select"
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              >
                <option value="">All Ratings</option>
                <option value="excellent">Excellent (4.5+)</option>
                <option value="good">Good (3.5-4.4)</option>
                <option value="average">Average (2.5-3.4)</option>
                <option value="poor">Below Average (1.5-2.4)</option>
                <option value="very-poor">Poor (&lt;1.5)</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Date Created</option>
                <option value="studentName">Student Name</option>
                <option value="teacherName">Faculty Name</option>
                <option value="overallEvaluation">Rating</option>
              </select>
            </div>

            <button
              className="btn btn-outline"
              onClick={() => setFilters({ 
                department: '', 
                branch: '', 
                semester: '', 
                section: '', 
                faculty: '', 
                rating: '', 
                dateRange: 'all' 
              })}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Display */}
      {currentReviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Reviews Found</h3>
          <p>{isFiltered ? 'No reviews match your current filters.' : 'No faculty reviews have been submitted yet.'}</p>
          {isFiltered && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm('');
                setFilters({ 
                  department: '', 
                  semester: '', 
                  section: '', 
                  branch: '', 
                  faculty: '', 
                  rating: '', 
                  dateRange: 'all' 
                });
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="review-table-container">
          <table className="review-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Academic Info</th>
                <th>Faculty Details</th>
                <th>Performance Rating</th>
                <th>Review Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentReviews.map((review) => (
                <tr key={review._id} className="review-row">
                  <td>
                    <div className="student-cell">
                      <div className="faculty-avatar-small">
                        {review.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="faculty-name">{review.studentName}</div>
                        <div className="student-admission">{review.admissionNo}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="academic-info">
                      {review.enhancedBranchSemester || review.branchSemester}
                      {loadingEnhancement && (
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}> (updating...)</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="teacher-cell">
                      <div className="faculty-avatar-small">
                        {review.teacherName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="faculty-name">{review.teacherName}</div>
                        <div className="faculty-subject">{review.teacherSubject}</div>
                        <div className="faculty-department">{review.teacherDepartment}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="rating-cell">
                      <div className="rating-stars-small">
                        {renderStars(review.overallEvaluation, null, null, true)}
                      </div>
                      <div className="rating-number-small" style={{ 
                        color: getRatingBadgeClass(review.overallEvaluation) === 'excellent' ? '#10b981' : 
                               getRatingBadgeClass(review.overallEvaluation) === 'good' ? '#3b82f6' : 
                               getRatingBadgeClass(review.overallEvaluation) === 'average' ? '#f59e0b' : '#ef4444'
                      }}>
                        {review.overallEvaluation}/5
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      {formatDate(review.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-btn view"
                        onClick={() => openModal(review, 'view')}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => openModal(review, 'edit')}
                        title="Edit Review"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => onDelete(review._id)}
                        title="Delete Review"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="review-grid">
            {currentReviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="faculty-header">
                  <div className="faculty-avatar">
                    {review.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="faculty-info">
                    <h3 className="faculty-name">{review.studentName}</h3>
                    <p className="faculty-department">{review.admissionNo}</p>
                    <p className="faculty-subject">{review.enhancedBranchSemester || review.branchSemester}</p>
                    {loadingEnhancement && (
                      <span style={{ color: '#6b7280', fontSize: '0.8rem' }}> (updating...)</span>
                    )}
                  </div>
                  <div className="faculty-rating">
                    <div className="rating-container">
                      <div className="rating-stars">
                        {renderStars(review.overallEvaluation)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className="rating-text" style={{ 
                          color: getRatingBadgeClass(review.overallEvaluation) === 'excellent' ? '#10b981' : 
                                 getRatingBadgeClass(review.overallEvaluation) === 'good' ? '#3b82f6' : 
                                 getRatingBadgeClass(review.overallEvaluation) === 'average' ? '#f59e0b' : '#ef4444',
                          fontWeight: 'bold' 
                        }}>
                          {review.overallEvaluation}/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '16px 0' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Faculty:</strong> {review.teacherName}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Subject:</strong> {review.teacherSubject}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Department:</strong> {review.teacherDepartment}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Date:</strong> {formatDate(review.createdAt)}
                  </div>
                </div>
                
                <div className="table-actions" style={{ justifyContent: 'center', padding: '16px 0 0 0' }}>
                  <button
                    className="action-btn view"
                    onClick={() => openModal(review, 'view')}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => openModal(review, 'edit')}
                    title="Edit Review"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => onDelete(review._id)}
                    title="Delete Review"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Count Display */}
        {sortedReviews.length > 0 && (
          <div className="review-stats-info">
            Showing all {sortedReviews.length} reviews
            {isFiltered && ` (filtered from ${reviews.length} total)`}
          </div>
        )}

      {/* Enhanced Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-title">
                {modalMode === 'view' && <><FaEye className="header-icon" /> Review Details</>}
                {modalMode === 'edit' && <><FaEdit className="header-icon" /> Edit Faculty Review</>}
                {modalMode === 'create' && <><FaPlus className="header-icon" /> Create New Review</>}
              </div>
              {selectedReview && (
                <div className="review-meta">
                  <span className="review-id">ID: {selectedReview._id}</span>
                  <span className="review-date">{formatDate(selectedReview.createdAt)}</span>
                </div>
              )}
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              {modalMode === 'view' && selectedReview && (
                <div className="view-content">
                  {/* Student Profile Display */}
                  <div className="section">
                    <h3><FaUserGraduate /> Student Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{selectedReview.studentName}</span>
                      </div>
                      <div className="info-item">
                        <label>Admission No:</label>
                        <span>{selectedReview.admissionNo}</span>
                      </div>
                      <div className="info-item">
                        <label>Academic Details:</label>
                        <span>{selectedReview.enhancedBranchSemester || selectedReview.branchSemester}</span>
                      </div>
                    </div>
                  </div>

                  {/* Faculty Information */}
                  <div className="section">
                    <h3><FaChalkboardTeacher /> Faculty Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{selectedReview.teacherName}</span>
                      </div>
                      <div className="info-item">
                        <label>Subject:</label>
                        <span>{selectedReview.teacherSubject}</span>
                      </div>
                      <div className="info-item">
                        <label>Department:</label>
                        <span>{selectedReview.teacherDepartment}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Ratings */}
                  <div className="section">
                    <h3><FaStar /> Detailed Performance Ratings</h3>
                    <div className="ratings-display">
                      {Object.entries(ratingCategories).map(([key, label]) => (
                        <div key={key} className="rating-category">
                          <div className="category-info">
                            <span className="category-label">{label}</span>
                            <div className="category-rating">
                              {renderStars(selectedReview.ratings[key] || 3, null, null, true)}
                              <span className="rating-value">{selectedReview.ratings[key] || 3}/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="overall-rating">
                      <h4>Overall Evaluation</h4>
                      <div className="overall-display">
                        <div className={`rating-badge ${getRatingBadgeClass(selectedReview.overallEvaluation)}`}>
                          {selectedReview.overallEvaluation}/5
                        </div>
                        <div className="overall-stars">
                          {renderStars(selectedReview.overallEvaluation, null, null, true)}
                        </div>
                        <span className="rating-label">
                          {ratingLabels[Math.round(selectedReview.overallEvaluation)]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="section">
                    <h3><FaComments /> Student Feedback</h3>
                    <div className="feedback-content">
                      <p>{selectedReview.suggestions}</p>
                    </div>
                  </div>
                </div>
              )}

              {(modalMode === 'edit' || modalMode === 'create') && (
                <form onSubmit={handleSubmit} className="edit-form">
                  {/* Student Backend Data Integration */}
                  {studentDetails && (
                    <div className="student-profile-card">
                      <div className="profile-header">
                        <div className="profile-avatar">
                          <FaUserGraduate />
                        </div>
                        <div className="profile-info">
                          <h5>{studentDetails.fullName || studentDetails.username}</h5>
                          <p className="profile-role">Student Profile (From Database)</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fetchStudentDetails(formData.admissionNo, formData.studentName)}
                          className="btn-refresh"
                          disabled={loadingStudentDetails}
                        >
                          <FaSync className={loadingStudentDetails ? 'spinning' : ''} />
                          {loadingStudentDetails ? 'Fetching...' : 'Refresh'}
                        </button>
                      </div>
                      
                      <div className="profile-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <FaIdCard className="detail-icon" />
                            <div>
                              <label>Admission Number</label>
                              <span>{studentDetails.admissionNo || 'Not Available'}</span>
                            </div>
                          </div>
                          <div className="detail-item">
                            <FaEnvelope className="detail-icon" />
                            <div>
                              <label>Email</label>
                              <span>{studentDetails.email || 'Not Available'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-item">
                            <FaSchool className="detail-icon" />
                            <div>
                              <label>Department</label>
                              <span>{studentDetails.department || 'Not Available'}</span>
                            </div>
                          </div>
                          <div className="detail-item">
                            <FaGraduationCap className="detail-icon" />
                            <div>
                              <label>Semester</label>
                              <span>{studentDetails.semester || 'Not Available'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="form-sections">
                    <div className="form-section">
                      <h4><FaUser /> Student Information</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Student Name *</label>
                          <input
                            type="text"
                            value={formData.studentName}
                            onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                            className={errors.studentName ? 'error' : ''}
                          />
                          {errors.studentName && (
                            <span className="error-message">{errors.studentName}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Admission Number *</label>
                          <input
                            type="text"
                            value={formData.admissionNo}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, admissionNo: e.target.value }));
                              // Auto-fetch student details on admission number change
                              if (e.target.value.length >= 5) {
                                fetchStudentDetails(e.target.value, '');
                              }
                            }}
                            className={errors.admissionNo ? 'error' : ''}
                          />
                          {errors.admissionNo && (
                            <span className="error-message">{errors.admissionNo}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Branch/Semester/Section *</label>
                        <input
                          type="text"
                          value={formData.branchSemester}
                          onChange={(e) => setFormData(prev => ({ ...prev, branchSemester: e.target.value }))}
                          placeholder="e.g., Computer Science Engineering - 6 Semester - Section A"
                          className={errors.branchSemester ? 'error' : ''}
                        />
                        {errors.branchSemester && (
                          <span className="error-message">{errors.branchSemester}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-section">
                      <h4><FaChalkboardTeacher /> Faculty Information</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Faculty Name *</label>
                          <select
                            value={formData.teacherName}
                            onChange={handleFacultyChange}
                            className={errors.teacherName ? 'error' : ''}
                          >
                            <option value="">Select Faculty</option>
                            {faculty.map(teacher => (
                              <option key={teacher._id} value={teacher.name}>{teacher.name}</option>
                            ))}
                          </select>
                          {errors.teacherName && (
                            <span className="error-message">{errors.teacherName}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Subject</label>
                          <input
                            type="text"
                            value={formData.teacherSubject}
                            readOnly
                            className="readonly-field"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Department</label>
                        <input
                          type="text"
                          value={formData.teacherDepartment}
                          readOnly
                          className="readonly-field"
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h4><FaStar /> Performance Ratings</h4>
                      <div className="ratings-grid">
                        {Object.entries(ratingCategories).map(([key, label]) => (
                          <div key={key} className="rating-input-group">
                            <label>{label}</label>
                            <div className="rating-controls">
                              {renderStars(formData.ratings[key], handleRatingChange, key)}
                              <span className="rating-value">{formData.ratings[key]}/5</span>
                              <span className="rating-label">
                                {ratingLabels[formData.ratings[key]]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="overall-rating-display">
                        <h5>Overall Evaluation: {formData.overallEvaluation}/5</h5>
                        <div className="overall-stars">
                          {renderStars(formData.overallEvaluation, null, null, true)}
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4><FaComments /> Feedback & Suggestions</h4>
                      <div className="form-group">
                        <label>Detailed Feedback *</label>
                        <textarea
                          value={formData.suggestions}
                          onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
                          placeholder="Provide detailed feedback about faculty performance..."
                          rows={8}
                          className={errors.suggestions ? 'error' : ''}
                        />
                        <div className="textarea-footer">
                          <span className={`char-count ${formData.suggestions.length < 10 ? 'warning' : ''}`}>
                            {formData.suggestions.length} characters (minimum 10 required)
                          </span>
                        </div>
                        {errors.suggestions && (
                          <span className="error-message">{errors.suggestions}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="modal-footer">
              {modalMode === 'view' && (
                <button
                  className="btn btn-primary"
                  onClick={() => setModalMode('edit')}
                >
                  <FaEdit /> Edit Review
                </button>
              )}
              
              {(modalMode === 'edit' || modalMode === 'create') && (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner"></div>
                      {modalMode === 'edit' ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {modalMode === 'edit' ? 'Update Review' : 'Create Review'}
                    </>
                  )}
                </button>
              )}
              
              <button className="btn btn-cancel" onClick={closeModal}>
                <FaTimes /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFacultyEvaluationSystem;
