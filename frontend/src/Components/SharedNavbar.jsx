import React, { useState, useEffect } from 'react';
import { 
  FaHome, 
  FaCalendar, 
  FaCog, 
  FaBars, 
  FaTimes, 
  FaSignOutAlt, 
  FaUser, 
  FaStar, 
  FaEdit, 
  FaSearch
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import logo from '../Assets/logo.png';

const SharedNavbar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const location = useLocation();
  
  // Function to check if a navigation item is active
  const isActive = (path, hash = null) => {
    // Force re-evaluation by including forceUpdate in dependency
    if (hash) {
      return location.pathname === '/studentdash' && window.location.hash === hash;
    }
    return location.pathname === path;
  };

  // Function to get active navigation styles
  const getNavStyles = (path, hash = null) => {
    const baseStyles = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left";
    const activeStyles = "bg-purple-100 text-purple-700 border-l-4 border-purple-500";
    const inactiveStyles = "text-gray-600 hover:bg-gray-100";
    
    return `${baseStyles} ${isActive(path, hash) ? activeStyles : inactiveStyles}`;
  };

  useEffect(() => {
    // Get student info from localStorage
    const storedStudentInfo = localStorage.getItem('studentInfo');
    if (storedStudentInfo) {
      const student = JSON.parse(storedStudentInfo);
      setStudentInfo(student);
    }
    
    // Listen for hash changes to update active state
    const handleHashChange = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    window.location.href = '/';
  };

  return (
    <>
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
          <Link
            to="/studentdash"
            onClick={(e) => {
              setSidebarOpen(false);
            }}
            className={getNavStyles('/studentdash')}
          >
            <FaHome />
            <span>Dashboard</span>
          </Link>
          
          <Link
            to="/reviewform"
            onClick={(e) => {
              setSidebarOpen(false);
            }}
            className={getNavStyles('/reviewform')}
          >
            <FaEdit />
            <span>Submit Review</span>
          </Link>
          
          <button
            onClick={() => {
              setSidebarOpen(false);
              window.location.href = '/studentdash#my-reviews';
            }}
            className={getNavStyles('/studentdash', '#my-reviews')}
          >
            <FaStar />
            <span>My Reviews</span>
          </button>
          
          <Link
            to="/calendar"
            onClick={(e) => {
              setSidebarOpen(false);
            }}
            className={getNavStyles('/calendar')}
          >
            <FaCalendar />
            <span>Calendar</span>
          </Link>
          
          <button
            onClick={() => {
              setSidebarOpen(false);
              window.location.href = '/studentdash#profile';
            }}
            className={getNavStyles('/studentdash', '#profile')}
          >
            <FaCog />
            <span>Profile</span>
          </button>
          
          <button 
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-auto"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </nav>
      </div>

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
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default SharedNavbar;
