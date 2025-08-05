import React from 'react';
import { FaEdit, FaTrash, FaUser, FaGraduationCap } from 'react-icons/fa';

const StudentList = ({ 
  students, 
  onEdit, 
  onDelete, 
  searchTerm, 
  filterStudentDepartment, 
  filterCourse, 
  filterSemester, 
  filterSection, 
  filterBatch 
}) => {
  
  // Filter students based on search and filters from parent
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterStudentDepartment === '' || student.department === filterStudentDepartment;
    const matchesCourse = filterCourse === '' || student.course === filterCourse;
    const matchesSemester = filterSemester === '' || student.semester === filterSemester;
    const matchesSection = filterSection === '' || student.section === filterSection;
    const matchesBatch = filterBatch === '' || student.admissionYear === filterBatch;
    
    return matchesSearch && matchesDepartment && matchesCourse && matchesSemester && matchesSection && matchesBatch;
  });

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
      {/* Results count */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission Details
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
              {filteredStudents.map((student) => (
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
                        <div className="text-sm text-gray-500">
                          {student.email || 'No Email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{student.admissionNo || 'N/A'}</div>
                      <div className="text-gray-500">{student.universityRollNo || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaGraduationCap className="mr-1 text-green-600" />
                        {student.department || 'N/A'}
                      </div>
                      <div className="text-gray-500">
                        {student.semester || 'N/A'} - {student.section || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(student)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit student"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(student)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete student"
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
      
      {filteredStudents.length === 0 && students.length > 0 && (
        <div className="text-center py-12">
          <FaUser className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default StudentList;
