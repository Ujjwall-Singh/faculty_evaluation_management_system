import React, { useState, useMemo } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaUser, 
  FaGraduationCap, 
  FaCalendar, 
  FaFilter, 
  FaSort,
  FaChartBar,
  FaDownload,
  FaSearch,
  FaEyeSlash,
  FaComments,
  FaBookOpen,
  FaClock,
  FaThumbsUp,
  FaThumbsDown
} from 'react-icons/fa';

const ReviewList = ({ reviews, onEdit, onDelete }) => {
  const [expandedReview, setExpandedReview] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedReviews, setSelectedReviews] = useState(new Set());

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
      ['Teacher Name', 'Department', 'Subject', 'Student Name', 'Rating', 'Date', 'Suggestions'].join(','),
      ...selectedData.map(review => [
        review.teacherName,
        review.teacherDepartment,
        review.teacherSubject,
        review.studentName,
        review.overallEvaluation,
        new Date(review.createdAt || review._id).toLocaleDateString(),
        `"${review.suggestions}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique departments for filter
  const departments = [...new Set(reviews.map(r => r.teacherDepartment))].sort();

  // Rating categories with user-friendly names
  const ratingCategories = {
    conceptExplanation: 'Concept Explanation',
    subjectKnowledge: 'Subject Knowledge',
    contentOrganization: 'Content Organization',
    classTiming: 'Class Timing',
    learningEnvironment: 'Learning Environment',
    studentParticipation: 'Student Participation',
    feedbackQuality: 'Feedback Quality',
    resourceUtilization: 'Resource Utilization',
    innovation: 'Innovation',
    accessibility: 'Accessibility',
    supportiveness: 'Supportiveness',
    professionalism: 'Professionalism'
  };

  // Sort and filter reviews
  const sortedAndFilteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.teacherName.toLowerCase().includes(term) ||
        review.studentName.toLowerCase().includes(term) ||
        review.teacherDepartment.toLowerCase().includes(term) ||
        review.teacherSubject.toLowerCase().includes(term) ||
        review.suggestions.toLowerCase().includes(term)
      );
    }

    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(review => 
        review.teacherDepartment === filterDepartment
      );
    }

    // Filter by rating
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
  }, [reviews, sortBy, sortOrder, filterRating, searchTerm, filterDepartment]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (reviews.length === 0) return { average: 0, total: 0, distribution: {} };

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

    return { average, total, distribution };
  }, [reviews]);

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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 4.0) return '#3b82f6';
    if (rating >= 3.5) return '#f59e0b';
    return '#ef4444';
  };

  if (reviews.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FaStar />
        </div>
        <h3>No Reviews Found</h3>
        <p>No reviews have been submitted yet. Students can add reviews for faculty members.</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {/* Header Section */}
      <div className="list-header">
        <div className="header-content">
          <div className="header-text">
            <h2>Student Reviews ({sortedAndFilteredReviews.length})</h2>
            <p>Manage and analyze all student evaluations and feedback</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="view-toggle-btn"
            >
              <FaChartBar />
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
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
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="enhanced-controls">
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by teacher, student, department, subject, or feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                <FaEyeSlash />
              </button>
            )}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="department-filter">
                <FaGraduationCap /> Department:
              </label>
              <select 
                id="department-filter"
                value={filterDepartment} 
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="rating-filter">
                <FaStar /> Rating:
              </label>
              <select 
                id="rating-filter"
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
              <label htmlFor="sort-by">
                <FaSort /> Sort by:
              </label>
              <select 
                id="sort-by"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Date Added</option>
                <option value="rating">Rating</option>
                <option value="teacher">Teacher Name</option>
                <option value="student">Student Name</option>
                <option value="department">Department</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-order">Order:</label>
              <select 
                id="sort-order"
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {sortedAndFilteredReviews.length > 0 && (
            <div className="bulk-actions">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedReviews.size === sortedAndFilteredReviews.length}
                  onChange={toggleSelectAll}
                />
                Select All ({sortedAndFilteredReviews.length})
              </label>
              {selectedReviews.size > 0 && (
                <span className="selected-count">
                  {selectedReviews.size} selected
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Statistics Section */}
      <div className="review-statistics">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaComments />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.average}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaThumbsUp />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.distribution[5] + statistics.distribution[4]}</div>
              <div className="stat-label">Positive Reviews</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaBookOpen />
            </div>
            <div className="stat-content">
              <div className="stat-value">{departments.length}</div>
              <div className="stat-label">Departments</div>
            </div>
          </div>
        </div>
        
        <div className="rating-distribution">
          <h4>Rating Distribution</h4>
          <div className="distribution-chart">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="distribution-item">
                <div className="rating-info">
                  <span className="rating-label">
                    {renderStars(rating).slice(0, rating)}
                    <span className="rating-number">({rating})</span>
                  </span>
                  <span className="rating-count">{statistics.distribution[rating]}</span>
                </div>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill"
                    style={{ 
                      width: `${statistics.total > 0 ? (statistics.distribution[rating] / statistics.total) * 100 : 0}%`,
                      backgroundColor: getRatingColor(rating)
                    }}
                  ></div>
                </div>
                <span className="rating-percentage">
                  {statistics.total > 0 ? Math.round((statistics.distribution[rating] / statistics.total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Review Grid */}
      <div className={`review-container ${viewMode}-view`}>
        {sortedAndFilteredReviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="review-selection">
                <input
                  type="checkbox"
                  checked={selectedReviews.has(review._id)}
                  onChange={() => toggleSelectReview(review._id)}
                  className="review-checkbox"
                />
              </div>
              
              <div className="review-info">
                <div className="review-teacher">
                  <h3 className="teacher-name">
                    <FaUser className="name-icon" />
                    {review.teacherName}
                  </h3>
                  <div className="teacher-details">
                    <p className="teacher-dept">
                      <FaGraduationCap /> {review.teacherDepartment}
                    </p>
                    <p className="teacher-subject">
                      <FaBookOpen /> {review.teacherSubject}
                    </p>
                  </div>
                </div>
                
                <div className="review-rating">
                  <div className="rating-display">
                    <div className="stars-container">
                      {renderStars(review.overallEvaluation)}
                    </div>
                    <span className="rating-number">{review.overallEvaluation.toFixed(1)}</span>
                  </div>
                  <div className="rating-category">
                    {review.overallEvaluation >= 4.5 ? 'Excellent' :
                     review.overallEvaluation >= 3.5 ? 'Good' :
                     review.overallEvaluation >= 2.5 ? 'Average' :
                     review.overallEvaluation >= 1.5 ? 'Below Average' : 'Poor'}
                  </div>
                </div>
              </div>

              <div className="review-actions">
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

            <div className="review-meta">
              <div className="student-info">
                <span className="student-name">
                  <FaUser /> {review.studentName}
                </span>
                <span className="student-details">
                  {review.admissionNo} • {review.branchSemester}
                </span>
              </div>
              
              <div className="review-date">
                <FaClock />
                <span>{new Date(review.createdAt || review._id).toLocaleDateString()}</span>
              </div>
            </div>

            {expandedReview === review._id && (
              <div className="review-details">
                <div className="detailed-ratings">
                  <h4>
                    <FaChartBar /> Detailed Ratings
                  </h4>
                  <div className="ratings-grid">
                    {Object.entries(review.ratings || {}).map(([key, value]) => (
                      <div key={key} className="rating-item">
                        <span className="rating-category-name">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <div className="rating-value">
                          <div className="stars-small">
                            {renderStars(value)}
                          </div>
                          <span className="rating-num">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="review-feedback">
                  <h4>
                    <FaComments /> Student Feedback
                  </h4>
                  <div className="feedback-content">
                    <p>{review.suggestions}</p>
                  </div>
                </div>

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
        
        {sortedAndFilteredReviews.length === 0 && searchTerm && (
          <div className="no-results">
            <FaSearch className="no-results-icon" />
            <h3>No matching reviews found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterRating('all');
                setFilterDepartment('all');
              }}
              className="clear-filters-btn"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
                </div>
              </div>
              
              <div className="review-rating">
                <div className="rating-stars">
                  {renderStars(review.overallEvaluation)}
                </div>
                <div 
                  className="rating-value"
                  style={{ color: getRatingColor(review.overallEvaluation) }}
                >
                  {review.overallEvaluation}/5
                </div>
              </div>

              <div className="review-actions">
                <button
                  className="action-btn view"
                  onClick={() => toggleExpanded(review._id)}
                  title="View Details"
                >
                  <FaEye />
                </button>
                <button
                  className="action-btn edit"
                  onClick={() => onEdit(review)}
                  title="Edit Review"
                >
                  <FaEdit />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => onDelete(review)}
                  title="Delete Review"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {expandedReview === review._id && (
              <div className="review-details">
                <div className="detail-section">
                  <h4>Detailed Ratings</h4>
                  <div className="ratings-grid">
                    {Object.entries(review.ratings || {}).map(([category, rating]) => (
                      <div key={category} className="rating-item">
                        <span className="rating-category">
                          {ratingCategories[category] || category}:
                        </span>
                        <div className="rating-display">
                          <div className="rating-stars-small">
                            {renderStars(rating)}
                          </div>
                          <span 
                            className="rating-number"
                            style={{ color: getRatingColor(rating) }}
                          >
                            {rating}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {review.suggestions && (
                  <div className="detail-section">
                    <h4>Suggestions for Improvement</h4>
                    <p className="suggestions-text">{review.suggestions}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Review Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <FaCalendar className="info-icon" />
                      <span className="info-label">Date:</span>
                      <span className="info-value">
                        {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="info-item">
                      <FaGraduationCap className="info-icon" />
                      <span className="info-label">Branch/Semester:</span>
                      <span className="info-value">{review.branchSemester}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table View for larger screens */}
      <div className="review-table-container">
        <table className="review-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Department</th>
              <th>Student</th>
              <th>Rating</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredReviews.map((review) => (
              <tr key={review._id}>
                <td>
                  <div className="teacher-cell">
                    <div className="teacher-avatar">
                      {review.teacherName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="teacher-name">{review.teacherName}</div>
                      <div className="teacher-subject">{review.teacherSubject}</div>
                    </div>
                  </div>
                </td>
                <td>{review.teacherDepartment}</td>
                <td>
                  <div className="student-cell">
                    <div className="student-name">{review.studentName}</div>
                    <div className="student-admission">{review.admissionNo}</div>
                  </div>
                </td>
                <td>
                  <div className="rating-cell">
                    <div className="rating-stars-small">
                      {renderStars(review.overallEvaluation)}
                    </div>
                    <span 
                      className="rating-number-small"
                      style={{ color: getRatingColor(review.overallEvaluation) }}
                    >
                      {review.overallEvaluation}
                    </span>
                  </div>
                </td>
                <td>
                  {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="action-btn view"
                      onClick={() => toggleExpanded(review._id)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(review)}
                      title="Edit Review"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(review)}
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
    </div>
  );
};

export default ReviewList; 