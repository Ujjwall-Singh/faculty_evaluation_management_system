import React, { useState, useEffect } from 'react';
import dashimg from "../../../Assets/dashimg.png";
import facultyimg from "../../../Assets/facultyimg.gif";
import logo from "../../../Assets/logo.png";
import { FaHome, FaBook, FaBell, FaCalendar, FaCog, FaBars, FaTimes, FaSignOutAlt, FaChartBar, FaStar, FaUsers, FaGraduationCap, FaClock, FaTrophy } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { CalendarContent } from '../../Calendar';
import Services from '../../Service';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';

const Facultydash = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    recentReviews: 0,
    topRating: 0
  });

  useEffect(() => {
    // Get faculty info from localStorage
    const storedFacultyInfo = localStorage.getItem('facultyInfo');
    if (storedFacultyInfo) {
      const faculty = JSON.parse(storedFacultyInfo);
      setFacultyInfo(faculty);
      
      // Fetch reviews for this faculty member
      fetchFacultyReviews(faculty.name, faculty.department);
    }
  }, []);

  const fetchFacultyReviews = async (name, department) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/review/faculty/${encodeURIComponent(name)}/${encodeURIComponent(department)}`);
      setReviews(response.data);
      
      // Calculate statistics
      const totalReviews = response.data.length;
      let averageRating = 0;
      let topRating = 0;
      
      if (response.data.length > 0) {
        const totalRating = response.data.reduce((sum, review) => {
          const reviewAvg = Object.values(review.ratings).reduce((a, b) => a + b, 0) / 12;
          if (reviewAvg > topRating) topRating = reviewAvg;
          return sum + reviewAvg;
        }, 0);
        averageRating = totalRating / response.data.length;
      }
      
      setStats({
        totalReviews,
        averageRating: averageRating.toFixed(2),
        recentReviews: response.data.slice(0, 5).length,
        topRating: topRating.toFixed(2)
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = (ratings) => {
    const values = Object.values(ratings);
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  };

  const handleLogout = () => {
    localStorage.removeItem('facultyInfo');
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out bg-purple-500 shadow-lg w-64 z-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-purple-500 text-white">
          <h2 className="text-xl font-semibold">Faculty Dashboard</h2>
          <button
            className="focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex flex-col p-4 space-y-4">
          <a href="#dashboard" className="flex items-center space-x-2 text-white hover:text-purple-900 transition-colors">
            <FaHome />
            <span>Dashboard</span>
          </a>
          <Link to="/faculty-analysis" className="flex items-center space-x-2 text-white hover:text-purple-900 transition-colors">
            <FaChartBar />
            <span>Analysis</span>
          </Link>
          
          <Link to="/userprofile" className="flex items-center space-x-2 text-white hover:text-purple-900 transition-colors">
            <FaCog />
            <span>Profile</span>
          </Link>
          <Link to="/calendar" className="flex items-center space-x-2 text-white hover:text-purple-900 transition-colors">
            <FaCalendar />
            <span>Calendar</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-white hover:text-purple-900 transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

          <div className="mt-auto">
            <img src={dashimg} alt="" className="w-full" />
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md">
          <button
            className="focus:outline-none text-purple-600 hover:text-purple-800 transition-colors"
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
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reviews..."
                className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <Link to='/userprofile'>
              <img
                src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-purple-200 hover:border-purple-400 transition-colors"
              />
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Your Performance Dashboard
                </h1>
                <p className="text-purple-100 text-lg mb-6">
                  Track your teaching performance, view student feedback, and analyze your growth over time.
                </p>
                {facultyInfo && (
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                      <span className="font-semibold">Department:</span> {facultyInfo.department}
                    </div>
                    <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                      <span className="font-semibold">Total Reviews:</span> {stats.totalReviews}
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden md:block md:w-1/3">
                <img
                  src={facultyimg}
                  alt="Faculty Dashboard"
                  className="w-full max-w-xs"
                />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaUsers className="text-2xl text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalReviews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaStar className="text-2xl text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.averageRating}/5</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaTrophy className="text-2xl text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Top Rating</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.topRating}/5</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaClock className="text-2xl text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Recent Reviews</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.recentReviews}</p>
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
                  to="/faculty-analysis"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FaChartBar className="text-purple-600 mr-3" />
                  <span className="text-gray-700">View Detailed Analytics</span>
                </Link>
                <Link 
                  to="/userprofile"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FaCog className="text-blue-600 mr-3" />
                  <span className="text-gray-700">Update Profile</span>
                </Link>
                <Link 
                  to="/calendar"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <FaCalendar className="text-green-600 mr-3" />
                  <span className="text-gray-700">View Calendar</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overall Rating</span>
                  <span className="font-semibold text-lg">{stats.averageRating}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.averageRating / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  Based on {stats.totalReviews} student reviews
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h3>
            <CalendarContent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Facultydash;
