import React, { useState, useMemo } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaUser, 
  FaGraduationCap, 
  FaSort,
  FaChartBar,
  FaDownload,
  FaSearch,
  FaEyeSlash,
  FaComments,
  FaBookOpen,
  FaClock,
  FaThumbsUp,
  FaFilter,
  FaTimes,
  FaSchool,
  FaUsers,
  FaLayerGroup
} from 'react-icons/fa';
import './ReviewList.css';

const ReviewList = ({ reviews, onEdit, onDelete }) => {
  const [expandedReview, setExpandedReview] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [showFilters, setShowFilters] = useState(true);

  const toggleExpanded = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const toggleSelectReview = (reviewId) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === sortedAndFilteredReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(sortedAndFilteredReviews.map(r => r._id)));
    }
  };

  const exportSelectedReviews = () => {
    const selectedData = sortedAndFilteredReviews.filter(r => selectedReviews.has(r._id));
    const csv = [
      ['Teacher Name', 'Department', 'Subject', 'Student Name', 'Semester', 'Section', 'Rating', 'Date', 'Feedback'].join(','),
      ...selectedData.map(review => [
        review.teacherName,
        review.teacherDepartment,
        review.teacherSubject,
        review.studentName,
        review.semester || 'N/A',
        review.section || 'N/A',
        review.overallEvaluation,
        new Date(review.createdAt || review._id).toLocaleDateString(),
        `"${review.suggestions}"`
      ].join(','))
    ].join('\\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique values for filters
  const departments = [...new Set(reviews.map(r => r.teacherDepartment).filter(Boolean))].sort();
  const semesters = [...new Set(reviews.map(r => r.semester || extractSemester(r.branchSemester)).filter(Boolean))].sort();
  const sections = [...new Set(reviews.map(r => r.section || extractSection(r.branchSemester)).filter(Boolean))].sort();
  const teachers = [...new Set(reviews.map(r => r.teacherName).filter(Boolean))].sort();

  // Helper functions to extract semester and section
  function extractSemester(branchSemester) {
    if (!branchSemester) return '';
    const match = branchSemester.match(/(\\d+)(st|nd|rd|th)/);
    return match ? match[1] : '';
  }

  function extractSection(branchSemester) {
    if (!branchSemester) return '';
    // If section is mentioned in branchSemester, extract it
    const sectionMatch = branchSemester.match(/Section ([A-Z])/);
    return sectionMatch ? sectionMatch[1] : '';
  }

  // Enhanced filtering and sorting
  const sortedAndFilteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.teacherName.toLowerCase().includes(term) ||
        review.studentName.toLowerCase().includes(term) ||
        review.teacherDepartment.toLowerCase().includes(term) ||
        review.teacherSubject.toLowerCase().includes(term) ||
        review.suggestions.toLowerCase().includes(term) ||
        review.admissionNo.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(review => review.teacherDepartment === filterDepartment);
    }

    // Semester filter
    if (filterSemester !== 'all') {
      filtered = filtered.filter(review => {
        const semester = review.semester || extractSemester(review.branchSemester);
        return semester === filterSemester;
      });
    }

    // Section filter
    if (filterSection !== 'all') {
      filtered = filtered.filter(review => {
        const section = review.section || extractSection(review.branchSemester);
        return section === filterSection;
      });
    }

    // Teacher filter
    if (filterTeacher !== 'all') {
      filtered = filtered.filter(review => review.teacherName === filterTeacher);
    }

    // Rating filter
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      filtered = filtered.filter(review => {
        if (rating === 5) return review.overallEvaluation >= 4.5;
        if (rating === 4) return review.overallEvaluation >= 3.5 && review.overallEvaluation < 4.5;
        if (rating === 3) return review.overallEvaluation >= 2.5 && review.overallEvaluation < 3.5;
        if (rating === 2) return review.overallEvaluation >= 1.5 && review.overallEvaluation < 2.5;
        if (rating === 1) return review.overallEvaluation < 1.5;
        return true;
      });
    }

    // Sort reviews
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.overallEvaluation;
          bValue = b.overallEvaluation;
          break;
        case 'teacher':
          aValue = a.teacherName.toLowerCase();
          bValue = b.teacherName.toLowerCase();
          break;
        case 'student':
          aValue = a.studentName.toLowerCase();
          bValue = b.studentName.toLowerCase();
          break;
        case 'department':
          aValue = a.teacherDepartment.toLowerCase();
          bValue = b.teacherDepartment.toLowerCase();
          break;
        case 'semester':
          aValue = a.semester || extractSemester(a.branchSemester);
          bValue = b.semester || extractSemester(b.branchSemester);
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt || a._id);
          bValue = new Date(b.createdAt || b._id);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [reviews, sortBy, sortOrder, filterRating, searchTerm, filterDepartment, filterSemester, filterSection, filterTeacher]);

  // Calculate enhanced statistics
  const statistics = useMemo(() => {
    if (reviews.length === 0) return { average: 0, total: 0, distribution: {}, departmentStats: {}, semesterStats: {} };

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.overallEvaluation, 0);
    const average = (sum / total).toFixed(1);
    
    const distribution = {
      5: reviews.filter(r => r.overallEvaluation >= 4.5).length,
      4: reviews.filter(r => r.overallEvaluation >= 3.5 && r.overallEvaluation < 4.5).length,
      3: reviews.filter(r => r.overallEvaluation >= 2.5 && r.overallEvaluation < 3.5).length,
      2: reviews.filter(r => r.overallEvaluation >= 1.5 && r.overallEvaluation < 2.5).length,
      1: reviews.filter(r => r.overallEvaluation < 1.5).length,
    };

    // Department-wise statistics
    const departmentStats = departments.reduce((acc, dept) => {
      const deptReviews = reviews.filter(r => r.teacherDepartment === dept);
      acc[dept] = {
        count: deptReviews.length,
        average: deptReviews.length > 0 ? (deptReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / deptReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Semester-wise statistics
    const semesterStats = semesters.reduce((acc, sem) => {
      const semReviews = reviews.filter(r => (r.semester || extractSemester(r.branchSemester)) === sem);
      acc[sem] = {
        count: semReviews.length,
        average: semReviews.length > 0 ? (semReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / semReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    return { average, total, distribution, departmentStats, semesterStats };
  }, [reviews, departments, semesters]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        />
      );
    }
    return stars;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterDepartment('all');
    setFilterSemester('all');
    setFilterSection('all');
    setFilterTeacher('all');
    setFilterRating('all');
  };

  if (reviews.length === 0) {
    return (
      <div className="review-list-container">
        <div className="empty-state">
          <div className="empty-icon">
            <FaStar />
          </div>
          <h3>No Reviews Found</h3>
          <p>No reviews have been submitted yet. Students can add reviews for faculty members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-list-container">
      {/* Enhanced Header Section */}
      <div className="list-header-section">
        <div className="header-main">
          <div className="header-left">
            <h2 className="page-title">
              <FaComments className="title-icon" />
              Student Reviews
            </h2>
            <div className="header-stats">
              <span className="total-count">{sortedAndFilteredReviews.length} of {reviews.length} reviews</span>
              <span className="avg-rating">
                <FaStar className="star-icon" />
                {statistics.average}/5 average
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            >
              <FaFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
              className="view-toggle-btn"
            >
              <FaLayerGroup />
              {viewMode === 'cards' ? 'List View' : 'Card View'}
            </button>
            {selectedReviews.size > 0 && (
              <button 
                onClick={exportSelectedReviews}
                className="export-btn"
              >
                <FaDownload />
                Export ({selectedReviews.size})
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FaComments />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.average}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <FaThumbsUp />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.distribution[5] + statistics.distribution[4]}</div>
              <div className="stat-label">Positive Reviews</div>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">
              <FaSchool />
            </div>
            <div className="stat-content">
              <div className="stat-value">{departments.length}</div>
              <div className="stat-label">Departments</div>
            </div>
          </div>

          <div className="stat-card accent">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <div className="stat-value">{teachers.length}</div>
              <div className="stat-label">Teachers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>
              <FaFilter />
              Advanced Filters
            </h3>
            <button onClick={clearAllFilters} className="clear-filters-btn">
              <FaTimes />
              Clear All
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search reviews by teacher, student, department, subject, admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-search-btn"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Filter Grid */}
          <div className="filter-grid">
            <div className="filter-group">
              <label>
                <FaSchool />
                Department
              </label>
              <select 
                value={filterDepartment} 
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept} ({statistics.departmentStats[dept]?.count || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaGraduationCap />
                Semester
              </label>
              <select 
                value={filterSemester} 
                onChange={(e) => setFilterSemester(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>
                    {sem} Semester ({statistics.semesterStats[sem]?.count || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaLayerGroup />
                Section
              </label>
              <select 
                value={filterSection} 
                onChange={(e) => setFilterSection(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaUser />
                Teacher
              </label>
              <select 
                value={filterTeacher} 
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaStar />
                Rating
              </label>
              <select 
                value={filterRating} 
                onChange={(e) => setFilterRating(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="5">★★★★★ Excellent (4.5+)</option>
                <option value="4">★★★★☆ Good (3.5-4.4)</option>
                <option value="3">★★★☆☆ Average (2.5-3.4)</option>
                <option value="2">★★☆☆☆ Below Average (1.5-2.4)</option>
                <option value="1">★☆☆☆☆ Poor (Below 1.5)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaSort />
                Sort By
              </label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Date Added</option>
                <option value="rating">Rating</option>
                <option value="teacher">Teacher Name</option>
                <option value="student">Student Name</option>
                <option value="department">Department</option>
                <option value="semester">Semester</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div className="filter-group bulk-actions">
              <label className="bulk-select">
                <input
                  type="checkbox"
                  checked={selectedReviews.size === sortedAndFilteredReviews.length && sortedAndFilteredReviews.length > 0}
                  onChange={toggleSelectAll}
                />
                Select All ({sortedAndFilteredReviews.length})
              </label>
              {selectedReviews.size > 0 && (
                <span className="selected-info">
                  {selectedReviews.size} selected
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Container */}
      <div className={`reviews-container ${viewMode}-view`}>
        {sortedAndFilteredReviews.map((review) => (
          <div key={review._id} className="review-card">
            {/* Card Header */}
            <div className="card-header">
              <div className="card-select">
                <input
                  type="checkbox"
                  checked={selectedReviews.has(review._id)}
                  onChange={() => toggleSelectReview(review._id)}
                />
              </div>
              
              <div className="teacher-info">
                <div className="teacher-avatar">
                  {review.teacherName.charAt(0).toUpperCase()}
                </div>
                <div className="teacher-details">
                  <h3 className="teacher-name">{review.teacherName}</h3>
                  <p className="teacher-meta">
                    <FaSchool /> {review.teacherDepartment}
                  </p>
                  <p className="teacher-subject">
                    <FaBookOpen /> {review.teacherSubject}
                  </p>
                </div>
              </div>

              <div className="rating-display">
                <div className="rating-stars">
                  {renderStars(review.overallEvaluation)}
                </div>
                <div className="rating-value">{review.overallEvaluation.toFixed(1)}</div>
                <div className="rating-label">
                  {review.overallEvaluation >= 4.5 ? 'Excellent' :
                   review.overallEvaluation >= 3.5 ? 'Good' :
                   review.overallEvaluation >= 2.5 ? 'Average' :
                   review.overallEvaluation >= 1.5 ? 'Below Average' : 'Poor'}
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => toggleExpanded(review._id)}
                  className="action-btn view-btn"
                  title={expandedReview === review._id ? "Hide details" : "View details"}
                >
                  {expandedReview === review._id ? <FaEyeSlash /> : <FaEye />}
                </button>
                <button
                  onClick={() => onEdit(review)}
                  className="action-btn edit-btn"
                  title="Edit review"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(review._id)}
                  className="action-btn delete-btn"
                  title="Delete review"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* Card Meta */}
            <div className="card-meta">
              <div className="student-info">
                <FaUser className="meta-icon" />
                <span className="student-name">{review.studentName}</span>
                <span className="admission-no">({review.admissionNo})</span>
              </div>
              
              <div className="academic-info">
                <span className="semester">
                  <FaGraduationCap className="meta-icon" />
                  Sem {review.semester || extractSemester(review.branchSemester)}
                </span>
                {(review.section || extractSection(review.branchSemester)) && (
                  <span className="section">
                    <FaLayerGroup className="meta-icon" />
                    Sec {review.section || extractSection(review.branchSemester)}
                  </span>
                )}
              </div>
              
              <div className="review-date">
                <FaClock className="meta-icon" />
                <span>{new Date(review.createdAt || review._id).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedReview === review._id && (
              <div className="card-expanded">
                {/* Detailed Ratings */}
                {review.ratings && Object.keys(review.ratings).length > 0 && (
                  <div className="detailed-ratings">
                    <h4>
                      <FaChartBar />
                      Detailed Ratings
                    </h4>
                    <div className="ratings-grid">
                      {Object.entries(review.ratings).map(([key, value]) => (
                        <div key={key} className="rating-item">
                          <span className="rating-category">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <div className="rating-stars-small">
                            {renderStars(value)}
                          </div>
                          <span className="rating-num">{value}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Student Feedback */}
                <div className="feedback-section">
                  <h4>
                    <FaComments />
                    Student Feedback
                  </h4>
                  <div className="feedback-content">
                    <p>{review.suggestions}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                {review.adminNotes && (
                  <div className="admin-notes">
                    <h4>Admin Notes</h4>
                    <p>{review.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* No Results */}
        {sortedAndFilteredReviews.length === 0 && (searchTerm || filterDepartment !== 'all' || filterSemester !== 'all' || filterSection !== 'all' || filterTeacher !== 'all' || filterRating !== 'all') && (
          <div className="no-results">
            <FaSearch className="no-results-icon" />
            <h3>No matching reviews found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button onClick={clearAllFilters} className="clear-all-btn">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
