import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      // Check for admin
      const adminInfo = localStorage.getItem('adminInfo');
      if (adminInfo) {
        const admin = JSON.parse(adminInfo);
        setUser({ ...admin, userType: 'admin' });
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Check for student
      const studentInfo = localStorage.getItem('studentInfo');
      if (studentInfo) {
        const student = JSON.parse(studentInfo);
        setUser({ ...student, userType: 'student' });
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Check for faculty
      const facultyInfo = localStorage.getItem('facultyInfo');
      if (facultyInfo) {
        const faculty = JSON.parse(facultyInfo);
        setUser({ ...faculty, userType: 'faculty' });
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // No authentication found
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear corrupted data
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('studentInfo');
      localStorage.removeItem('facultyInfo');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000); // Hide after 4 seconds
  };

  const login = (userData, userType) => {
    try {
      const userInfo = { ...userData, userType };
      setUser(userInfo);
      setIsAuthenticated(true);

      // Store in appropriate localStorage key
      if (userType === 'admin') {
        localStorage.setItem('adminInfo', JSON.stringify(userData));
        // Clear other auth data
        localStorage.removeItem('studentInfo');
        localStorage.removeItem('facultyInfo');
        showNotification(`Admin login successful! Welcome ${userData.name || 'Admin'}`, 'success');
      } else if (userType === 'student') {
        localStorage.setItem('studentInfo', JSON.stringify(userData));
        // Clear other auth data
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('facultyInfo');
        showNotification(`Student login successful! Welcome ${userData.name || 'Student'}`, 'success');
      } else if (userType === 'faculty') {
        localStorage.setItem('facultyInfo', JSON.stringify(userData));
        // Clear other auth data
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('studentInfo');
        showNotification(`Faculty login successful! Welcome ${userData.name || 'Faculty'}`, 'success');
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Login failed. Please try again.', 'error');
      throw new Error('Failed to save login information');
    }
  };

  const logout = () => {
    try {
      const userType = user?.userType || 'User';
      const userName = user?.name || userType;
      
      // Clear all authentication data
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('studentInfo');
      localStorage.removeItem('facultyInfo');
      
      // Clear any other application data that should be reset on logout
      localStorage.removeItem('userPreferences');
      localStorage.removeItem('tempFormData');
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Show logout notification
      showNotification(`${userName} logged out successfully. Goodbye!`, 'success');
      
      // Navigate to home page after a short delay
      setTimeout(() => {
        window.location.replace('/');
      }, 2000); // 2 second delay to show notification
      
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Logout completed', 'success');
      // Force redirect to home even if there's an error
      setTimeout(() => {
        window.location.replace('/');
      }, 1500);
    }
  };

  const updateUser = (userData) => {
    try {
      if (user && user.userType) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);

        // Update localStorage
        if (user.userType === 'admin') {
          localStorage.setItem('adminInfo', JSON.stringify(updatedUser));
        } else if (user.userType === 'student') {
          localStorage.setItem('studentInfo', JSON.stringify(updatedUser));
        } else if (user.userType === 'faculty') {
          localStorage.setItem('facultyInfo', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  // Get user type specific dashboard route
  const getDashboardRoute = () => {
    if (!user || !user.userType) return '/login';
    
    switch (user.userType) {
      case 'admin':
        return '/admindash';
      case 'student':
        return '/studentdash';
      case 'faculty':
        return '/facultydash';
      default:
        return '/login';
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.userType === role;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    getDashboardRoute,
    hasRole,
    userType: user?.userType || null,
    notification,
    showNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
