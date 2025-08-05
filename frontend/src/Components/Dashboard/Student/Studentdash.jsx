import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaHome, 
  FaCalendar, 
  FaCog, 
  FaBars, 
  FaTimes, 
  FaSignOutAlt, 
  FaUser, 
  FaGraduationCap, 
  FaStar, 
  FaEdit, 
  FaEye,
  FaPlus,
  FaSearch,
  FaTrash,
  FaSync
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { CalendarContent } from '../../Calendar';
import logo from '../../../Assets/logo.png';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';

const Studentdash = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Handle URL hash for tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      if (hash === 'my-reviews') {
        setActiveTab('my-reviews');
      } else if (hash === 'profile') {
        setActiveTab('profile');
      } else if (hash === 'dashboard' || !hash) {
        setActiveTab('dashboard');
      }
    };

    // Check hash on mount
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Function to fetch complete student profile
  const fetchStudentProfile = useCallback(async (studentId) => {
    try {
      setProfileLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/student-profile/${studentId}`);
      if (response.data.success) {
        const completeStudentData = response.data.student;
        setStudentInfo(completeStudentData);
        setEditFormData(completeStudentData);
        // Update localStorage with complete data
        localStorage.setItem('studentInfo', JSON.stringify(completeStudentData));
        console.log('Complete student profile loaded:', completeStudentData);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Function to update student profile
  const updateStudentProfile = async (updateData) => {
    try {
      // Client-side validation
      const validationErrors = [];
      
      if (updateData.email && !/\S+@\S+\.\S+/.test(updateData.email)) {
        validationErrors.push('Please enter a valid email address');
      }
      
      if (updateData.admissionNo && !/^[A-Z0-9]{8,15}$/.test(updateData.admissionNo)) {
        validationErrors.push('Admission number must be 8-15 alphanumeric characters');
      }
      
      if (updateData.universityRollNo && !/^\d{6,25}$/.test(updateData.universityRollNo)) {
        validationErrors.push('University roll number must be 6-25 digits only');
      }
      
      if (updateData.phoneNumber && updateData.phoneNumber && !/^[+]?[\d\s-()]{10,15}$/.test(updateData.phoneNumber)) {
        validationErrors.push('Please enter a valid phone number');
      }
      
      if (validationErrors.length > 0) {
        alert('Validation Errors:\n' + validationErrors.join('\n'));
        return false;
      }
      
      setProfileLoading(true);
      const response = await axios.put(`${API_BASE_URL}/api/student-profile/${studentInfo._id}`, updateData);
      if (response.data.success) {
        const updatedStudent = response.data.student;
        setStudentInfo(updatedStudent);
        setEditFormData(updatedStudent);
        localStorage.setItem('studentInfo', JSON.stringify(updatedStudent));
        setIsEditingProfile(false);
        
        // Show appropriate success message
        let message = response.data.message || 'Profile updated successfully!';
        if (response.data.profileCompleted) {
          message += '\n\n🎉 Your profile is now complete! You can access all features.';
        }
        
        alert(message);
        return true;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Failed to update profile. Please try again.';
      alert(`Error: ${errorMessage}`);
      return false;
    } finally {
      setProfileLoading(false);
    }
  };

  // Function to change tab and update URL hash
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'dashboard') {
      window.history.replaceState(null, null, '/studentdash');
    } else {
      window.history.replaceState(null, null, `/studentdash#${tabName}`);
    }
  };

  // Function to refresh reviews
  const refreshReviews = useCallback(async () => {
    if (studentInfo && studentInfo.admissionNo) {
      setLoading(true);
      try {
        console.log('Refreshing reviews for admission number:', studentInfo.admissionNo);
        const response = await axios.get(`${API_BASE_URL}/api/review`);
        console.log('All reviews from API during refresh:', response.data);
        
        // Filter reviews by the current student's admission number
        const studentReviews = response.data.filter(review => review.admissionNo === studentInfo.admissionNo);
        console.log('Filtered student reviews during refresh:', studentReviews);
        
        if (studentReviews.length > 0) {
          setReviews(studentReviews);
          console.log('Refresh: Using real reviews:', studentReviews);
        } else {
          console.log('Refresh: No reviews found for this student');
          // Don't show mock data during refresh, show empty state
          setReviews([]);
        }
      } catch (error) {
        console.error('Error refreshing reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
  }, [studentInfo]);

  useEffect(() => {
    // Get student info from localStorage
    const storedStudentInfo = localStorage.getItem('studentInfo');
    if (storedStudentInfo) {
      const student = JSON.parse(storedStudentInfo);
      setStudentInfo(student);
      setEditFormData(student);
      
      // Check if this is a legacy account that needs profile completion
      if (student.isLegacyAccount && student.needsProfileCompletion) {
        // Show welcome message for legacy accounts
        setTimeout(() => {
          alert('Welcome back! We\'ve updated our system. Please review and complete your profile with your academic information to continue using all features.');
        }, 1000);
      }
      
      // Fetch complete profile if we only have basic info
      if (student._id && (!student.admissionNo || !student.semester || student.needsProfileCompletion)) {
        fetchStudentProfile(student._id);
      }
    }
  }, [fetchStudentProfile]);

  // Add event listener for when user comes back to this page
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused, refreshing reviews...');
      refreshReviews();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, refreshing reviews...');
        refreshReviews();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [studentInfo, refreshReviews]);

  useEffect(() => {
    const fetchStudentReviews = async (admissionNo) => {
      try {
        setLoading(true);
        console.log('Fetching reviews for admission number:', admissionNo);
        const response = await axios.get(`${API_BASE_URL}/api/review`);
        console.log('All reviews from API:', response.data);
        
        // Filter reviews by the current student's admission number
        const studentReviews = response.data.filter(review => review.admissionNo === admissionNo);
        console.log('Filtered student reviews:', studentReviews);
        
        if (studentReviews.length > 0) {
          // Use real reviews from API
          setReviews(studentReviews);
          console.log('Using real reviews:', studentReviews);
        } else {
          // If no real reviews found, show mock data for demonstration
          console.log('No reviews found for this student, showing mock data');
          const mockReviews = [
            {
              _id: 'mock_1',
              studentName: studentInfo?.name || 'John Doe',
              admissionNo: admissionNo,
              branchSemester: studentInfo?.branchSemester || 'CS 3rd Sem',
              teacherName: "Dr. Sarah Johnson",
              teacherDepartment: "Computer Science",
              teacherSubject: "Data Structures",
              ratings: {
                conceptExplanation: 4,
                subjectKnowledge: 5,
                contentOrganization: 4,
                classTiming: 3,
                learningEnvironment: 4,
                studentParticipation: 4,
                feedbackQuality: 3,
                resourceUtilization: 4,
                innovation: 3,
                accessibility: 4,
                supportiveness: 5,
                professionalism: 5
              },
              overallEvaluation: 4.5,
              suggestions: "Great teaching methods and clear explanations.",
              createdAt: new Date('2024-01-15')
            },
            {
              _id: 'mock_2',
              studentName: studentInfo?.name || 'John Doe',
              admissionNo: admissionNo,
              branchSemester: studentInfo?.branchSemester || 'CS 3rd Sem',
              teacherName: "Prof. Michael Chen",
              teacherDepartment: "Mathematics",
              teacherSubject: "Calculus",
              ratings: {
                conceptExplanation: 4,
                subjectKnowledge: 4,
                contentOrganization: 4,
                classTiming: 4,
                learningEnvironment: 4,
                studentParticipation: 3,
                feedbackQuality: 4,
                resourceUtilization: 4,
                innovation: 4,
                accessibility: 4,
                supportiveness: 4,
                professionalism: 4
              },
              overallEvaluation: 4.2,
              suggestions: "More practice problems would be helpful.",
              createdAt: new Date('2024-01-10')
            }
          ];
          setReviews(mockReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Fallback to mock data if API fails
        const mockReviews = [
          {
            _id: 'error_mock_1',
            studentName: studentInfo?.name || 'John Doe',
            admissionNo: admissionNo,
            branchSemester: studentInfo?.branchSemester || 'CS 3rd Sem',
            teacherName: "Dr. Sarah Johnson (Demo)",
            teacherDepartment: "Computer Science",
            teacherSubject: "Data Structures",
            ratings: {
              conceptExplanation: 4,
              subjectKnowledge: 5,
              contentOrganization: 4,
              classTiming: 3,
              learningEnvironment: 4,
              studentParticipation: 4,
              feedbackQuality: 3,
              resourceUtilization: 4,
              innovation: 3,
              accessibility: 4,
              supportiveness: 5,
              professionalism: 5
            },
            overallEvaluation: 4.5,
            suggestions: "API Error - This is demo data. Please check your backend connection.",
            createdAt: new Date('2024-01-15')
          }
        ];
        setReviews(mockReviews);
      } finally {
        setLoading(false);
      }
    };

    if (studentInfo && studentInfo.admissionNo) {
      fetchStudentReviews(studentInfo.admissionNo);
    } else {
      // If no student info, still show message
      setReviews([]);
      setLoading(false);
    }
  }, [studentInfo]);

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        // Try to delete from API first
        await axios.delete(`${API_BASE_URL}/api/review/${reviewId}`);
        // Remove the deleted review from state
        setReviews(reviews.filter(review => review._id !== reviewId));
        alert('Review deleted successfully!');
      } catch (error) {
        console.error('Error deleting review:', error);
        // For mock data, just remove from local state
        setReviews(reviews.filter(review => review._id !== reviewId));
        alert('Review deleted successfully! (Mock data)');
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleViewDetails = (review) => {
    alert(`Review Details:\nTeacher: ${review.teacherName}\nSubject: ${review.teacherSubject}\nDepartment: ${review.teacherDepartment}\nRating: ${review.overallEvaluation}/5\nSuggestions: ${review.suggestions || 'No suggestions provided'}\nSubmitted: ${new Date(review.createdAt).toLocaleDateString()}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    window.location.href = '/';
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-blue-600';
    if (rating >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceText = (rating) => {
    if (rating >= 4) return 'Excellent';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Average';
    return 'Needs Improvement';
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out bg-white shadow-xl w-64 z-50`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-purple-600">Student Portal</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* Student Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{studentInfo?.name || 'Student'}</h3>
              <p className="text-sm text-gray-600">{studentInfo?.admissionNo || 'Admission No'}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex flex-col p-4 space-y-2">
          <button
            onClick={() => {
              handleTabChange('dashboard');
              setSidebarOpen(false); // Auto close drawer
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaHome />
            <span>Dashboard</span>
          </button>
          
          <Link
            to="/reviewform"
            onClick={() => setSidebarOpen(false)} // Auto close drawer
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaEdit />
            <span>Submit Review</span>
          </Link>
          
          <button
            onClick={() => {
              handleTabChange('my-reviews');
              setSidebarOpen(false); // Auto close drawer
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'my-reviews'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaStar />
            <span>My Reviews</span>
          </button>
          
          <Link
            to="/calendar"
            onClick={() => setSidebarOpen(false)} // Auto close drawer
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaCalendar />
            <span>Calendar</span>
          </Link>
          
          <button
            onClick={() => {
              handleTabChange('profile');
              setSidebarOpen(false); // Auto close drawer
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaCog />
            <span>Profile</span>
          </button>
          
          <button 
            onClick={() => {
              handleLogout();
              setSidebarOpen(false); // Auto close drawer
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-auto"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar - Fixed */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-600 hover:text-gray-800 transition-colors"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
              >
                <FaBars />
              </button>
              <div className="flex items-center">
                <img 
                  src={logo} 
                  alt="FEMS Logo" 
                  className="h-10 w-auto"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <Link 
                to='/userprofile'
                onClick={() => setSidebarOpen(false)} // Auto close drawer
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <>
              {/* Enhanced Hero Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl mb-8">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>
                
                <div className="relative p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row items-center justify-between">
                    {/* Left Content */}
                    <div className="lg:w-2/3 mb-8 lg:mb-0">
                      {/* Greeting */}
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                          <span className="text-2xl">👋</span>
                        </div>
                        <div>
                          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                            Welcome back,
                          </h1>
                          <h2 className="text-3xl lg:text-4xl font-bold text-yellow-300">
                            {studentInfo?.name || studentInfo?.username || 'Student'}!
                          </h2>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-purple-100 text-lg lg:text-xl mb-8 leading-relaxed max-w-2xl">
                        Shape the future of education by sharing your valuable feedback. Track your academic journey and contribute to improving teaching quality.
                      </p>
                      
                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap gap-4 mb-8">
                        <button
                          onClick={() => handleTabChange('my-reviews')}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 flex items-center space-x-2 border border-white border-opacity-20"
                        >
                          <FaStar className="text-yellow-300" />
                          <span>My Reviews</span>
                        </button>
                        <button
                          onClick={() => window.location.href = '/reviewform'}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <FaEdit />
                          <span>Submit Review</span>
                        </button>
                      </div>
                      
                      {/* Student Info Cards */}
                      {studentInfo && (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {studentInfo.admissionNo && (
                            <div className="bg-white bg-opacity-15 backdrop-blur-sm px-4 py-3 rounded-lg border border-white border-opacity-20">
                              <p className="text-purple-200 text-sm font-medium">Admission No</p>
                              <p className="text-white font-semibold">{studentInfo.admissionNo}</p>
                            </div>
                          )}
                          {studentInfo.universityRollNo && (
                            <div className="bg-white bg-opacity-15 backdrop-blur-sm px-4 py-3 rounded-lg border border-white border-opacity-20">
                              <p className="text-purple-200 text-sm font-medium">Roll Number</p>
                              <p className="text-white font-semibold">{studentInfo.universityRollNo}</p>
                            </div>
                          )}
                          {studentInfo.semester && (
                            <div className="bg-white bg-opacity-15 backdrop-blur-sm px-4 py-3 rounded-lg border border-white border-opacity-20">
                              <p className="text-purple-200 text-sm font-medium">Semester</p>
                              <p className="text-white font-semibold">{studentInfo.semester}</p>
                            </div>
                          )}
                          {studentInfo.section && (
                            <div className="bg-white bg-opacity-15 backdrop-blur-sm px-4 py-3 rounded-lg border border-white border-opacity-20">
                              <p className="text-purple-200 text-sm font-medium">Section</p>
                              <p className="text-white font-semibold">{studentInfo.section}</p>
                            </div>
                          )}
                          {studentInfo.department && (
                            <div className="bg-white bg-opacity-15 backdrop-blur-sm px-4 py-3 rounded-lg border border-white border-opacity-20">
                              <p className="text-purple-200 text-sm font-medium">Department</p>
                              <p className="text-white font-semibold">{studentInfo.department}</p>
                            </div>
                          )}
                          {studentInfo.course && (
                            <div className="bg-white bg-opacity-15 backdrop-blur-sm px-4 py-3 rounded-lg border border-white border-opacity-20">
                              <p className="text-purple-200 text-sm font-medium">Course</p>
                              <p className="text-white font-semibold">{studentInfo.course}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Right Content - Illustration */}
                    <div className="lg:w-1/3 flex justify-center">
                      <div className="relative">
                        {/* Main Circle */}
                        <div className="w-64 h-64 bg-gradient-to-br from-white to-purple-100 rounded-full flex items-center justify-center shadow-2xl">
                          <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <FaGraduationCap className="text-6xl text-white" />
                          </div>
                        </div>
                        
                        {/* Floating Elements */}
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                          <FaStar className="text-2xl text-white" />
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                          <FaEdit className="text-xl text-white" />
                        </div>
                        <div className="absolute top-1/2 -left-8 w-8 h-8 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-ping"></div>
                        <div className="absolute top-8 right-8 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FaStar className="text-2xl text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Reviews Submitted</p>
                      <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FaUser className="text-2xl text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Profile Completion</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {studentInfo?.profileCompleteness || 
                         (studentInfo ? Math.round(Object.values(studentInfo).filter(v => v && v !== '').length / 12 * 100) : 0)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FaGraduationCap className="text-2xl text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Current Semester</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {studentInfo?.semester ? `${studentInfo.semester}` : 'Not Set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link 
                      to="/reviewform"
                      onClick={() => setSidebarOpen(false)} // Auto close drawer
                      className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <FaPlus className="text-purple-600 mr-3" />
                      <span className="text-gray-700">Submit New Review</span>
                    </Link>
                    <Link 
                      to="/calendar"
                      onClick={() => setSidebarOpen(false)} // Auto close drawer
                      className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <FaCalendar className="text-green-600 mr-3" />
                      <span className="text-gray-700">Academic Calendar</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleTabChange('my-reviews');
                        setSidebarOpen(false); // Auto close drawer
                      }}
                      className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors w-full text-left"
                    >
                      <FaStar className="text-blue-600 mr-3" />
                      <span className="text-gray-700">View My Reviews</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <FaStar className="text-purple-600 text-sm" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Reviewed {review.teacherName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.overallEvaluation)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Calendar</h3>
                <CalendarContent />
              </div>
            </>
          )}

          {activeTab === 'my-reviews' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Reviews</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={refreshReviews}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    disabled={loading}
                  >
                    <FaSync className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                  <Link 
                    to="/reviewform"
                    onClick={() => setSidebarOpen(false)} // Auto close drawer
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                  >
                    <FaPlus />
                    <span>New Review</span>
                  </Link>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const performanceColor = getPerformanceColor(review.overallEvaluation);
                    const performanceText = getPerformanceText(review.overallEvaluation);
                    
                    return (
                      <div key={review._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{review.teacherName}</h3>
                            <p className="text-sm text-gray-600">{review.teacherDepartment} • {review.teacherSubject}</p>
                            <p className="text-sm text-gray-600">Submitted on {new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-yellow-500 mb-2">
                              {renderStars(review.overallEvaluation)}
                              <span className="ml-2 font-semibold">{review.overallEvaluation}</span>
                            </div>
                            <span className={`text-sm font-medium ${performanceColor}`}>
                              {performanceText}
                            </span>
                          </div>
                        </div>
                        {review.suggestions && (
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Suggestions:</span> {review.suggestions}
                            </p>
                          </div>
                        )}
                        <div className="mt-4 flex space-x-2">
                          <button 
                            onClick={() => handleEditReview(review)}
                            className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <FaEdit />
                            <span>Edit Review</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteReview(review._id)}
                            className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <FaTrash />
                            <span>Delete Review</span>
                          </button>
                          <button 
                            onClick={() => handleViewDetails(review)}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <FaEye />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No reviews yet</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Start contributing to faculty improvement by submitting your first review.
                  </p>
                  <Link 
                    to="/reviewform"
                    onClick={() => setSidebarOpen(false)} // Auto close drawer
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors inline-flex items-center space-x-2"
                  >
                    <FaPlus />
                    <span>Submit Your First Review</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mr-6">
                      <FaUser className="text-4xl text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{studentInfo?.username || 'Student'}</h2>
                      <p className="text-purple-200 capitalize">{studentInfo?.role || 'Student'}</p>
                      {studentInfo?.department && (
                        <p className="text-purple-200">{studentInfo.department}</p>
                      )}
                      {studentInfo?.profileCompleteness !== undefined && (
                        <p className="text-purple-200 text-sm">
                          Profile Completeness: {studentInfo.profileCompleteness}%
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    disabled={profileLoading}
                  >
                    <FaEdit />
                    <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-8">
                {profileLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  </div>
                )}

                {!profileLoading && (
                  <>
                    {/* Legacy Account Notice */}
                    {studentInfo?.isLegacyAccount && studentInfo?.needsProfileCompletion && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-medium text-blue-800">
                              🎉 Welcome Back to the Enhanced System!
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p className="mb-2">
                                We've upgraded our system with new features! To continue enjoying all functionalities, 
                                please complete your academic profile below.
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Update your admission number and university roll number</li>
                                <li>Confirm your current semester and section</li>
                                <li>Add any missing personal information</li>
                                <li>Complete your department and course details</li>
                              </ul>
                              <p className="mt-2 font-medium">
                                Don't worry - your existing reviews and data are safe! 
                                Just click "Edit Profile" below to get started.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Important Notice for Editing */}
                    {isEditingProfile && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Important Notice
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <ul className="list-disc list-inside space-y-1">
                                <li>Email, Admission Number, and Roll Number must be unique</li>
                                <li>Changing email may require verification</li>
                                <li>Double-check all academic information before saving</li>
                                <li>Changes are saved immediately and cannot be undone</li>
                                {studentInfo?.isLegacyAccount && (
                                  <li className="font-medium text-blue-700">
                                    🔄 Legacy Account: You can replace temporary data with your real academic information
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Academic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                          📚 Academic Information
                          {isEditingProfile && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Editable</span>}
                        </h3>
                      
                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          value={isEditingProfile ? (editFormData.username || '') : (studentInfo?.username || '')}
                          onChange={(e) => isEditingProfile && setEditFormData({...editFormData, username: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={`w-full p-3 rounded-lg border ${isEditingProfile ? 'border-gray-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'}`}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={isEditingProfile ? (editFormData.email || '') : (studentInfo?.email || '')}
                          onChange={(e) => isEditingProfile && setEditFormData({...editFormData, email: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={`w-full p-3 rounded-lg border ${isEditingProfile ? 'border-gray-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'}`}
                          placeholder="Enter your email address"
                        />
                        {isEditingProfile && (
                          <p className="text-xs text-yellow-600 mt-1">⚠️ Changing email will require re-verification</p>
                        )}
                      </div>

                      {/* Admission Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Admission Number
                          {studentInfo?.isLegacyAccount && (studentInfo?.admissionNo?.startsWith('TEMP') || studentInfo?.admissionNo?.startsWith('T')) && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              Temporary - Please Update
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={isEditingProfile ? (editFormData.admissionNo || '') : (studentInfo?.admissionNo || '')}
                          onChange={(e) => isEditingProfile && setEditFormData({...editFormData, admissionNo: e.target.value.toUpperCase()})}
                          readOnly={!isEditingProfile}
                          className={`w-full p-3 rounded-lg border ${isEditingProfile ? 'border-gray-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'} ${(studentInfo?.admissionNo?.startsWith('TEMP') || studentInfo?.admissionNo?.startsWith('T')) ? 'bg-orange-50 border-orange-200' : ''}`}
                          placeholder="Enter your admission number"
                          maxLength="15"
                        />
                        {isEditingProfile && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ {(studentInfo?.admissionNo?.startsWith('TEMP') || studentInfo?.admissionNo?.startsWith('T')) ? 
                              'Please replace temporary admission number with your real one' : 
                              'Ensure admission number is correct - it must be unique'}
                          </p>
                        )}
                      </div>

                      {/* University Roll Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          University Roll Number
                          {studentInfo?.isLegacyAccount && /^\d{13,}$/.test(studentInfo?.universityRollNo) && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              Temporary - Please Update
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={isEditingProfile ? (editFormData.universityRollNo || '') : (studentInfo?.universityRollNo || '')}
                          onChange={(e) => isEditingProfile && setEditFormData({...editFormData, universityRollNo: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={`w-full p-3 rounded-lg border ${isEditingProfile ? 'border-gray-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'} ${/^\d{13,}$/.test(studentInfo?.universityRollNo) ? 'bg-orange-50 border-orange-200' : ''}`}
                          placeholder="Enter your university roll number (digits only)"
                          maxLength="25"
                          pattern="\d*"
                        />
                        {isEditingProfile && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ {/^\d{13,}$/.test(studentInfo?.universityRollNo) ? 
                              'Please replace temporary roll number with your real one' : 
                              'Enter digits only (6-25 characters) - must be unique'}
                          </p>
                        )}
                      </div>

                      {/* Semester */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                        {isEditingProfile ? (
                          <select
                            value={editFormData.semester || ''}
                            onChange={(e) => setEditFormData({...editFormData, semester: e.target.value})}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Semester</option>
                            {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(sem => (
                              <option key={sem} value={sem}>{sem} Semester</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={studentInfo?.semester ? `${studentInfo.semester} Semester` : ''}
                            readOnly
                            className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50"
                          />
                        )}
                      </div>

                      {/* Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        {isEditingProfile ? (
                          <select
                            value={editFormData.section || ''}
                            onChange={(e) => setEditFormData({...editFormData, section: e.target.value})}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Section</option>
                            {['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Super60', 'Uniques'].map(sec => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={studentInfo?.section || ''}
                            readOnly
                            className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50"
                          />
                        )}
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        👤 Personal Information
                        {isEditingProfile && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Editable</span>}
                      </h3>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={isEditingProfile ? (editFormData.fullName || '') : (studentInfo?.fullName || '')}
                          onChange={(e) => isEditingProfile && setEditFormData({...editFormData, fullName: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={`w-full p-3 rounded-lg border ${isEditingProfile ? 'border-gray-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'}`}
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={isEditingProfile ? (editFormData.dateOfBirth ? editFormData.dateOfBirth.split('T')[0] : '') : (studentInfo?.dateOfBirth ? studentInfo.dateOfBirth.split('T')[0] : '')}
                          onChange={(e) => isEditingProfile && setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={`w-full p-3 rounded-lg border ${isEditingProfile ? 'border-gray-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'}`}
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={isEditingProfile ? (editFormData.phoneNumber || '') : (studentInfo?.phoneNumber || '')}
                          onChange={(e) => isEditingProfile && setEditFormData({...editFormData, phoneNumber: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={`w-full p-3 rounded-lg border ${isEditingProfile ? 'border-gray-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'}`}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        {isEditingProfile ? (
                          <select
                            value={editFormData.department || ''}
                            onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Department</option>
                            {['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Biotechnology', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Economics', 'Management'].map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={studentInfo?.department || ''}
                            readOnly
                            className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50"
                          />
                        )}
                      </div>

                      {/* Course */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        {isEditingProfile ? (
                          <select
                            value={editFormData.course || ''}
                            onChange={(e) => setEditFormData({...editFormData, course: e.target.value})}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Course</option>
                            {['B.Tech', 'B.E', 'B.Sc', 'B.A', 'B.Com', 'M.Tech', 'M.E', 'M.Sc', 'M.A', 'M.Com', 'MBA', 'MCA', 'PhD', 'Other'].map(course => (
                              <option key={course} value={course}>{course}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={studentInfo?.course || ''}
                            readOnly
                            className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50"
                          />
                        )}
                      </div>

                      {/* Batch */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                        <input
                          type="text"
                          value={isEditingProfile ? (editFormData.batch || '') : (studentInfo?.batch || '')}
                          onChange={(e) => isEditingProfile && setEditFormData({...editFormData, batch: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={`w-full p-3 rounded-lg border ${isEditingProfile ? 'border-gray-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'}`}
                          placeholder="e.g., 2020-2024"
                        />
                      </div>
                    </div>
                  </div>

                {/* Save/Cancel Buttons */}
                {isEditingProfile && (
                  <div className="mt-8 flex space-x-4 justify-end">
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditFormData(studentInfo || {});
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      disabled={profileLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateStudentProfile(editFormData)}
                      className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaEdit />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                  </>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Review</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Faculty:</strong> {editingReview.teacherName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Subject:</strong> {editingReview.teacherSubject}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="4"
                defaultValue={editingReview.suggestions}
                placeholder="Update your suggestions..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <Link
                to={`/reviewform?edit=${editingReview._id}`}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center"
                onClick={() => {
                  setShowEditModal(false);
                  setSidebarOpen(false); // Auto close drawer
                }}
              >
                Edit Full Review
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Studentdash;
