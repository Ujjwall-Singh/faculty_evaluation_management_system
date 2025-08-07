import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role (if specified)
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.userType)) {
    // Redirect to appropriate dashboard if user doesn't have required role
    const dashboardRoutes = {
      admin: '/admindash',
      student: '/studentdash',
      faculty: '/facultydash'
    };
    
    const redirectTo = dashboardRoutes[user.userType] || '/login';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// Public Route Component (only accessible when NOT logged in)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, getDashboardRoute } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    return <Navigate to={getDashboardRoute()} replace />;
  }

  return children;
};

// Role-specific route components
export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const StudentRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['student']}>
    {children}
  </ProtectedRoute>
);

export const FacultyRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['faculty']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
