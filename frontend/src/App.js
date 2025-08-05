import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Components/Homepage';
import Selection from './Components/Selection';
import Adminlogin from './Components/Adminlogin';
import Studentlogin from './Components/Studentlogin';
import Facultylogin from './Components/Facultylogin';
import Dashboard from './Components/Dashboard/Admin/Admindashboard';
import Signup from './Components/Signup';
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

// Import backend connection test
import './testConnection';
import FacultyForm from './Components/Studentdashform';
import Headercard from './Components/Dashboard/Student/Headercard';





const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/login" element={<Selection/>} />
           <Route path="/adminlogin" element={<Adminlogin />} />
           <Route path="/Studentlogin" element={<Studentlogin />} />
           <Route path="/Facultylogin" element={<Facultylogin />} />
           <Route path="/signup" element={<Signup />} />
           <Route path="/admindash" element={<Dashboard />} />
           <Route path="/facultydash" element={<Facultydash />} />
           <Route path="/faculty-analysis" element={<FacultyAnalysis />} />
           
          
           <Route path="/studentdash" element={<Studentdash />} />
           <Route path="/reviewchart" element={<ReviewChart />} />
           <Route path="/reviewform" element={<TeacherReviewForm />} />
           <Route path="/profile" element={<UserProfile />} />
           <Route path="/ratecard" element={<RatingCards />} />
           <Route path="/reviewtable" element={<ReviewTable />} />
           <Route path="/calendar" element={<EventCalendar />} />
           <Route path="/Services" element={<Services />} />
           <Route path="/userprofile" element={<ProfileCard/>} />
           <Route path="/studentdashform" element={<FacultyForm/>} />
           <Route path="/headercard" element={<Headercard/>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
