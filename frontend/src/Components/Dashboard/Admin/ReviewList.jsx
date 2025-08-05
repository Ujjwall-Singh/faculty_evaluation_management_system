import React, { useState, useCallback, useEffect } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaEyeSlash,
  FaComments
} from 'react-icons/fa';
import './ReviewList.css';

const ReviewList = ({ 
  reviews, 
  onEdit, 
  onDelete, 
  searchTerm, 
  filterDepartment, 
  filterCourse, 
  filterSemester, 
  filterSection, 
  filterTeacher,
  filterSubject,
  filterTeacherDepartment, 
  filterRating,
  filterBatch,
  filterStudentName,
  filterAdmissionNo
}) => {
  const [expandedReview, setExpandedReview] = useState(null);

  const toggleExpanded = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  // Enhanced extraction functions matching review form structure
  const extractDepartment = useCallback((review) => {
    // Priority order based on review form fields
    if (review.branch) {
      return review.branch; // Direct from form's branch field
    }
    if (review.studentDepartment || review.department) {
      return review.studentDepartment || review.department;
    }
    // Parse from branchSemester: "Computer Science Engineering - 6th Semester - Section A"
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      if (parts.length >= 1) {
        return parts[0]; // "Computer Science Engineering"
      }
    }
    return 'N/A';
  }, []);

  const extractSemester = useCallback((review) => {
    // Priority: individual semester field first, then branchSemester parsing
    if (review.semester) {
      return review.semester; // Direct from form's semester field
    }
    if (review.studentSemester) {
      return review.studentSemester;
    }
    // Parse from branchSemester: "Computer Science Engineering - 6th Semester - Section A"
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      if (parts.length >= 2) {
        const semesterPart = parts[1]; // "6th Semester"
        const match = semesterPart.match(/(\d+)(st|nd|rd|th)?/i);
        return match ? match[1] : semesterPart.replace(' Semester', '');
      }
    }
    return 'N/A';
  }, []);

  const extractSection = useCallback((review) => {
    // Priority: individual section field first, then branchSemester parsing
    if (review.section) {
      return review.section; // Direct from form's section field
    }
    if (review.studentSection) {
      return review.studentSection;
    }
    // Parse from branchSemester: "Computer Science Engineering - 6th Semester - Section A"
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      if (parts.length >= 3) {
        const sectionPart = parts[2].trim(); // "Section A" → "A"
        return sectionPart.replace(/^Section\s*/i, '').trim();
      }
      
      // Alternative parsing - look for section pattern anywhere in branchSemester
      const sectionMatch = review.branchSemester.match(/Section\s*([A-Z0-9]+)|([A-Z])\s*$/i);
      if (sectionMatch) {
        return (sectionMatch[1] || sectionMatch[2]).toUpperCase();
      }
    }
    return 'N/A';
  }, []);

  const extractCourse = useCallback((review) => {
    // Enhanced course extraction based on review form structure
    const dept = review.branch || // Direct from form's branch field
               extractDepartment(review);
    
    // Map department to course abbreviation
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
    
    // Priority: explicit course field, then mapped from department, then department name
    return review.studentCourse || review.course || courseMap[dept] || dept;
  }, [extractDepartment]);

  // Enhanced Academic Info Component
  const AcademicInfo = ({ review }) => {
    const department = extractDepartment(review);
    const semester = extractSemester(review);
    const section = extractSection(review);
    const course = extractCourse(review);
    
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-800">{department}</div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Sem: {semester}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Sec: {section}
          </span>
          {course && course !== 'N/A' && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              {course}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Raw: {review.branchSemester || 'N/A'}
        </div>
        <DebugInfo review={review} />
      </div>
    );
  };

  // Review Analysis Component
  const ReviewAnalysis = ({ review }) => {
    const ratingCategories = [
      { key: 'teachingQuality', label: 'Teaching Quality' },
      { key: 'communicationSkills', label: 'Communication' },
      { key: 'subjectKnowledge', label: 'Subject Knowledge' },
      { key: 'punctuality', label: 'Punctuality' },
      { key: 'studentSupport', label: 'Student Support' },
      { key: 'classroomManagement', label: 'Classroom Mgmt' },
      { key: 'assessmentMethods', label: 'Assessment' },
      { key: 'innovation', label: 'Innovation' }
    ];

    const averageRating = ratingCategories.reduce((sum, cat) => 
      sum + (review[cat.key] || 0), 0) / ratingCategories.length;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {ratingCategories.map((category) => (
            <div key={category.key} className="flex justify-between items-center">
              <span className="text-xs text-gray-600">{category.label}:</span>
              <div className="flex items-center">
                {renderStars(review[category.key] || 0)}
                <span className="ml-1 text-xs text-gray-500">
                  {(review[category.key] || 0).toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Average:</span>
            <div className="flex items-center">
              {renderStars(averageRating)}
              <span className="ml-2 text-sm font-semibold text-gray-900">
                {averageRating.toFixed(2)}/5
              </span>
            </div>
          </div>
        </div>
        
        {review.suggestions && (
          <div className="border-t pt-2">
            <p className="text-xs text-gray-600">
              <strong>Suggestions:</strong> {review.suggestions.substring(0, 100)}
              {review.suggestions.length > 100 ? '...' : ''}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Debug Information Component (for development)
  const DebugInfo = ({ review }) => {
    const [showDebug, setShowDebug] = useState(false);
    
    if (!showDebug) {
      return (
        <button 
          onClick={() => setShowDebug(true)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          🔍 Debug
        </button>
      );
    }
    
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium">Debug Info:</span>
          <button 
            onClick={() => setShowDebug(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="space-y-1 text-gray-600">
          <div><strong>branchSemester:</strong> {review.branchSemester || 'null'}</div>
          <div><strong>extractDepartment:</strong> {extractDepartment(review)}</div>
          <div><strong>extractSemester:</strong> {extractSemester(review)}</div>
          <div><strong>extractSection:</strong> {extractSection(review)}</div>
          <div><strong>extractCourse:</strong> {extractCourse(review)}</div>
          <div><strong>studentSection:</strong> {review.studentSection || 'null'}</div>
          <div><strong>section:</strong> {review.section || 'null'}</div>
        </div>
      </div>
    );
  };

  const extractBatch = useCallback((review) => {
    if (review.studentBatch || review.batch) {
      return review.studentBatch || review.batch;
    }
    const year = new Date(review.createdAt || review._id).getFullYear();
    return year.toString();
  }, []);

  // Enhanced filter reviews based on search and filters from parent (matching review form fields)
  const filteredReviews = reviews.filter(review => {
    // Search term matching (student name, teacher name, admission no, suggestions)
    const matchesSearch = searchTerm === '' || 
      review.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.suggestions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Student details filters (from review form)
    const matchesDepartment = filterDepartment === '' || filterDepartment === 'all' || 
      extractDepartment(review) === filterDepartment;
    const matchesCourse = filterCourse === '' || filterCourse === 'all' || 
      extractCourse(review) === filterCourse;
    const matchesSemester = filterSemester === '' || filterSemester === 'all' || 
      extractSemester(review) === filterSemester;
    const matchesSection = filterSection === '' || filterSection === 'all' || 
      extractSection(review) === filterSection;
    
    // Teacher details filters (from review form)
    const matchesTeacher = filterTeacher === '' || filterTeacher === 'all' || 
      review.teacherName === filterTeacher;
    const matchesSubject = filterSubject === '' || filterSubject === 'all' || 
      review.teacherSubject === filterSubject;
    const matchesTeacherDepartment = filterTeacherDepartment === '' || filterTeacherDepartment === 'all' || 
      review.teacherDepartment === filterTeacherDepartment;
      
    // Additional filters
    const matchesRating = filterRating === '' || filterRating === 'all' || 
      Math.round(review.overallEvaluation) === parseInt(filterRating);
    const matchesBatch = filterBatch === '' || filterBatch === 'all' || 
      extractBatch(review) === filterBatch;
    const matchesStudentName = filterStudentName === '' || filterStudentName === 'all' || 
      review.studentName?.toLowerCase().includes(filterStudentName.toLowerCase());
    const matchesAdmissionNo = filterAdmissionNo === '' || filterAdmissionNo === 'all' || 
      review.admissionNo?.toLowerCase().includes(filterAdmissionNo.toLowerCase());
    
    return matchesSearch && matchesDepartment && matchesCourse && 
           matchesSemester && matchesSection && matchesTeacher && 
           matchesSubject && matchesTeacherDepartment && matchesRating && 
           matchesBatch && matchesStudentName && matchesAdmissionNo;
  });

  // Enhanced debug: Log filtering results
  useEffect(() => {
    if (reviews.length > 0) {
      console.log('Enhanced ReviewList Filter Debug:', {
        totalReviews: reviews.length,
        filteredCount: filteredReviews.length,
        sampleReview: reviews[0] ? {
          // Student details from form
          studentName: reviews[0].studentName,
          admissionNo: reviews[0].admissionNo,
          branch: reviews[0].branch,
          semester: reviews[0].semester,
          section: reviews[0].section,
          branchSemester: reviews[0].branchSemester,
          // Teacher details from form
          teacherName: reviews[0].teacherName,
          teacherSubject: reviews[0].teacherSubject,
          teacherDepartment: reviews[0].teacherDepartment,
          // Extracted values
          extractedDepartment: extractDepartment(reviews[0]),
          extractedSemester: extractSemester(reviews[0]),
          extractedSection: extractSection(reviews[0]),
          extractedCourse: extractCourse(reviews[0])
        } : null,
        activeFilters: {
          searchTerm,
          filterDepartment,
          filterCourse,
          filterSemester,
          filterSection,
          filterTeacher,
          filterSubject,
          filterTeacherDepartment,
          filterRating,
          filterBatch,
          filterStudentName,
          filterAdmissionNo
        }
      });
    }
  }, [reviews, filteredReviews, searchTerm, filterDepartment, filterCourse, filterSemester, 
      filterSection, filterTeacher, filterSubject, filterTeacherDepartment, filterRating, 
      filterBatch, filterStudentName, filterAdmissionNo, extractDepartment, extractSemester, 
      extractSection, extractCourse]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        size={16}
      />
    ));
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
      {/* Enhanced Review Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Total Reviews</div>
          <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Filtered Results</div>
          <div className="text-2xl font-bold text-blue-600">{filteredReviews.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredReviews.length > 0 
              ? (filteredReviews.reduce((sum, review) => sum + (review.overallEvaluation || 0), 0) / filteredReviews.length).toFixed(1)
              : '0.0'
            }/5
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Unique Teachers</div>
          <div className="text-2xl font-bold text-purple-600">
            {new Set(filteredReviews.map(r => r.teacherName).filter(Boolean)).size}
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher & Review Analysis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {(review.studentName || 'S').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {review.studentName || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.admissionNo || 'No Admission No'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{review.teacherName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {review.teacherSubject || 'No Subject'} • {review.teacherDepartment || 'No Dept'}
                        </div>
                      </div>
                      <ReviewAnalysis review={review} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AcademicInfo review={review} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleExpanded(review._id)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title={expandedReview === review._id ? "Hide details" : "View details"}
                      >
                        {expandedReview === review._id ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                      <button
                        onClick={() => onEdit(review)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit review"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(review._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete review"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Review Details */}
      {expandedReview && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {(() => {
            const review = filteredReviews.find(r => r._id === expandedReview);
            if (!review) return null;
            
            return (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
                  <button
                    onClick={() => setExpandedReview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaEyeSlash size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {review.studentName || 'Anonymous'}</div>
                      <div><strong>Admission No:</strong> {review.admissionNo || 'N/A'}</div>
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Academic Details</h5>
                      <AcademicInfo review={review} />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Review Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Teacher:</strong> {review.teacherName || 'N/A'}</div>
                      <div><strong>Subject:</strong> {review.teacherSubject || 'N/A'}</div>
                      <div><strong>Department:</strong> {review.teacherDepartment || 'N/A'}</div>
                      <div className="flex items-center">
                        <strong className="mr-2">Overall Rating:</strong>
                        {renderStars(review.overallEvaluation || 0)}
                        <span className="ml-2">{(review.overallEvaluation || 0).toFixed(1)}/5</span>
                      </div>
                      <div><strong>Date:</strong> {new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                {/* Detailed Ratings */}
                {review.ratings && Object.keys(review.ratings).length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Detailed Ratings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(review.ratings).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="flex items-center">
                            {renderStars(value || 0)}
                            <span className="ml-2 text-sm text-gray-600">{value || 0}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {review.suggestions && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{review.suggestions}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
      
      {filteredReviews.length === 0 && reviews.length > 0 && (
        <div className="text-center py-12">
          <FaComments className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
