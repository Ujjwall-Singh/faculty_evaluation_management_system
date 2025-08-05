import React from 'react';
import { FaUsers, FaStar, FaChartLine, FaAward, FaUserGraduate } from 'react-icons/fa';

const DashboardStats = ({ faculty, reviews, students = [] }) => {
  // Calculate statistics
  const totalFaculty = faculty.length;
  const totalReviews = reviews.length;
  const totalStudents = students.length;
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? parseFloat((reviews.reduce((sum, review) => sum + (parseFloat(review.overallEvaluation) || 0), 0) / reviews.length).toFixed(1))
    : 0;

  // Get unique departments
  const departments = [...new Set(faculty.map(f => f.department))];
  const totalDepartments = departments.length;

  // Calculate reviews per faculty
  const reviewsPerFaculty = totalFaculty > 0 ? (totalReviews / totalFaculty).toFixed(1) : 0;

  // Get top performing faculty (based on average ratings)
  const facultyRatings = faculty.map(f => {
    const facultyReviews = reviews.filter(r => {
      const nameMatch = r.teacherName && f.name && 
        r.teacherName.toLowerCase().trim() === f.name.toLowerCase().trim();
      const deptMatch = r.teacherDepartment && f.department && 
        r.teacherDepartment.toLowerCase().trim() === f.department.toLowerCase().trim();
      return nameMatch && deptMatch;
    });
    
    let avgRating = 0;
    if (facultyReviews.length > 0) {
      const totalRating = facultyReviews.reduce((sum, r) => sum + (parseFloat(r.overallEvaluation) || 0), 0);
      avgRating = totalRating / facultyReviews.length;
    }
    
    return { 
      ...f, 
      avgRating: parseFloat(avgRating.toFixed(1)), 
      reviewCount: facultyReviews.length 
    };
  });

  const topFaculty = facultyRatings
    .filter(f => f.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);

  // Department statistics
  const departmentStats = departments.map(dept => {
    const deptFaculty = faculty.filter(f => f.department && f.department.toLowerCase().trim() === dept.toLowerCase().trim());
    const deptReviews = reviews.filter(r => r.teacherDepartment && r.teacherDepartment.toLowerCase().trim() === dept.toLowerCase().trim());
    
    let avgRating = 0;
    if (deptReviews.length > 0) {
      const totalRating = deptReviews.reduce((sum, r) => sum + (parseFloat(r.overallEvaluation) || 0), 0);
      avgRating = parseFloat((totalRating / deptReviews.length).toFixed(1));
    }
    
    return {
      department: dept,
      facultyCount: deptFaculty.length,
      reviewCount: deptReviews.length,
      avgRating: avgRating
    };
  });

  const statsCards = [
    {
      title: 'Total Faculty',
      value: totalFaculty,
      icon: <FaUsers />,
      color: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
      description: 'Registered faculty members'
    },
    {
      title: 'Total Students',
      value: totalStudents,
      icon: <FaUserGraduate />,
      color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      description: 'Registered students'
    },
    {
      title: 'Total Reviews',
      value: totalReviews,
      icon: <FaStar />,
      color: 'linear-gradient(135deg, #c084fc 0%, #d946ef 100%)',
      description: 'Student evaluations submitted'
    },
    {
      title: 'Average Rating',
      value: averageRating,
      icon: <FaChartLine />,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: 'Overall faculty performance'
    },
    {
      title: 'Departments',
      value: totalDepartments,
      icon: <FaAward />,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      description: 'Active departments'
    }
  ];

  return (
    <div className="dashboard-stats">
      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color.includes('#8b5cf6') ? '#8b5cf6' : 
              stat.color.includes('#3b82f6') ? '#3b82f6' :
              stat.color.includes('#c084fc') ? '#c084fc' : 
              stat.color.includes('#10b981') ? '#10b981' : '#f59e0b' }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <h4 className="stat-title">{stat.title}</h4>
              <p className="stat-description">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="metrics-section">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Reviews per Faculty</h3>
            <div className="metric-value">{reviewsPerFaculty}</div>
            <p>Average reviews per faculty member</p>
          </div>
          
          <div className="metric-card">
            <h3>Active Faculty</h3>
            <div className="metric-value">
              {faculty.filter(f => 
                reviews.some(r => r.teacherName === f.name)
              ).length}
            </div>
            <p>Faculty with student reviews</p>
          </div>
        </div>
      </div>

      {/* Top Performing Faculty */}
      {topFaculty.length > 0 && (
        <div className="top-faculty-section">
          <h2>Top Performing Faculty</h2>
          <div className="faculty-list">
            {topFaculty.map((faculty, index) => (
              <div key={faculty._id} className="faculty-card">
                <div className="faculty-rank">#{index + 1}</div>
                <div className="faculty-info">
                  <h4>{faculty.name}</h4>
                  <p>{faculty.department} • {faculty.subject}</p>
                </div>
                <div className="faculty-stats">
                  <div className="rating">
                    <span className="rating-value">{faculty.avgRating.toFixed(1)}</span>
                    <span className="rating-label">/ 5.0</span>
                  </div>
                  <div className="review-count">
                    {faculty.reviewCount} reviews
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Performance */}
      {departmentStats.length > 0 && (
        <div className="department-stats-section">
          <h2>Department Performance</h2>
          <div className="department-grid">
            {departmentStats.map((dept, index) => (
              <div key={index} className="department-card">
                <h3>{dept.department}</h3>
                <div className="department-metrics">
                  <div className="dept-metric">
                    <span className="metric-label">Faculty:</span>
                    <span className="metric-value">{dept.facultyCount}</span>
                  </div>
                  <div className="dept-metric">
                    <span className="metric-label">Reviews:</span>
                    <span className="metric-value">{dept.reviewCount}</span>
                  </div>
                  <div className="dept-metric">
                    <span className="metric-label">Avg Rating:</span>
                    <span className="metric-value">{dept.avgRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {reviews.slice(0, 5).map((review, index) => (
            <div key={review._id || index} className="activity-item">
              <div className="activity-icon">
                <FaStar />
              </div>
              <div className="activity-content">
                <p>
                  <strong>{review.studentName}</strong> reviewed{' '}
                  <strong>{review.teacherName}</strong>
                </p>
                <span className="activity-time">
                  {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="activity-rating">
                {review.overallEvaluation}/5
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats; 