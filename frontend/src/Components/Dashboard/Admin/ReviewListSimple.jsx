import React, { useState, useCallback } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaUser, 
  FaGraduationCap, 
  FaEyeSlash,
  FaComments,
  FaBookOpen,
  FaClock,
  FaSchool
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
  filterRating,
  filterBatch 
}) => {
  const [expandedReview, setExpandedReview] = useState(null);

  const toggleExpanded = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  // Simple extraction functions (like StudentList pattern)
  const extractSemester = useCallback((review) => {
    if (review.studentSemester || review.semester) {
      return review.studentSemester || review.semester;
    }
    
    if (review.branchSemester) {
      const match = review.branchSemester.match(/(\d+)(st|nd|rd|th)/i);
      return match ? match[1] : '';
    }
    return 'N/A';
  }, []);

  const extractSection = useCallback((review) => {
    if (review.studentSection || review.section) {
      return review.studentSection || review.section;
    }
    
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      if (parts.length >= 3) {
        return parts[2];
      }
    }
    return 'N/A';
  }, []);

  const extractDepartment = useCallback((review) => {
    return review.studentDepartment || review.department || review.branch || 'N/A';
  }, []);

  const extractCourse = useCallback((review) => {
    const dept = extractDepartment(review);
    const courseMap = {
      'Computer Science Engineering': 'CSE',
      'Information Technology': 'IT',
      'Electronics & Communication': 'ECE',
      'Mechanical Engineering': 'ME',
      'Civil Engineering': 'CE',
      'Electrical Engineering': 'EE'
    };
    return review.studentCourse || review.course || courseMap[dept] || dept;
  }, [extractDepartment]);

  const extractBatch = useCallback((review) => {
    if (review.studentBatch || review.batch) {
      return review.studentBatch || review.batch;
    }
    const year = new Date(review.createdAt || review._id).getFullYear();
    return year.toString();
  }, []);

  // Filter reviews based on search and filters from parent (like StudentList)
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === '' || 
      review.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comments?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === '' || filterDepartment === 'all' || 
      extractDepartment(review) === filterDepartment;
    const matchesCourse = filterCourse === '' || filterCourse === 'all' || 
      extractCourse(review) === filterCourse;
    const matchesSemester = filterSemester === '' || filterSemester === 'all' || 
      extractSemester(review) === filterSemester;
    const matchesSection = filterSection === '' || filterSection === 'all' || 
      extractSection(review) === filterSection;
    const matchesTeacher = filterTeacher === '' || filterTeacher === 'all' || 
      review.teacherName === filterTeacher;
    const matchesRating = filterRating === '' || filterRating === 'all' || 
      review.rating === parseInt(filterRating);
    const matchesBatch = filterBatch === '' || filterBatch === 'all' || 
      extractBatch(review) === filterBatch;
    
    return matchesSearch && matchesDepartment && matchesCourse && 
           matchesSemester && matchesSection && matchesTeacher && 
           matchesRating && matchesBatch;
  });

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
      {/* Results count */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="text-sm text-gray-600">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher & Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Info
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
                          {review.studentRollNo || 'No Roll No'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{review.teacherName || 'N/A'}</div>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating || 0)}
                        <span className="ml-2 text-sm text-gray-600">
                          {review.rating || 0}/5
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaGraduationCap className="mr-1 text-blue-600" />
                        {extractDepartment(review)}
                      </div>
                      <div className="text-gray-500">
                        {extractSemester(review)} - {extractSection(review)}
                      </div>
                    </div>
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
                      <div><strong>Roll No:</strong> {review.studentRollNo || 'N/A'}</div>
                      <div><strong>Department:</strong> {extractDepartment(review)}</div>
                      <div><strong>Semester:</strong> {extractSemester(review)}</div>
                      <div><strong>Section:</strong> {extractSection(review)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Review Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Teacher:</strong> {review.teacherName || 'N/A'}</div>
                      <div><strong>Subject:</strong> {review.teacherSubject || 'N/A'}</div>
                      <div className="flex items-center">
                        <strong className="mr-2">Rating:</strong>
                        {renderStars(review.rating || 0)}
                        <span className="ml-2">{review.rating || 0}/5</span>
                      </div>
                      <div><strong>Date:</strong> {new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                {review.comments && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{review.comments}</p>
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
