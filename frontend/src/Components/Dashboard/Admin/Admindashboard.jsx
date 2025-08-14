import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaStar, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaChartBar,
  FaTimes,
  FaUserGraduate,
  FaSync,
  FaUser,
  FaCog,
  FaBars
} from 'react-icons/fa';
import logo from '../../../Assets/logo.png';
import AdminDrawer from './AdminDrawer';
import FacultyList from './FacultyList';
import StudentListAdvanced from './StudentListAdvanced';
import DashboardStats from './DashboardStats';
import AdminProfile from './AdminProfile';
import AdminSettings from './AdminSettings';
import FacultyManagement from './FacultyManagement';
import FacultyApprovalNotifications from './FacultyApprovalNotifications';
import AddFacultyModal from './AddFacultyModal';
import EditFacultyModal from './EditFacultyModal';
import AddReviewModal from './AddReviewModal';
import { EnhancedFacultyEvaluationSystem } from './EditReviewModal';
import AdminFacultyAnalysis from './AdminFacultyAnalysis';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import ConfirmationModal from './ConfirmationModal';
import API_BASE_URL from '../../../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStudentDepartment, setFilterStudentDepartment] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [showEditFaculty, setShowEditFaculty] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Handle drawer menu selection
  const handleMenuSelect = (tabKey) => {
    console.log('Menu selected:', tabKey);
    
    // Direct tab setting since AdminDrawer now maps to correct tab keys
    setActiveTab(tabKey);
    
    // Close drawer automatically after selection
    setIsDrawerOpen(false);
  };

  // Fetch data on component mount
  // Generate unique values for filter options from student data
  const studentDepartments = [...new Set(students.map(student => student.department).filter(Boolean))].sort();
  const studentCourses = [...new Set(students.map(student => student.course).filter(Boolean))].sort();
  const studentSemesters = [...new Set(students.map(student => student.semester).filter(Boolean))].sort((a, b) => a - b);
  const studentSections = [...new Set(students.map(student => student.section).filter(Boolean))].sort();
  const studentBatches = [...new Set(students.map(student => student.admissionYear).filter(Boolean))].sort((a, b) => b - a);

  // Enhanced review filter extraction based on review form fields
  const reviewDepartments = [...new Set(reviews.map(review => {
    // Priority order: individual fields first, then branchSemester parsing, then fallback
    if (review.branch) {
      return review.branch; // From form's branch field
    }
    if (review.branchSemester) {
      const parts = review.branchSemester.split(' - ');
      return parts[0]; // "Computer Science Engineering - 6 Semester - Section A" → "Computer Science Engineering"
    }
    // Fallback to other possible field names
    return review.studentDepartment || review.department || review.teacherDepartment;
  }).filter(Boolean))].sort();

  // Debug: Enhanced review filter data logging
  console.log('Enhanced Review Filter Data:', {
    reviewDepartments,
    totalReviews: reviews.length,
    sampleReviewFields: reviews[0] ? {
      branch: reviews[0].branch,
      semester: reviews[0].semester, 
      section: reviews[0].section,
      branchSemester: reviews[0].branchSemester,
      teacherName: reviews[0].teacherName,
      teacherSubject: reviews[0].teacherSubject,
      teacherDepartment: reviews[0].teacherDepartment,
      studentName: reviews[0].studentName,
      admissionNo: reviews[0].admissionNo
    } : null
  });

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from:', API_BASE_URL);
      
      // Try to fetch faculty and reviews separately to identify which is failing
      let facultyData = [];
      let reviewsData = [];
      let studentsData = [];

      // Fetch faculty with detailed error handling
      try {
        console.log('Fetching faculty...');
        const facultyResponse = await fetch(`${API_BASE_URL}/api/faculty`);
        console.log('Faculty response status:', facultyResponse.status);
        
        if (facultyResponse.ok) {
          facultyData = await facultyResponse.json();
          console.log('Faculty data loaded:', facultyData.length, 'records');
        } else {
          const errorText = await facultyResponse.text();
          console.error('Faculty API error:', facultyResponse.status, errorText);
          showNotification(`Faculty API error: ${facultyResponse.status}`, 'error');
        }
      } catch (facultyError) {
        console.error('Faculty fetch error:', facultyError);
        showNotification('Faculty API not available', 'error');
      }

      // Fetch reviews with detailed error handling
      try {
        console.log('Fetching reviews...');
        const reviewsResponse = await fetch(`${API_BASE_URL}/api/review`);
        console.log('Reviews response status:', reviewsResponse.status);
        
        if (reviewsResponse.ok) {
          reviewsData = await reviewsResponse.json();
          console.log('Reviews data loaded:', reviewsData.length, 'records');
        } else {
          const errorText = await reviewsResponse.text();
          console.error('Reviews API error:', reviewsResponse.status, errorText);
          showNotification(`Reviews API error: ${reviewsResponse.status}`, 'error');
        }
      } catch (reviewsError) {
        console.error('Reviews fetch error:', reviewsError);
        showNotification('Reviews API not available', 'error');
      }

      // Fetch students with detailed error handling
      try {
        console.log('Fetching students from student API...');
        const studentsResponse = await fetch(`${API_BASE_URL}/api/student`);
        console.log('Students response status:', studentsResponse.status);
        
        if (studentsResponse.ok) {
          studentsData = await studentsResponse.json();
          console.log('Students data loaded:', studentsData.length, 'records');
        } else {
          console.warn('Students API not available, using empty array');
        }
      } catch (studentError) {
        console.warn('Students API error:', studentError.message);
      }

      // Set the data even if some APIs failed
      setFaculty(facultyData);
      setReviews(reviewsData);
      setStudents(studentsData);
      
      // Only show error if all APIs failed
      if (facultyData.length === 0 && reviewsData.length === 0 && studentsData.length === 0) {
        setError('All APIs are currently unavailable. Please try again later.');
      } else {
        setError(null);
      }

    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new faculty
  const handleAddFaculty = async (facultyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add faculty');
      }

      const newFaculty = await response.json();
      setFaculty([...faculty, newFaculty.faculty]);
      setShowAddFaculty(false);
      showNotification('Faculty added successfully!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Update faculty
  const handleUpdateFaculty = async (id, facultyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update faculty');
      }

      const updatedFaculty = await response.json();
      setFaculty(faculty.map(f => f._id === id ? updatedFaculty.faculty : f));
      setShowEditFaculty(false);
      setSelectedItem(null);
      showNotification('Faculty updated successfully!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Delete faculty
  const handleDeleteFaculty = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete faculty');
      }

      setFaculty(faculty.filter(f => f._id !== id));
      setShowDeleteModal(false);
      setSelectedItem(null);
      setDeleteType('');
      showNotification('Faculty deleted successfully!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Add new review
  const handleAddReview = async (reviewData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add review');
      }

      const newReview = await response.json();
      setReviews([...reviews, newReview]);
      setShowAddReview(false);
      showNotification('Review added successfully!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Update review
  const handleUpdateReview = async (id, reviewData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/review/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review');
      }

      const updatedReview = await response.json();
      setReviews(reviews.map(r => r._id === id ? updatedReview.review : r));
      setSelectedItem(null);
      showNotification('Review updated successfully!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Delete review
  const handleDeleteReview = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/review/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }

      setReviews(reviews.filter(r => r._id !== id));
      setShowDeleteModal(false);
      setSelectedItem(null);
      setDeleteType('');
      showNotification('Review deleted successfully!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Add new student
  // Dedicated function to fetch students
  const fetchStudents = async () => {
    try {
      console.log('Fetching students from student API...');
      const response = await fetch(`${API_BASE_URL}/api/student`);
      console.log('Students response status:', response.status);
      
      if (response.ok) {
        const studentsData = await response.json();
        setStudents(studentsData);
        console.log('Students data loaded:', studentsData.length, 'records');
      } else {
        console.warn('Students API not available, status:', response.status);
        setStudents([]);
      }
    } catch (error) {
      console.warn('Students API error:', error.message);
      setStudents([]);
    }
  };

  const handleAddStudent = async (studentData) => {
    try {
      // Prepare data for admin API - using signup route for consistency
      const apiData = {
        role: 'Student',
        email: studentData.email,
        name: studentData.username,
        password: studentData.password,
        admissionNo: studentData.admissionNo,
        universityRollNo: studentData.universityRollNo,
        semester: studentData.semester,
        section: studentData.section,
        department: studentData.department,
        course: studentData.course,
        batch: studentData.batch
      };

      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add student');
      }

      await response.json();
      setShowAddStudent(false);
      showNotification('Student added successfully!', 'success');
      // Refresh students list to get updated data
      fetchStudents();
    } catch (err) {
      console.error('Add student error:', err);
      showNotification(err.message || 'Failed to add student', 'error');
    }
  };

  // Update student
  const handleUpdateStudent = async (id, studentData) => {
    try {
      // Prepare simplified data for student API
      const apiData = {
        username: studentData.username,
        email: studentData.email,
        admissionNo: studentData.admissionNo,
        universityRollNo: studentData.universityRollNo,
        semester: studentData.semester,
        section: studentData.section,
        department: studentData.department,
        course: studentData.course,
        batch: studentData.batch
      };

      // Only include password if it's provided (for updates)
      if (studentData.password && studentData.password.trim()) {
        apiData.password = studentData.password;
      }

      const response = await fetch(`${API_BASE_URL}/api/student/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update student';
        
        // Try to parse JSON error, but handle HTML responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            console.warn('Could not parse error response as JSON');
          }
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.message && result.student) {
        setStudents(students.map(s => s._id === id ? result.student : s));
        setShowEditStudent(false);
        setSelectedItem(null);
        showNotification('Student updated successfully!', 'success');
        // Refresh students list to get updated data
        fetchStudents();
      } else {
        throw new Error('Failed to update student');
      }
    } catch (err) {
      console.error('Update student error:', err);
      showNotification(err.message || 'Failed to update student', 'error');
    }
  };

  // Delete student
  const handleDeleteStudent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete student';
        
        // Try to parse JSON error, but handle HTML responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            console.warn('Could not parse error response as JSON');
          }
        } else {
          // Handle HTML responses (404 pages, etc.)
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.message) {
        setStudents(students.filter(s => s._id !== id));
        setShowDeleteModal(false);
        setSelectedItem(null);
        setDeleteType('');
        showNotification('Student deleted successfully!', 'success');
      } else {
        throw new Error('Failed to delete student');
      }
    } catch (err) {
      console.error('Delete student error:', err);
      showNotification(err.message || 'Failed to delete student', 'error');
    }
  };

  // Show confirmation modal
  const showDeleteConfirmation = (item, type) => {
    setSelectedItem(item);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteType === 'faculty') {
      handleDeleteFaculty(selectedItem._id);
    } else if (deleteType === 'review') {
      handleDeleteReview(selectedItem._id);
    } else if (deleteType === 'student') {
      handleDeleteStudent(selectedItem._id);
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Rating validation utility
  const validateRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/review/validate-ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        showNotification(result.message, 'success');
        
        // Refresh data after validation
        fetchData();
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Validation failed', 'error');
      }
    } catch (error) {
      console.error('Validation error:', error);
      showNotification('Failed to validate ratings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch faculty with ratings (future use)
  /*
  const fetchFacultyWithRatings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty/with-ratings`);
      if (response.ok) {
        const facultyWithRatings = await response.json();
        console.log('Faculty with ratings:', facultyWithRatings);
        return facultyWithRatings;
      }
    } catch (error) {
      console.error('Error fetching faculty with ratings:', error);
    }
    return [];
  };

  // Fetch faculty ratings summary (future use)
  const fetchFacultyRatingsSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/review/faculty-ratings`);
      if (response.ok) {
        const ratingsSummary = await response.json();
        console.log('Faculty ratings summary:', ratingsSummary);
        return ratingsSummary;
      }
    } catch (error) {
      console.error('Error fetching ratings summary:', error);
    }
    return [];
  };
  */

  // Filter faculty and reviews
  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterDepartment === '' || f.department === filterDepartment)
  );

  // Enhanced review filtering based on search term and department filter
  const filteredReviews = reviews.filter(review => {
    // Search term filtering - check multiple fields
    const searchMatch = searchTerm === '' || 
      (review.teacherName && review.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.studentName && review.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.teacherSubject && review.teacherSubject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.admissionNo && review.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()));

    // Department filtering - check multiple possible department fields
    let departmentMatch = filterDepartment === '';
    if (!departmentMatch && filterDepartment !== '') {
      const reviewDept = review.branch || 
                        (review.branchSemester ? review.branchSemester.split(' - ')[0] : null) ||
                        review.studentDepartment || 
                        review.department || 
                        review.teacherDepartment;
      departmentMatch = reviewDept === filterDepartment;
    }

    return searchMatch && departmentMatch;
  });

  // Enhanced student filtering for count display
  const filteredStudents = students.filter(student => {
    // Search term filtering
    const searchMatch = searchTerm === '' || 
      (student.username && student.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.admissionNo && student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()));

    // Department filtering
    const deptMatch = filterStudentDepartment === '' || student.department === filterStudentDepartment;
    const courseMatch = filterCourse === '' || student.course === filterCourse;
    const semesterMatch = filterSemester === '' || student.semester === filterSemester;
    const sectionMatch = filterSection === '' || student.section === filterSection;
    const batchMatch = filterBatch === '' || student.admissionYear === filterBatch;

    return searchMatch && deptMatch && courseMatch && semesterMatch && sectionMatch && batchMatch;
  });

  // Get unique departments
  const departments = [...new Set([...faculty.map(f => f.department), ...reviews.map(r => r.teacherDepartment)])];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="flex items-center">
          <button 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="drawer-toggle-btn mr-4"
            title="Toggle Navigation Menu"
          >
            <FaBars />
          </button>
          <img 
            src={logo} 
            alt="FEMS Logo" 
            className="h-10 w-auto mr-4"
          />
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-actions">
          {/* Faculty Approval Notifications */}
          <FacultyApprovalNotifications 
            onApprovalAction={(action, data) => {
              if (action === 'view-all') {
                setActiveTab('faculty-management');
              } else if (action === 'view-details') {
                setActiveTab('faculty-management');
              }
              // Refresh faculty data after approvals
              fetchData();
            }}
          />
          
          <button 
            onClick={() => setShowAddFaculty(true)} 
            className="btn btn-primary"
          >
            <FaPlus /> Add Faculty
          </button>
          <button 
            onClick={() => setShowAddStudent(true)} 
            className="btn btn-primary"
          >
            <FaPlus /> Add Student
          </button>
          <button 
            onClick={() => setShowAddReview(true)} 
            className="btn btn-secondary"
          >
            <FaPlus /> Add Review
          </button>
          <button 
            onClick={validateRatings} 
            className="btn btn-warning"
            disabled={loading}
            title="Validate and fix rating calculations"
          >
            <FaSync /> {loading ? 'Validating...' : 'Validate Ratings'}
          </button>
        </div>
      </div>

      {/* Admin Drawer Navigation */}
      <AdminDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onMenuSelect={handleMenuSelect}
        activeMenu={activeTab}
      />

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaChartBar /> Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'faculty' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculty')}
        >
          <FaUsers /> Faculty ({activeTab === 'faculty' ? filteredFaculty.length : faculty.length})
        </button>
        <button 
          className={`tab ${activeTab === 'faculty-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculty-management')}
        >
          <FaUsers /> Faculty Management
        </button>
        <button 
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <FaUserGraduate /> Students ({activeTab === 'students' ? filteredStudents.length : students.length})
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <FaStar /> Reviews ({activeTab === 'reviews' ? filteredReviews.length : reviews.length})
        </button>
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog /> Settings
        </button>
      </div>

      {/* Search and Filter */}
      {activeTab !== 'profile' && activeTab !== 'settings' && (
        <div className="search-filter-container">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder={
              activeTab === 'students' ? "Search students by name, email, admission no..." :
              activeTab === 'faculty' ? "Search faculty by name..." :
              activeTab === 'reviews' ? "Search reviews by teacher, student, subject..." :
              "Search by name..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Faculty & Review Filters */}
        {(activeTab === 'faculty' || activeTab === 'reviews') && (
          <div className="flex gap-3 items-center flex-wrap">
            <FaFilter className="text-gray-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            {/* Clear Filters Button for Faculty/Reviews */}
            {(filterDepartment || searchTerm) && (
              <button
                onClick={() => {
                  setFilterDepartment('');
                  setSearchTerm('');
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
        
        {/* Student Filters */}
        {activeTab === 'students' && (
          <div className="flex gap-3 items-center flex-wrap">
            <FaFilter className="text-gray-400" />
            
            <select
              value={filterStudentDepartment}
              onChange={(e) => setFilterStudentDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="">All Departments</option>
              {studentDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            >
              <option value="">All Courses</option>
              {studentCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="">All Semesters</option>
              {studentSemesters.map(sem => (
                <option key={sem} value={sem}>{sem} Semester</option>
              ))}
            </select>
            
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[130px]"
            >
              <option value="">All Sections</option>
              {studentSections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
            
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="">All Batches</option>
              {studentBatches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
            
            {/* Clear Filters Button */}
            {(filterStudentDepartment || filterCourse || filterSemester || filterSection || filterBatch || searchTerm) && (
              <button
                onClick={() => {
                  setFilterStudentDepartment('');
                  setFilterCourse('');
                  setFilterSemester('');
                  setFilterSection('');
                  setFilterBatch('');
                  setSearchTerm('');
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
      )}

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'dashboard' && (
          <DashboardStats 
            faculty={faculty} 
            reviews={reviews}
            students={students}
          />
        )}
        
        {activeTab === 'faculty' && (
          <FacultyList
            faculty={filteredFaculty}
            reviews={reviews}
            onEdit={(faculty) => {
              setSelectedItem(faculty);
              setShowEditFaculty(true);
            }}
            onDelete={(faculty) => showDeleteConfirmation(faculty, 'faculty')}
          />
        )}
        
        {activeTab === 'students' && (
          <StudentListAdvanced
            students={students}
            searchTerm={searchTerm}
            filterStudentDepartment={filterStudentDepartment}
            filterCourse={filterCourse}
            filterSemester={filterSemester}
            filterSection={filterSection}
            filterBatch={filterBatch}
            onEdit={(student) => {
              setSelectedItem(student);
              setShowEditStudent(true);
            }}
            onDelete={(student) => showDeleteConfirmation(student, 'student')}
          />
        )}
        
        {activeTab === 'reviews' && (
          <EnhancedFacultyEvaluationSystem
            reviews={filteredReviews}
            faculty={faculty}
            searchTerm={searchTerm}
            filterDepartment={filterDepartment}
            onUpdate={handleUpdateReview}
            onDelete={(reviewId) => showDeleteConfirmation(reviews.find(r => r._id === reviewId), 'review')}
            onRefresh={fetchData}
            loading={loading}
          />
        )}

        {activeTab === 'faculty-analysis' && (
          <AdminFacultyAnalysis />
        )}

        {activeTab === 'profile' && (
          <AdminProfile />
        )}

        {activeTab === 'faculty-management' && (
          <FacultyManagement />
        )}

        {activeTab === 'settings' && (
          <AdminSettings />
        )}
      </div>

      {/* Modals */}
      {showAddFaculty && (
        <AddFacultyModal
          onClose={() => setShowAddFaculty(false)}
          onAdd={handleAddFaculty}
        />
      )}

      {showEditFaculty && selectedItem && (
        <EditFacultyModal
          faculty={selectedItem}
          onClose={() => {
            setShowEditFaculty(false);
            setSelectedItem(null);
          }}
          onUpdate={handleUpdateFaculty}
        />
      )}

      {showAddReview && (
        <AddReviewModal
          faculty={faculty}
          onClose={() => setShowAddReview(false)}
          onAdd={handleAddReview}
        />
      )}

      {showAddStudent && (
        <AddStudentModal
          onClose={() => setShowAddStudent(false)}
          onAdd={handleAddStudent}
        />
      )}

      {showEditStudent && selectedItem && (
        <EditStudentModal
          student={selectedItem}
          onClose={() => {
            setShowEditStudent(false);
            setSelectedItem(null);
          }}
          onUpdate={handleUpdateStudent}
        />
      )}

      {showDeleteModal && selectedItem && (
        <ConfirmationModal
          title={`Delete ${deleteType}`}
          message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
            setDeleteType('');
          }}
        />
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: '', type: '' })}>
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
