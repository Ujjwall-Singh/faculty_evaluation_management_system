import React, { useState, useMemo } from 'react';
import { FaEdit, FaTrash, FaEye, FaEnvelope, FaPhone, FaGraduationCap, FaStar, FaChartBar } from 'react-icons/fa';

const FacultyList = ({ faculty, reviews = [], onEdit, onDelete }) => {
  const [expandedFaculty, setExpandedFaculty] = useState(null);

  const toggleExpanded = (facultyId) => {
    setExpandedFaculty(expandedFaculty === facultyId ? null : facultyId);
  };

  // Verify calculation from individual ratings
  const verifyCalculation = (review) => {
    if (!review.ratings || typeof review.ratings !== 'object') return null;
    
    const ratingValues = Object.values(review.ratings).filter(val => 
      typeof val === 'number' && val > 0
    );
    
    if (ratingValues.length === 0) return null;
    
    const calculatedAvg = ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length;
    return parseFloat(calculatedAvg.toFixed(1));
  };

  // Calculate faculty ratings and review counts with better matching
  const facultyWithRatings = useMemo(() => {
    if (!faculty || !reviews) return [];
    
    return faculty.map(facultyMember => {
      if (!facultyMember.name || !facultyMember.department) {
        return {
          ...facultyMember,
          reviewCount: 0,
          averageRating: 0,
          calculationErrors: []
        };
      }
      
      // More flexible matching - case insensitive and trimmed
      const facultyReviews = reviews.filter(review => {
        if (!review.teacherName || !review.teacherDepartment) return false;
        
        const nameMatch = review.teacherName.toLowerCase().trim() === facultyMember.name.toLowerCase().trim();
        const deptMatch = review.teacherDepartment.toLowerCase().trim() === facultyMember.department.toLowerCase().trim();
        
        return nameMatch && deptMatch;
      });
      
      const reviewCount = facultyReviews.length;
      let averageRating = 0;
      const calculationErrors = [];
      
      if (reviewCount > 0) {
        let validRatings = [];
        
        facultyReviews.forEach((review, index) => {
          const storedRating = parseFloat(review.overallEvaluation) || 0;
          const calculatedRating = verifyCalculation(review);
          
          // Check for calculation discrepancies
          if (calculatedRating && Math.abs(calculatedRating - storedRating) > 0.1) {
            calculationErrors.push({
              reviewIndex: index,
              stored: storedRating,
              calculated: calculatedRating,
              reviewId: review._id
            });
          }
          
          // Use calculated rating if available, otherwise use stored
          validRatings.push(calculatedRating || storedRating);
        });
        
        if (validRatings.length > 0) {
          const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);
          averageRating = totalRating / validRatings.length;
        }
      }

      return {
        ...facultyMember,
        reviewCount,
        averageRating: parseFloat(averageRating.toFixed(1)),
        calculationErrors: calculationErrors
      };
    });
  }, [faculty, reviews]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating % 1) >= 0.5;
    
    // Add filled stars
    for (let i = 1; i <= fullStars; i++) {
      stars.push(<FaStar key={`filled-${i}`} className="star filled" />);
    }
    
    // Add half star if needed
    if (hasHalfStar && fullStars < 5) {
      stars.push(<FaStar key="half" className="star half-filled" />);
    }
    
    // Add empty stars to complete 5 stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 1; i <= emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
    }
    
    return stars;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 4.0) return '#3b82f6';
    if (rating >= 3.5) return '#f59e0b';
    if (rating >= 2.0) return '#ef4444';
    return '#6b7280';
  };

  if (faculty.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FaGraduationCap />
        </div>
        <h3>No Faculty Found</h3>
        <p>No faculty members match your current search criteria.</p>
      </div>
    );
  }

  return (
    <div className="faculty-list">
      <div className="list-header">
        <h2>Faculty Members ({faculty.length})</h2>
        <p>Manage and view all registered faculty members with their performance ratings</p>
      </div>

      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ background: '#f0f9ff', padding: '16px', margin: '16px 0', borderRadius: '8px', fontSize: '14px' }}>
          <h4>Debug Info:</h4>
          <p>Total Faculty: {faculty.length}</p>
          <p>Total Reviews: {reviews.length}</p>
          <p>Faculty with Ratings: {facultyWithRatings.filter(f => f.reviewCount > 0).length}</p>
          <p>Calculation Errors Found: {facultyWithRatings.reduce((sum, f) => sum + f.calculationErrors.length, 0)}</p>
          
          {facultyWithRatings.slice(0, 3).map(f => (
            <div key={f._id} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
              <strong>{f.name}</strong> ({f.department}) - Reviews: {f.reviewCount}, Avg: {f.averageRating}
              {f.calculationErrors.length > 0 && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  ⚠️ {f.calculationErrors.length} calculation error(s) detected
                </div>
              )}
            </div>
          ))}
          
          {/* Show calculation errors if any */}
          {facultyWithRatings.some(f => f.calculationErrors.length > 0) && (
            <div style={{ marginTop: '12px', padding: '8px', background: '#fef2f2', borderRadius: '4px' }}>
              <h5 style={{ color: '#dc2626', margin: '0 0 8px 0' }}>Calculation Discrepancies:</h5>
              {facultyWithRatings.filter(f => f.calculationErrors.length > 0).map(f => (
                <div key={f._id} style={{ marginBottom: '4px', fontSize: '12px' }}>
                  <strong>{f.name}:</strong> {f.calculationErrors.map(err => 
                    `Stored: ${err.stored}, Calculated: ${err.calculated}`
                  ).join(', ')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="faculty-grid">
        {facultyWithRatings.map((facultyMember) => (
          <div key={facultyMember._id} className="faculty-card">
            <div className="faculty-header">
              <div className="faculty-avatar">
                {facultyMember.name.charAt(0).toUpperCase()}
              </div>
              <div className="faculty-info">
                <h3 className="faculty-name">{facultyMember.name}</h3>
                <p className="faculty-department">{facultyMember.department}</p>
                <p className="faculty-subject">{facultyMember.subject}</p>
                {/* Rating Display */}
                <div className="faculty-rating">
                  {facultyMember.reviewCount > 0 ? (
                    <div className="rating-container">
                      <div className="rating-stars">
                        {renderStars(facultyMember.averageRating)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className="rating-text" style={{ color: getRatingColor(facultyMember.averageRating), fontWeight: 'bold' }}>
                          {facultyMember.averageRating}/5.0
                        </span>
                        <span className="review-count">
                          ({facultyMember.reviewCount} review{facultyMember.reviewCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-rating">
                      <FaChartBar className="no-rating-icon" />
                      <span className="no-rating-text">No reviews yet</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="faculty-actions">
                <button
                  className="action-btn view"
                  onClick={() => toggleExpanded(facultyMember._id)}
                  title="View Details"
                >
                  <FaEye />
                </button>
                <button
                  className="action-btn edit"
                  onClick={() => onEdit(facultyMember)}
                  title="Edit Faculty"
                >
                  <FaEdit />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => onDelete(facultyMember)}
                  title="Delete Faculty"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {expandedFaculty === facultyMember._id && (
              <div className="faculty-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <FaEnvelope className="detail-icon" />
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{facultyMember.email}</span>
                  </div>
                  <div className="detail-item">
                    <FaPhone className="detail-icon" />
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{facultyMember.phone}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-item">
                    <FaGraduationCap className="detail-icon" />
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{facultyMember.department}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Subject:</span>
                    <span className="detail-value">{facultyMember.subject}</span>
                  </div>
                </div>

                {/* Rating Statistics */}
                <div className="detail-row">
                  <div className="detail-item">
                    <FaStar className="detail-icon" />
                    <span className="detail-label">Average Rating:</span>
                    <span className="detail-value" style={{ color: getRatingColor(facultyMember.averageRating), fontWeight: 'bold' }}>
                      {facultyMember.reviewCount > 0 ? `${facultyMember.averageRating}/5.0` : 'No ratings'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <FaChartBar className="detail-icon" />
                    <span className="detail-label">Total Reviews:</span>
                    <span className="detail-value">{facultyMember.reviewCount}</span>
                  </div>
                </div>

                {facultyMember.createdAt && (
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Joined:</span>
                      <span className="detail-value">
                        {new Date(facultyMember.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table View for larger screens */}
      <div className="faculty-table-container">
        <table className="faculty-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Subject</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyWithRatings.map((facultyMember) => (
              <tr key={facultyMember._id}>
                <td>
                  <div className="faculty-name-cell">
                    <div className="faculty-avatar-small">
                      {facultyMember.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{facultyMember.name}</span>
                  </div>
                </td>
                <td>{facultyMember.department}</td>
                <td>{facultyMember.subject}</td>
                <td>
                  {facultyMember.reviewCount > 0 ? (
                    <div className="rating-cell">
                      <div className="rating-stars-small">
                        {renderStars(facultyMember.averageRating)}
                      </div>
                      <span className="rating-number-small" style={{ color: getRatingColor(facultyMember.averageRating), fontWeight: 'bold' }}>
                        {facultyMember.averageRating}/5
                      </span>
                    </div>
                  ) : (
                    <span className="no-rating-table">No ratings</span>
                  )}
                </td>
                <td>
                  <span className="review-count-table">
                    {facultyMember.reviewCount}
                  </span>
                </td>
                <td>{facultyMember.email}</td>
                <td>{facultyMember.phone}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(facultyMember)}
                      title="Edit Faculty"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(facultyMember)}
                      title="Delete Faculty"
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

export default FacultyList; 