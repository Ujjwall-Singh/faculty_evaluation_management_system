import React, { useState, useMemo, useCallback } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaEyeSlash,
  FaComments,
  FaUser,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExport,
  FaCalendarAlt,
  FaAward,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';
import './ReviewListAdvanced.css';

const ReviewListAdvanced = ({ 
  reviews = [], 
  onEdit, 
  onDelete, 
  searchTerm = '',
  filterDepartment = '',
  filterCourse = '',
  filterSemester = '',
  filterSection = '',
  filterTeacher = '',
  filterSubject = '',
  filterTeacherDepartment = '',
  filterRating = '',
  filterBatch = '',
  filterStudentName = '',
  filterAdmissionNo = ''
}) => {
  const [expandedReview, setExpandedReview] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards'

  // Enhanced extraction functions with priority-based field mapping
  const extractDepartment = useCallback((review) => {
    return review.branch || 
           review.studentDepartment || 
           review.department || 
           review.teacherDepartment ||
           (review.branchSemester ? review.branchSemester.split(' - ')[0] : '') || 
           'N/A';
  }, []);

  const extractSemester = useCallback((review) => {
    if (review.semester) return review.semester;
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      if (parts.length >= 2) {
        const semesterPart = parts[1];
        const match = semesterPart.match(/(\d+)(st|nd|rd|th)?/i);
        return match ? match[1] : semesterPart.replace(' Semester', '');
      }
    }
    return review.studentSemester || 'N/A';
  }, []);

  const extractSection = useCallback((review) => {
    if (review.section) return review.section;
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      if (parts.length >= 3) {
        return parts[2].replace(/^Section\s*/i, '').trim();
      }
      const sectionMatch = review.branchSemester.match(/Section\s*([A-Z0-9]+)|([A-Z])\s*$/i);
      if (sectionMatch) {
        return (sectionMatch[1] || sectionMatch[2]).toUpperCase();
      }
    }
    return review.studentSection || 'N/A';
  }, []);

  const extractCourse = useCallback((review) => {
    const dept = extractDepartment(review);
    const courseMap = {
      'Computer Science Engineering': 'CSE',
      'Information Technology': 'IT',
      'Electronics & Communication': 'ECE', 
      'Mechanical Engineering': 'ME',
      'Civil Engineering': 'CE',
      'Electrical Engineering': 'EE',
      'Chemical Engineering': 'CHE',
      'Biotechnology': 'BT'
    };
    return review.studentCourse || review.course || courseMap[dept] || dept;
  }, [extractDepartment]);

  const calculateAverageRating = useCallback((review) => {
    const ratingCategories = [
      'teachingQuality', 'communicationSkills', 'subjectKnowledge', 
      'punctuality', 'studentSupport', 'classroomManagement', 
      'assessmentMethods', 'innovation'
    ];
    
    const validRatings = ratingCategories
      .map(cat => review[cat] || 0)
      .filter(rating => rating > 0);
    
    return validRatings.length > 0 
      ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length 
      : (review.overallEvaluation || 0);
  }, []);

  // Advanced filtering logic
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // Text search
      const matchesSearch = searchTerm === '' || 
        review.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.teacherSubject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.suggestions?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter matching
      const matchesDepartment = filterDepartment === '' || extractDepartment(review) === filterDepartment;
      const matchesCourse = filterCourse === '' || extractCourse(review) === filterCourse;
      const matchesSemester = filterSemester === '' || extractSemester(review) === filterSemester;
      const matchesSection = filterSection === '' || extractSection(review) === filterSection;
      const matchesTeacher = filterTeacher === '' || review.teacherName === filterTeacher;
      const matchesSubject = filterSubject === '' || review.teacherSubject === filterSubject;
      const matchesTeacherDept = filterTeacherDepartment === '' || review.teacherDepartment === filterTeacherDepartment;
      const matchesStudentName = filterStudentName === '' || 
        review.studentName?.toLowerCase().includes(filterStudentName.toLowerCase());
      const matchesAdmissionNo = filterAdmissionNo === '' || 
        review.admissionNo?.toLowerCase().includes(filterAdmissionNo.toLowerCase());
      
      // Rating filter with proper logic
      const avgRating = calculateAverageRating(review);
      const matchesRating = filterRating === '' || 
        (filterRating === '5' && avgRating >= 4.5) ||
        (filterRating === '4' && avgRating >= 3.5 && avgRating < 4.5) ||
        (filterRating === '3' && avgRating >= 2.5 && avgRating < 3.5) ||
        (filterRating === '2' && avgRating >= 1.5 && avgRating < 2.5) ||
        (filterRating === '1' && avgRating >= 0.5 && avgRating < 1.5);

      return matchesSearch && matchesDepartment && matchesCourse && matchesSemester && 
             matchesSection && matchesTeacher && matchesSubject && matchesTeacherDept && 
             matchesRating && matchesStudentName && matchesAdmissionNo;
    });
  }, [reviews, searchTerm, filterDepartment, filterCourse, filterSemester, filterSection, 
      filterTeacher, filterSubject, filterTeacherDepartment, filterRating, filterStudentName, 
      filterAdmissionNo, extractDepartment, extractCourse, extractSemester, extractSection, 
      calculateAverageRating]);

  // Advanced sorting logic
  const sortedReviews = useMemo(() => {
    if (!sortConfig.key) return filteredReviews;

    return [...filteredReviews].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'student':
          aValue = a.studentName || '';
          bValue = b.studentName || '';
          break;
        case 'teacher':
          aValue = a.teacherName || '';
          bValue = b.teacherName || '';
          break;
        case 'subject':
          aValue = a.teacherSubject || '';
          bValue = b.teacherSubject || '';
          break;
        case 'department':
          aValue = extractDepartment(a);
          bValue = extractDepartment(b);
          break;
        case 'semester':
          aValue = parseInt(extractSemester(a)) || 0;
          bValue = parseInt(extractSemester(b)) || 0;
          break;
        case 'rating':
          aValue = calculateAverageRating(a);
          bValue = calculateAverageRating(b);
          break;
        case 'date':
          aValue = new Date(a.createdAt || a.date || 0);
          bValue = new Date(b.createdAt || b.date || 0);
          break;
        default:
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredReviews, sortConfig, extractDepartment, extractSemester, calculateAverageRating]);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort icon renderer
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-gray-400 hover:text-gray-600" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-500" />
      : <FaSortDown className="text-blue-500" />;
  };

  // Star rating renderer
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        className={`${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'} text-sm`}
      />
    ));
  };

  // Rating badge renderer with enhanced display
  const renderRatingBadge = (rating) => {
    const getColorClass = (rating) => {
      if (rating >= 4.5) return 'bg-green-100 text-green-800 border-green-200';
      if (rating >= 3.5) return 'bg-blue-100 text-blue-800 border-blue-200';
      if (rating >= 2.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      if (rating >= 1.5) return 'bg-orange-100 text-orange-800 border-orange-200';
      return 'bg-red-100 text-red-800 border-red-200';
    };

    const getPerformanceText = (rating) => {
      if (rating >= 4.5) return 'Excellent';
      if (rating >= 3.5) return 'Good';
      if (rating >= 2.5) return 'Average';
      if (rating >= 1.5) return 'Below Avg';
      return 'Poor';
    };

    return (
      <div className="flex flex-col items-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getColorClass(rating)}`}>
          {rating > 0 ? `${rating.toFixed(1)}/5` : 'No Rating'}
        </span>
        {rating > 0 && (
          <span className="text-xs text-gray-500 mt-1">
            {getPerformanceText(rating)}
          </span>
        )}
      </div>
    );
  };

  // Analytics data
  const analytics = useMemo(() => {
    const totalReviews = filteredReviews.length;
    const avgRating = totalReviews > 0 
      ? filteredReviews.reduce((sum, review) => sum + calculateAverageRating(review), 0) / totalReviews 
      : 0;
    const uniqueTeachers = new Set(filteredReviews.map(r => r.teacherName).filter(Boolean)).size;
    const uniqueStudents = new Set(filteredReviews.map(r => r.studentName).filter(Boolean)).size;
    const excellentReviews = filteredReviews.filter(r => calculateAverageRating(r) >= 4.5).length;
    const poorReviews = filteredReviews.filter(r => calculateAverageRating(r) < 2.5).length;

    return {
      totalReviews,
      avgRating,
      uniqueTeachers,
      uniqueStudents,
      excellentReviews,
      poorReviews
    };
  }, [filteredReviews, calculateAverageRating]);

  // Toggle expanded view
  const toggleExpanded = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  // Export functionality (placeholder)
  const handleExport = () => {
    console.log('Exporting reviews...', sortedReviews);
    // TODO: Implement CSV/PDF export
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <FaComments className="mx-auto text-gray-400 text-6xl mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Found</h3>
        <p className="text-gray-500">Add your first review to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Development Debug Panel */}
      {process.env.NODE_ENV === 'development' && reviews.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <details>
            <summary className="text-sm font-medium text-yellow-800 cursor-pointer">
              🔧 Development Debug Panel - Review Data Structure
            </summary>
            <div className="mt-3 space-y-3">
              <div className="text-xs">
                <h6 className="font-semibold text-yellow-900">Sample Review Data Structure:</h6>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(reviews[0], null, 2)}
                </pre>
              </div>
              <div className="text-xs">
                <h6 className="font-semibold text-yellow-900">Extraction Results for First Review:</h6>
                <pre className="bg-white p-2 rounded text-xs">
                  {JSON.stringify({
                    studentName: reviews[0]?.studentName,
                    admissionNo: reviews[0]?.admissionNo,
                    branch: reviews[0]?.branch,
                    semester: reviews[0]?.semester,
                    section: reviews[0]?.section,
                    branchSemester: reviews[0]?.branchSemester,
                    extractedDepartment: extractDepartment(reviews[0]),
                    extractedSemester: extractSemester(reviews[0]),
                    extractedSection: extractSection(reviews[0]),
                    teacherName: reviews[0]?.teacherName,
                    teacherSubject: reviews[0]?.teacherSubject,
                    teacherDepartment: reviews[0]?.teacherDepartment
                  }, null, 2)}
                </pre>
              </div>
              <div className="text-xs">
                <h6 className="font-semibold text-yellow-900">Active Filters:</h6>
                <pre className="bg-white p-2 rounded text-xs">
                  {JSON.stringify({
                    searchTerm,
                    filterDepartment,
                    filterCourse,
                    filterSemester,
                    filterSection,
                    filterTeacher,
                    filterSubject,
                    filterTeacherDepartment,
                    filterRating,
                    filterStudentName,
                    filterAdmissionNo
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Enhanced Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaComments className="text-blue-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Total Reviews</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalReviews}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaStar className="text-yellow-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Avg Rating</div>
              <div className="text-2xl font-bold text-yellow-600">{analytics.avgRating.toFixed(1)}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaChalkboardTeacher className="text-green-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Teachers</div>
              <div className="text-2xl font-bold text-green-600">{analytics.uniqueTeachers}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaUser className="text-purple-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Students</div>
              <div className="text-2xl font-bold text-purple-600">{analytics.uniqueStudents}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaAward className="text-emerald-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Excellent</div>
              <div className="text-2xl font-bold text-emerald-600">{analytics.excellentReviews}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Needs Attention</div>
              <div className="text-2xl font-bold text-red-600">{analytics.poorReviews}</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{sortedReviews.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{reviews.length}</span> reviews
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Card View
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <FaFileExport className="inline mr-1" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('student')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Student Info</span>
                      {renderSortIcon('student')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('teacher')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Teacher Info</span>
                      {renderSortIcon('teacher')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Academic Info</span>
                      {renderSortIcon('department')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rating</span>
                      {renderSortIcon('rating')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {renderSortIcon('date')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedReviews.map((review) => {
                  const avgRating = calculateAverageRating(review);
                  const isExpanded = expandedReview === review._id;
                  
                  return (
                    <React.Fragment key={review._id || review.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {(review.studentName || 'S').charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {review.studentName || 'Unknown Student'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {review.admissionNo || 'No Admission No'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {extractDepartment(review)} • Sem {extractSemester(review)} • Sec {extractSection(review)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium flex items-center mb-1">
                              <FaChalkboardTeacher className="text-gray-400 mr-2" />
                              {review.teacherName || 'Unknown Teacher'}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Subject: {review.teacherSubject || 'Not Specified'}
                            </div>
                            <div className="text-xs text-gray-400">
                              Dept: {review.teacherDepartment || 'Not Specified'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <FaGraduationCap className="text-gray-400 mr-1" />
                              <span className="font-medium">{extractDepartment(review)}</span>
                            </div>
                            <div className="text-gray-500">
                              Sem {extractSemester(review)} • Sec {extractSection(review)}
                            </div>
                            <div className="text-xs text-gray-400">{extractCourse(review)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start space-y-2">
                            {renderRatingBadge(avgRating)}
                            <div className="flex items-center space-x-1">
                              {renderStars(avgRating)}
                              <span className="text-xs text-gray-600 ml-2">
                                ({avgRating > 0 ? avgRating.toFixed(2) : '0'} out of 5)
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'No Date'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleExpanded(review._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title={isExpanded ? "Hide details" : "Show details"}
                            >
                              {isExpanded ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            <button
                              onClick={() => onEdit(review)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit review"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => onDelete(review)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete review"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            <DetailedReviewAnalysis review={review} calculateAverageRating={calculateAverageRating} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Cards View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReviews.map((review) => {
            const avgRating = calculateAverageRating(review);
            
            return (
              <div key={review._id || review.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                        {(review.studentName || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{review.studentName || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">ID: {review.admissionNo || 'No ID'}</div>
                        <div className="text-xs text-gray-400">
                          {extractDepartment(review)} • Sem {extractSemester(review)} • Sec {extractSection(review)}
                        </div>
                      </div>
                    </div>
                    {renderRatingBadge(avgRating)}
                  </div>

                  {/* Teacher Info */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <FaChalkboardTeacher className="mr-2" />
                      <span className="font-medium">{review.teacherName || 'Unknown Teacher'}</span>
                    </div>
                    <div className="text-sm text-gray-500 ml-6">
                      <div>Subject: {review.teacherSubject || 'Not Specified'}</div>
                      <div>Department: {review.teacherDepartment || 'Not Specified'}</div>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <FaGraduationCap className="mr-2" />
                      <span>{extractDepartment(review)}</span>
                    </div>
                    <div className="text-sm text-gray-500 ml-6">
                      Semester {extractSemester(review)} • Section {extractSection(review)} • Course {extractCourse(review)}
                    </div>
                  </div>

                  {/* Enhanced Rating Display */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          {renderStars(avgRating)}
                          <span className="ml-2 text-sm font-semibold text-gray-800">
                            {avgRating > 0 ? `${avgRating.toFixed(2)}/5` : 'No Rating'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {avgRating >= 4.5 ? 'Excellent Performance' :
                           avgRating >= 3.5 ? 'Good Performance' :
                           avgRating >= 2.5 ? 'Average Performance' :
                           avgRating >= 1.5 ? 'Below Average' : 
                           avgRating > 0 ? 'Poor Performance' : 'Not Evaluated'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'No Date'}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Preview */}
                  {review.suggestions && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {review.suggestions.length > 100 
                          ? `${review.suggestions.substring(0, 100)}...` 
                          : review.suggestions
                        }
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <button
                      onClick={() => toggleExpanded(review._id)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FaInfoCircle className="mr-1" />
                      {expandedReview === review._id ? 'Hide Details' : 'View Details'}
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(review)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit review"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(review)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete review"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedReview === review._id && (
                  <div className="border-t bg-gray-50 p-6">
                    <DetailedReviewAnalysis review={review} calculateAverageRating={calculateAverageRating} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {sortedReviews.length === 0 && reviews.length > 0 && (
        <div className="text-center py-12">
          <FaInfoCircle className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Match Your Filters</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

// Detailed Review Analysis Component
const DetailedReviewAnalysis = ({ review, calculateAverageRating }) => {
  const ratingCategories = [
    { key: 'teachingQuality', label: 'Teaching Quality', icon: FaChalkboardTeacher },
    { key: 'communicationSkills', label: 'Communication', icon: FaComments },
    { key: 'subjectKnowledge', label: 'Subject Knowledge', icon: FaGraduationCap },
    { key: 'punctuality', label: 'Punctuality', icon: FaCalendarAlt },
    { key: 'studentSupport', label: 'Student Support', icon: FaUser },
    { key: 'classroomManagement', label: 'Classroom Management', icon: FaCheckCircle },
    { key: 'assessmentMethods', label: 'Assessment Methods', icon: FaAward },
    { key: 'innovation', label: 'Innovation', icon: FaStar }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        className={`${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'} text-sm`}
      />
    ));
  };

  const averageRating = calculateAverageRating(review);

  // Enhanced extraction functions for display
  const extractDepartment = (review) => {
    return review.branch || 
           review.studentDepartment || 
           review.department || 
           (review.branchSemester ? review.branchSemester.split(' - ')[0] : '') || 
           'Not Specified';
  };

  const extractSemester = (review) => {
    if (review.semester) return review.semester;
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      if (parts.length >= 2) {
        const semesterPart = parts[1];
        const match = semesterPart.match(/(\d+)(st|nd|rd|th)?/i);
        return match ? match[1] : semesterPart.replace(' Semester', '');
      }
    }
    return 'Not Specified';
  };

  const extractSection = (review) => {
    if (review.section) return review.section;
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      if (parts.length >= 3) {
        return parts[2].replace(/^Section\s*/i, '').trim();
      }
      const sectionMatch = review.branchSemester.match(/Section\s*([A-Z0-9]+)|([A-Z])\s*$/i);
      if (sectionMatch) {
        return (sectionMatch[1] || sectionMatch[2]).toUpperCase();
      }
    }
    return 'Not Specified';
  };

  return (
    <div className="space-y-6">
      {/* Student and Teacher Information Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Complete Student Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <FaUser className="mr-2" />
            Complete Student Details
          </h5>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">Student Name:</span>
              <span className="text-sm text-blue-900 font-semibold">
                {review.studentName || 'Not Provided'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">Admission Number:</span>
              <span className="text-sm text-blue-900 font-semibold">
                {review.admissionNo || 'Not Provided'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">Department/Branch:</span>
              <span className="text-sm text-blue-900 font-semibold">
                {extractDepartment(review)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">Semester:</span>
              <span className="text-sm text-blue-900 font-semibold">
                {extractSemester(review)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">Section:</span>
              <span className="text-sm text-blue-900 font-semibold">
                {extractSection(review)}
              </span>
            </div>
            {review.branchSemester && (
              <div className="border-t border-blue-300 pt-2 mt-2">
                <span className="text-xs text-blue-600">Original Format:</span>
                <p className="text-xs text-blue-800 italic">{review.branchSemester}</p>
              </div>
            )}
          </div>
        </div>

        {/* Complete Teacher Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
            <FaChalkboardTeacher className="mr-2" />
            Complete Teacher Details
          </h5>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">Teacher Name:</span>
              <span className="text-sm text-green-900 font-semibold">
                {review.teacherName || 'Not Provided'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">Subject:</span>
              <span className="text-sm text-green-900 font-semibold">
                {review.teacherSubject || 'Not Provided'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">Department:</span>
              <span className="text-sm text-green-900 font-semibold">
                {review.teacherDepartment || 'Not Provided'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">Review Date:</span>
              <span className="text-sm text-green-900 font-semibold">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Not Available'}
              </span>
            </div>
            {review._id && (
              <div className="border-t border-green-300 pt-2 mt-2">
                <span className="text-xs text-green-600">Review ID:</span>
                <p className="text-xs text-green-800 font-mono">{review._id}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detailed Ratings */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Ratings (Out of 5)</h4>
          <div className="space-y-3">
            {ratingCategories.map((category) => {
              const IconComponent = category.icon;
              // Enhanced rating extraction from multiple sources
              let rating = 0;
              
              // Try to get rating from ratings object first
              if (review.ratings && review.ratings[category.key]) {
                rating = parseFloat(review.ratings[category.key]);
              }
              // Fallback to direct review property
              else if (review[category.key]) {
                rating = parseFloat(review[category.key]);
              }
              // Ensure rating is between 0 and 5
              rating = Math.max(0, Math.min(5, rating));
              
              return (
                <div key={category.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <IconComponent className="text-gray-600 mr-3 text-lg" />
                    <span className="text-sm font-medium text-gray-800">{category.label}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex mr-3">{renderStars(rating)}</div>
                    <span className="text-sm font-bold text-gray-900 min-w-[3rem] bg-white px-2 py-1 rounded border">
                      {rating > 0 ? `${rating.toFixed(1)}/5` : 'Not Rated'}
                    </span>
                  </div>
                </div>
              );
            })}
            
            <div className="border-t-2 border-gray-300 pt-4 mt-4">
              <div className="flex items-center justify-between bg-blue-100 p-3 rounded-lg">
                <span className="text-base font-bold text-blue-900">Overall Average Rating:</span>
                <div className="flex items-center">
                  <div className="flex mr-3">{renderStars(averageRating)}</div>
                  <span className="text-xl font-bold text-blue-700 bg-white px-3 py-1 rounded border-2 border-blue-300">
                    {averageRating > 0 ? `${averageRating.toFixed(2)}/5` : 'No Ratings'}
                  </span>
                </div>
              </div>
              {/* Rating quality indicator */}
              <div className="mt-2 text-center">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  averageRating >= 4.5 ? 'bg-green-100 text-green-800' :
                  averageRating >= 3.5 ? 'bg-blue-100 text-blue-800' :
                  averageRating >= 2.5 ? 'bg-yellow-100 text-yellow-800' :
                  averageRating >= 1.5 ? 'bg-orange-100 text-orange-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {averageRating >= 4.5 ? 'Excellent Performance' :
                   averageRating >= 3.5 ? 'Good Performance' :
                   averageRating >= 2.5 ? 'Average Performance' :
                   averageRating >= 1.5 ? 'Below Average' : 
                   averageRating > 0 ? 'Poor Performance' : 'Not Evaluated'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback and Suggestions */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Feedback & Suggestions</h4>
          <div className="bg-white border rounded-lg p-4">
            {review.suggestions ? (
              <p className="text-sm text-gray-700 leading-relaxed">{review.suggestions}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No feedback provided</p>
            )}
          </div>
          
          {/* Overall Evaluation */}
          {review.overallEvaluation && (
            <div className="mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaStar className="text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-900">Overall Evaluation:</span>
                  <span className="ml-2 text-lg font-bold text-blue-600">
                    {review.overallEvaluation}/5
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Debug Information (helpful for troubleshooting) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <details className="bg-gray-50 border rounded-lg p-3">
                <summary className="text-xs text-gray-600 cursor-pointer">Debug Info</summary>
                <pre className="text-xs text-gray-500 mt-2 overflow-auto">
                  {JSON.stringify({
                    studentName: review.studentName,
                    admissionNo: review.admissionNo,
                    branch: review.branch,
                    semester: review.semester,
                    section: review.section,
                    branchSemester: review.branchSemester,
                    teacherName: review.teacherName,
                    teacherSubject: review.teacherSubject,
                    teacherDepartment: review.teacherDepartment
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewListAdvanced;
