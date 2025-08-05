import React, { useState, useMemo } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaGraduationCap,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExport,
  FaCalendarAlt,
  FaEnvelope,
  FaIdCard,
  FaSchool,
  FaInfoCircle,
  FaUserGraduate,
  FaBookOpen,
  FaLayerGroup
} from 'react-icons/fa';

const StudentListAdvanced = ({ 
  students = [], 
  onEdit, 
  onDelete, 
  searchTerm = '',
  filterStudentDepartment = '',
  filterCourse = '',
  filterSemester = '',
  filterSection = '',
  filterBatch = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards'

  // Advanced filtering logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Text search across multiple fields
      const matchesSearch = searchTerm === '' || 
        student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.universityRollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter matching
      const matchesDepartment = filterStudentDepartment === '' || student.department === filterStudentDepartment;
      const matchesCourse = filterCourse === '' || student.course === filterCourse;
      const matchesSemester = filterSemester === '' || student.semester === filterSemester;
      const matchesSection = filterSection === '' || student.section === filterSection;
      const matchesBatch = filterBatch === '' || student.admissionYear === filterBatch || student.batch === filterBatch;

      return matchesSearch && matchesDepartment && matchesCourse && matchesSemester && matchesSection && matchesBatch;
    });
  }, [students, searchTerm, filterStudentDepartment, filterCourse, filterSemester, filterSection, filterBatch]);

  // Advanced sorting logic
  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return filteredStudents;

    return [...filteredStudents].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.username || '';
          bValue = b.username || '';
          break;
        case 'admissionNo':
          aValue = a.admissionNo || '';
          bValue = b.admissionNo || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'department':
          aValue = a.department || '';
          bValue = b.department || '';
          break;
        case 'semester':
          aValue = parseInt(a.semester) || 0;
          bValue = parseInt(b.semester) || 0;
          break;
        case 'section':
          aValue = a.section || '';
          bValue = b.section || '';
          break;
        case 'course':
          aValue = a.course || '';
          bValue = b.course || '';
          break;
        case 'batch':
          aValue = parseInt(a.admissionYear || a.batch) || 0;
          bValue = parseInt(b.admissionYear || b.batch) || 0;
          break;
        default:
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortConfig]);

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

  // Analytics data
  const analytics = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const uniqueDepartments = new Set(filteredStudents.map(s => s.department).filter(Boolean)).size;
    const uniqueCourses = new Set(filteredStudents.map(s => s.course).filter(Boolean)).size;
    const currentYearStudents = filteredStudents.filter(s => {
      const currentYear = new Date().getFullYear();
      return (s.admissionYear || s.batch) === currentYear || (s.admissionYear || s.batch) === currentYear.toString();
    }).length;
    const semesterDistribution = {};
    
    filteredStudents.forEach(student => {
      const sem = student.semester || 'Unknown';
      semesterDistribution[sem] = (semesterDistribution[sem] || 0) + 1;
    });

    const mostPopularSemester = Object.keys(semesterDistribution).reduce((a, b) => 
      semesterDistribution[a] > semesterDistribution[b] ? a : b, '1'
    );

    return {
      totalStudents,
      uniqueDepartments,
      uniqueCourses,
      currentYearStudents,
      mostPopularSemester,
      semesterDistribution
    };
  }, [filteredStudents]);

  // Export functionality (placeholder)
  const handleExport = () => {
    console.log('Exporting students...', sortedStudents);
    // TODO: Implement CSV/PDF export
  };

  // Get student status badge
  const getStatusBadge = (student) => {
    const currentYear = new Date().getFullYear();
    const admissionYear = parseInt(student.admissionYear || student.batch) || currentYear;
    const yearsEnrolled = currentYear - admissionYear;
    
    if (yearsEnrolled === 0) return { text: 'New', color: 'bg-green-100 text-green-800 border-green-200' };
    if (yearsEnrolled <= 2) return { text: 'Active', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (yearsEnrolled <= 4) return { text: 'Senior', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    return { text: 'Alumni', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <FaUser className="mx-auto text-gray-400 text-6xl mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Found</h3>
        <p className="text-gray-500">Add your first student to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaUser className="text-blue-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Total Students</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaSchool className="text-green-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Departments</div>
              <div className="text-2xl font-bold text-green-600">{analytics.uniqueDepartments}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaBookOpen className="text-purple-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Courses</div>
              <div className="text-2xl font-bold text-purple-600">{analytics.uniqueCourses}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaUserGraduate className="text-orange-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">New Students</div>
              <div className="text-2xl font-bold text-orange-600">{analytics.currentYearStudents}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FaLayerGroup className="text-red-500 text-2xl mr-3" />
            <div>
              <div className="text-sm text-gray-600">Popular Semester</div>
              <div className="text-2xl font-bold text-red-600">{analytics.mostPopularSemester}</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{sortedStudents.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{students.length}</span> students
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

      {/* Students Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Student</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('admissionNo')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Admission Details</span>
                      {renderSortIcon('admissionNo')}
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
                    onClick={() => handleSort('batch')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {renderSortIcon('batch')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((student) => {
                  const status = getStatusBadge(student);
                  
                  return (
                    <tr key={student._id || student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {(student.username || 'U').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.username || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaEnvelope className="mr-1 text-xs" />
                              {student.email || 'No Email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center font-medium mb-1">
                            <FaIdCard className="mr-2 text-gray-400" />
                            {student.admissionNo || 'N/A'}
                          </div>
                          <div className="text-gray-500 text-xs">
                            Roll: {student.universityRollNo || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center font-medium mb-1">
                            <FaGraduationCap className="text-gray-400 mr-2" />
                            <span>{student.department || 'No Department'}</span>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {student.course || 'No Course'} • Sem {student.semester || 'N/A'} • Sec {student.section || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            {status.text}
                          </span>
                          <div className="text-xs text-gray-500 flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            Batch {student.admissionYear || student.batch || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEdit(student)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors"
                            title="Edit student"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => onDelete(student)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete student"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Cards View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStudents.map((student) => {
            const status = getStatusBadge(student);
            
            return (
              <div key={student._id || student.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                        {(student.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{student.username || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{student.admissionNo || 'No ID'}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      <span className="truncate">{student.email || 'No email'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Roll No: {student.universityRollNo || 'N/A'}
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaGraduationCap className="mr-2 text-gray-400" />
                      <span className="font-medium">{student.department || 'No Department'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <div className="flex justify-between items-center">
                        <span>{student.course || 'No Course'}</span>
                        <span>Semester {student.semester || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span>Section {student.section || 'N/A'}</span>
                        <span>Batch {student.admissionYear || student.batch || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                      onClick={() => onEdit(student)}
                      className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors"
                      title="Edit student"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete(student)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete student"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {sortedStudents.length === 0 && students.length > 0 && (
        <div className="text-center py-12">
          <FaInfoCircle className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Match Your Filters</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default StudentListAdvanced;
