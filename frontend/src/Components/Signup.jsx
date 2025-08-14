import React, { useState } from 'react';
import signupimg from "../Assets/signupimg.gif";
import logo from "../Assets/logo.png";
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Faculty');
  const [department, setDepartment] = useState('Computer Science');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  
  // Student-specific fields
  const [admissionNo, setAdmissionNo] = useState('');
  const [universityRollNo, setUniversityRollNo] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'Economics',
    'Management'
  ];

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  
  const sections = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Super60', 'Uniques'];
  
  const courses = ['B.Tech', 'B.E', 'B.Sc', 'B.A', 'B.Com', 'M.Tech', 'M.E', 'M.Sc', 'M.A', 'M.Com', 'MBA', 'MCA', 'PhD', 'Other'];

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Common validations
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!name) newErrors.name = 'Name is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long';
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    // Role-specific validations
    if (role === 'Faculty') {
      if (!department) newErrors.department = 'Department is required';
      if (!subject) newErrors.subject = 'Subject is required';
      if (!phone) newErrors.phone = 'Phone number is required';
    } else if (role === 'Student') {
      if (!admissionNo) newErrors.admissionNo = 'Admission number is required';
      else if (!/^[A-Z0-9]{8,15}$/.test(admissionNo)) newErrors.admissionNo = 'Admission number must be 8-15 alphanumeric characters';
      
      if (!universityRollNo) newErrors.universityRollNo = 'University roll number is required';
      else if (!/^\d{6,25}$/.test(universityRollNo)) newErrors.universityRollNo = 'University roll number must be 6-25 digits';
      
      if (!semester) newErrors.semester = 'Semester is required';
      if (!section) newErrors.section = 'Section is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const apiUrl = `${API_BASE_URL}/api/signup`;
      console.log('Full API URL being called:', apiUrl);
      console.log('API_BASE_URL value:', API_BASE_URL);
      
      const requestData = {
        email,
        name,
        password,
        role
      };

      // Add role-specific fields
      if (role === 'Faculty') {
        requestData.department = department;
        requestData.subject = subject;
        requestData.phone = phone;
      } else if (role === 'Student') {
        requestData.admissionNo = admissionNo;
        requestData.universityRollNo = universityRollNo;
        requestData.semester = semester;
        requestData.section = section;
        requestData.dateOfBirth = dateOfBirth;
        requestData.phoneNumber = phoneNumber;
        requestData.department = department;
        requestData.course = course;
        requestData.batch = batch;
      }
      
      const response = await axios.post(apiUrl, requestData);
      
      // Handle different signup responses
      if (role === 'Faculty' && response.data.status === 'pending') {
        alert(response.data.msg + '\n\nNote: You will receive an email notification once your account is approved.');
      } else {
        alert(response.data.msg);
      }
      
      // Clear form after successful signup
      setEmail('');
      setName('');
      setPassword('');
      setConfirmPassword('');
      setDepartment('Computer Science');
      setSubject('');
      setPhone('');
      
      if (role === 'Student') {
        setAdmissionNo('');
        setUniversityRollNo('');
        setSemester('');
        setSection('');
        setDateOfBirth('');
        setPhoneNumber('');
        setCourse('');
        setBatch('');
      }
      
      setErrors({});
    } catch (error) {
      console.error('Signup Error Full Details:', error);
      console.error('Error Response:', error.response);
      console.error('Error Response Data:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.details || "Failed to sign up";
      alert('Signup failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="sticky inset-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 transition-all duration-200 ease-in-out lg:px-12 py-4">
          <div className="flex items-center">
            <a href="/">
              <img className="block h-14 w-auto" src={logo} alt="Logo" />
            </a>
          </div>
          <div className="flex items-center justify-center">
            <a
              className="rounded-md bg-purple-500 px-3 py-1.5 font-dm text-sm font-medium text-white shadow-md transition-transform duration-200 ease-in-out hover:scale-[1.03]"
              href="/"
            >
              Go Back
            </a>
          </div>
        </nav>
      </header>

      <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <div className="flex flex-col items-center">
              <h1 className="text-2xl xl:text-3xl font-bold">Faculty/Student Signup</h1>
              <div className="w-full flex-1 mt-8">
                <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                  {/* Email */}
                  <input
                    className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white ${errors.email ? 'border-red-500' : ''}`}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  
                  {/* Name */}
                  <input
                    className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 ${errors.name ? 'border-red-500' : ''}`}
                    type="text"
                    placeholder={role === 'Faculty' ? 'Full Name' : 'Username'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  
                  {/* Password */}
                  <input
                    className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 ${errors.password ? 'border-red-500' : ''}`}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  {!errors.password && (
                    <p className="text-gray-500 text-xs mt-1">
                      Password must be at least 6 characters long
                    </p>
                  )}
                  
                  {/* Confirm Password */}
                  <input
                    className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  
                  {/* Role Selection */}
                  <select
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 text-sm mt-5"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="Faculty">Faculty</option>
                    <option value="Student">Student</option>
                  </select>
                  
                  {/* Faculty-specific fields */}
                  {role === 'Faculty' && (
                    <>
                      <select
                        className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 text-sm mt-5 ${errors.department ? 'border-red-500' : ''}`}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        disabled={isLoading}
                        required
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                      
                      <input
                        className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 ${errors.subject ? 'border-red-500' : ''}`}
                        type="text"
                        placeholder="Subject/Specialization"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                      
                      <input
                        className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 ${errors.phone ? 'border-red-500' : ''}`}
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </>
                  )}
                  
                  {/* Student-specific fields */}
                  {role === 'Student' && (
                    <>
                      {/* Admission Number */}
                      <input
                        className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 ${errors.admissionNo ? 'border-red-500' : ''}`}
                        type="text"
                        placeholder="e.g., 2022BTCS063"
                        value={admissionNo}
                        onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
                        required
                        disabled={isLoading}
                        maxLength="15"
                      />
                      {errors.admissionNo && <p className="text-red-500 text-xs mt-1">{errors.admissionNo}</p>}
                      
                      {/* University Roll Number */}
                      <input
                        className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 ${errors.universityRollNo ? 'border-red-500' : ''}`}
                        type="text"
                        placeholder="University Roll Number (digits only)"
                        value={universityRollNo}
                        onChange={(e) => setUniversityRollNo(e.target.value)}
                        required
                        disabled={isLoading}
                        maxLength="25"
                        pattern="\d*"
                      />
                      {errors.universityRollNo && <p className="text-red-500 text-xs mt-1">{errors.universityRollNo}</p>}
                      
                      {/* Semester */}
                      <select
                        className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 text-sm mt-5 ${errors.semester ? 'border-red-500' : ''}`}
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select Semester</option>
                        {semesters.map(sem => (
                          <option key={sem} value={sem}>{sem} Semester</option>
                        ))}
                      </select>
                      {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
                      
                      {/* Section */}
                      <select
                        className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 text-sm mt-5 ${errors.section ? 'border-red-500' : ''}`}
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select Section</option>
                        {sections.map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                      {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
                      
                      {/* Optional Student Fields */}
                      <input
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                        type="date"
                        placeholder="Date of Birth (Optional)"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        disabled={isLoading}
                      />
                      
                      <input
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                        type="tel"
                        placeholder="Phone Number (Optional)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isLoading}
                      />
                      
                      <select
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 text-sm mt-5"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="">Select Department (Optional)</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      
                      <select
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 text-sm mt-5"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="">Select Course (Optional)</option>
                        {courses.map(courseOption => (
                          <option key={courseOption} value={courseOption}>{courseOption}</option>
                        ))}
                      </select>
                      
                      <input
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                        type="text"
                        placeholder="Batch (e.g., 2020-2024) (Optional)"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        disabled={isLoading}
                        pattern="\d{4}-\d{4}"
                      />
                    </>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-5 tracking-wide font-semibold bg-purple-500 text-gray-100 w-full py-4 rounded-lg hover:bg-purple-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing up...
                      </>
                    ) : (
                      <span className="ml-3">Signup Here</span>
                    )}
                  </button>
                  
                  <p className="mt-6 text-xs text-gray-600 text-center">
                    I agree to abide by templatana's
                    <a href="#" className="border-b border-gray-500 border-dotted">
                      Terms of Service
                    </a>
                    and its
                    <a href="#" className="border-b border-gray-500 border-dotted">
                      Privacy Policy
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white text-center hidden lg:flex">
            <div
              className="h-full w-full bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${signupimg})`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
