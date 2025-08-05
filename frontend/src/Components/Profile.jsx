import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaGraduationCap, 
  FaBuilding, 
  FaSignOutAlt, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaIdCard,
  FaLayerGroup,
  FaUsers,
  FaBook,
  FaPhone,
  FaCalendarAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const adminInfo = localStorage.getItem('adminInfo');
    const facultyInfo = localStorage.getItem('facultyInfo');
    const studentInfo = localStorage.getItem('studentInfo');

    if (adminInfo) {
      setUserInfo(JSON.parse(adminInfo));
    } else if (facultyInfo) {
      setUserInfo(JSON.parse(facultyInfo));
    } else if (studentInfo) {
      setUserInfo(JSON.parse(studentInfo));
    } else {
      // No user info found, redirect to home
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (userInfo) {
      setEditForm({
        name: userInfo.name || '',
        email: userInfo.email || '',
        department: userInfo.department || '',
        role: userInfo.role || '',
        // Student specific fields
        admissionNo: userInfo.admissionNo || '',
        universityRollNo: userInfo.universityRollNo || '',
        semester: userInfo.semester || '',
        section: userInfo.section || '',
        course: userInfo.course || '',
        batch: userInfo.batch || '',
        phoneNumber: userInfo.phoneNumber || '',
        dateOfBirth: userInfo.dateOfBirth || '',
        // Faculty specific fields
        subject: userInfo.subject || '',
        phone: userInfo.phone || ''
      });
    }
  }, [userInfo]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: userInfo.name || '',
      email: userInfo.email || '',
      department: userInfo.department || '',
      role: userInfo.role || ''
    });
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to update user info
      // For now, we'll just update localStorage
      const updatedUserInfo = { ...userInfo, ...editForm };
      
      // Update localStorage based on role
      if (userInfo.role === 'Admin') {
        localStorage.setItem('adminInfo', JSON.stringify(updatedUserInfo));
      } else if (userInfo.role === 'Faculty') {
        localStorage.setItem('facultyInfo', JSON.stringify(updatedUserInfo));
      } else if (userInfo.role === 'Student') {
        localStorage.setItem('studentInfo', JSON.stringify(updatedUserInfo));
      }
      
      setUserInfo(updatedUserInfo);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('facultyInfo');
    localStorage.removeItem('studentInfo');
    
    // Redirect to home
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-purple-700">User Profile</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-8 text-white">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mr-6">
                <FaUser className="text-4xl text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userInfo.name}</h2>
                <p className="text-purple-200 capitalize">{userInfo.role}</p>
                {userInfo.department && (
                  <p className="text-purple-200">{userInfo.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaSave className="mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  {userInfo.role === 'Faculty' ? 'Full Name' : 'Username'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-lg">{userInfo.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-lg">{userInfo.email}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaGraduationCap className="inline mr-2" />
                  Role
                </label>
                <p className="p-3 bg-gray-50 rounded-lg capitalize">{userInfo.role}</p>
              </div>

              {/* Department (for Faculty) */}
              {userInfo.role === 'Faculty' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaBuilding className="inline mr-2" />
                    Department
                  </label>
                  {isEditing ? (
                    <select
                      name="department"
                      value={editForm.department}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="English">English</option>
                      <option value="Economics">Economics</option>
                      <option value="Management">Management</option>
                    </select>
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg">{userInfo.department}</p>
                  )}
                </div>
              )}

              {/* Subject (for Faculty) */}
              {userInfo.role === 'Faculty' && userInfo.subject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaBook className="inline mr-2" />
                    Subject/Specialization
                  </label>
                  <p className="p-3 bg-gray-50 rounded-lg">{userInfo.subject}</p>
                </div>
              )}

              {/* Phone (for Faculty) */}
              {userInfo.role === 'Faculty' && userInfo.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2" />
                    Phone Number
                  </label>
                  <p className="p-3 bg-gray-50 rounded-lg">{userInfo.phone}</p>
                </div>
              )}

              {/* Student-specific fields */}
              {userInfo.role === 'Student' && (
                <>
                  {/* Admission Number */}
                  {userInfo.admissionNo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaIdCard className="inline mr-2" />
                        Admission Number
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">{userInfo.admissionNo}</p>
                    </div>
                  )}

                  {/* University Roll Number */}
                  {userInfo.universityRollNo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaIdCard className="inline mr-2" />
                        University Roll Number
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">{userInfo.universityRollNo}</p>
                    </div>
                  )}

                  {/* Semester */}
                  {userInfo.semester && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaLayerGroup className="inline mr-2" />
                        Current Semester
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">{userInfo.semester} Semester</p>
                    </div>
                  )}

                  {/* Section */}
                  {userInfo.section && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaUsers className="inline mr-2" />
                        Section
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">{userInfo.section}</p>
                    </div>
                  )}

                  {/* Department (for Student) */}
                  {userInfo.department && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBuilding className="inline mr-2" />
                        Department
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">{userInfo.department}</p>
                    </div>
                  )}

                  {/* Course */}
                  {userInfo.course && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaGraduationCap className="inline mr-2" />
                        Course
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">{userInfo.course}</p>
                    </div>
                  )}

                  {/* Batch */}
                  {userInfo.batch && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-2" />
                        Batch
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">{userInfo.batch}</p>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {userInfo.dateOfBirth && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-2" />
                        Date of Birth
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">
                        {new Date(userInfo.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Phone Number */}
                  {userInfo.phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaPhone className="inline mr-2" />
                        Phone Number
                      </label>
                      <p className="p-3 bg-gray-50 rounded-lg">{userInfo.phoneNumber}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Additional Info based on role */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                {userInfo.role === 'Admin' && (
                  <p className="text-blue-800">
                    As an administrator, you have access to all system features including user management, 
                    review analytics, and system configuration.
                  </p>
                )}
                {userInfo.role === 'Faculty' && (
                  <p className="text-blue-800">
                    As a faculty member, you can view student reviews, access your performance analytics, 
                    and manage your profile information.
                  </p>
                )}
                {userInfo.role === 'Student' && (
                  <p className="text-blue-800">
                    As a student, you can submit faculty reviews, view your submission history, 
                    and manage your profile information.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
