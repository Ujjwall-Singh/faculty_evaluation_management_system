import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute, { PublicRoute, AdminRoute, StudentRoute, FacultyRoute } from './Components/ProtectedRoute';

// Components imports
import HomePage from './Components/Homepage';
import Selection from './Components/Selection';
import Adminlogin from './Components/Adminlogin';
import Studentlogin from './Components/Studentlogin';
import Facultylogin from './Components/Facultylogin';
import Dashboard from './Components/Dashboard/Admin/Admindashboard';
import Signup from './Components/Signup';
import EmailVerification from './Components/EmailVerification';
import Studentdash from './Components/Dashboard/Student/Studentdash';
import TeacherReviewForm from './Components/Dashboard/Student/TeacherReviewForm';
import ReviewChart from './Components/Dashboard/Faulty/chart';
import Facultydash from './Components/Dashboard/Faulty/Facultydash';
import FacultyAnalysis from './Components/Dashboard/Faulty/FacultyAnalysis';
import UserProfile from './Components/Dashboard/Admin/UserProfile';
import RatingCards from './Components/Dashboard/Admin/RatingCards';
import ReviewTable from './Components/adminchart';
import EventCalendar from './Components/Calendar';
import Services from './Components/Service';
import ProfileCard from './Components/Profile';
import FacultyForm from './Components/Studentdashform';
import Headercard from './Components/Dashboard/Student/Headercard';

// Import backend connection test
import './testConnection';

// GlobalNotification component
const GlobalNotification = () => {
  const { notification } = useAuth();

  if (!notification.show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
      notification.type === 'success' ? 'bg-green-500 text-white' :
      notification.type === 'error' ? 'bg-red-500 text-white' :
      notification.type === 'info' ? 'bg-blue-500 text-white' :
      'bg-gray-500 text-white'
    }`}>
      <div className="flex items-center space-x-2">
        {notification.type === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {notification.type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {notification.type === 'info' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="font-medium">{notification.message}</span>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalNotification />
        <div>
          <Routes>
            {/* Public Routes - Only accessible when NOT logged in */}
            <Route path="/" element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            } />
            
            <Route path="/login" element={
              <PublicRoute>
                <Selection />
              </PublicRoute>
            } />
            
            <Route path="/adminlogin" element={
              <PublicRoute>
                <Adminlogin />
              </PublicRoute>
            } />
            
            <Route path="/Studentlogin" element={
              <PublicRoute>
                <Studentlogin />
              </PublicRoute>
            } />
            
            <Route path="/Facultylogin" element={
              <PublicRoute>
                <Facultylogin />
              </PublicRoute>
            } />
            
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />

            <Route path="/verify-email" element={
              <PublicRoute>
                <EmailVerification />
              </PublicRoute>
            } />

            {/* Admin Protected Routes */}
            <Route path="/admindash" element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            
            <Route path="/profile" element={
              <AdminRoute>
                <UserProfile />
              </AdminRoute>
            } />
            
            <Route path="/ratecard" element={
              <AdminRoute>
                <RatingCards />
              </AdminRoute>
            } />
            
            <Route path="/reviewtable" element={
              <AdminRoute>
                <ReviewTable />
              </AdminRoute>
            } />

            {/* Student Protected Routes */}
            <Route path="/studentdash" element={
              <StudentRoute>
                <Studentdash />
              </StudentRoute>
            } />
            
            <Route path="/reviewform" element={
              <StudentRoute>
                <TeacherReviewForm />
              </StudentRoute>
            } />
            
            <Route path="/studentdashform" element={
              <StudentRoute>
                <FacultyForm />
              </StudentRoute>
            } />

            {/* Faculty Protected Routes */}
            <Route path="/facultydash" element={
              <FacultyRoute>
                <Facultydash />
              </FacultyRoute>
            } />
            
            <Route path="/faculty-analysis" element={
              <FacultyRoute>
                <FacultyAnalysis />
              </FacultyRoute>
            } />
            
            <Route path="/reviewchart" element={
              <FacultyRoute>
                <ReviewChart />
              </FacultyRoute>
            } />

            {/* Shared Protected Routes - Accessible to all authenticated users */}
            <Route path="/calendar" element={
              <ProtectedRoute>
                <EventCalendar />
              </ProtectedRoute>
            } />
            
            <Route path="/Services" element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } />
            
            <Route path="/userprofile" element={
              <ProtectedRoute>
                <ProfileCard />
              </ProtectedRoute>
            } />
            
            <Route path="/headercard" element={
              <ProtectedRoute>
                <Headercard />
              </ProtectedRoute>
            } />

            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
