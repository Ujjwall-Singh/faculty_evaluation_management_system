import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaUserGraduate, 
    FaIdBadge, 
    FaChalkboardTeacher, 
    FaComments, 
    FaStar,
    FaCheckCircle,
    FaExclamationTriangle,
    FaSpinner,
    FaEye,
    FaEyeSlash,
    FaInfoCircle,
    FaSave,
    FaTrash,
    FaArrowLeft
} from 'react-icons/fa';
import { MdOutlineRateReview, MdAutoAwesome } from 'react-icons/md';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../../../config/api';
import SharedNavbar from '../../SharedNavbar';

const TeacherReviewForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [studentInfo, setStudentInfo] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [saveAsDraft, setSaveAsDraft] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);

    const [formData, setFormData] = useState({
        studentName: '',
        admissionNo: '',
        branchSemester: '',
        semester: '',
        department: '',
        course: '',
        section: '',
        teacherName: '',
        teacherSubject: '',
        teacherDepartment: '',
        ratings: {
            conceptExplanation: 3,
            subjectKnowledge: 3,
            contentOrganization: 3,
            classTiming: 3,
            learningEnvironment: 3,
            studentParticipation: 3,
            feedbackQuality: 3,
            resourceUtilization: 3,
            innovation: 3,
            accessibility: 3,
            supportiveness: 3,
            professionalism: 3
        },
        suggestions: '',
        overallEvaluation: 3
    });

    const [facultyList, setFacultyList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [subjectSuggestions, setSubjectSuggestions] = useState([]);

    // Rating descriptions for better understanding
    const ratingDescriptions = {
        conceptExplanation: "How well does the teacher explain concepts?",
        subjectKnowledge: "Teacher's expertise in the subject",
        contentOrganization: "How well is the course content organized?",
        classTiming: "Punctuality and time management",
        learningEnvironment: "Classroom atmosphere and engagement",
        studentParticipation: "Encouragement of student involvement",
        feedbackQuality: "Quality of feedback on assignments/exams",
        resourceUtilization: "Use of teaching aids and resources",
        innovation: "Use of innovative teaching methods",
        accessibility: "Availability for doubt clearing",
        supportiveness: "Support for student learning",
        professionalism: "Professional conduct and behavior"
    };

    const ratingLabels = {
        1: "Poor",
        2: "Below Average", 
        3: "Average",
        4: "Good",
        5: "Excellent"
    };

    // Fetch student profile and auto-populate form
    useEffect(() => {
        const loadStudentProfile = async () => {
            try {
                setProfileLoading(true);
                const storedStudentInfo = localStorage.getItem('studentInfo');
                
                if (storedStudentInfo) {
                    const student = JSON.parse(storedStudentInfo);
                    
                    // Fetch complete profile if needed
                    let completeStudentData = student;
                    if (student._id && (!student.admissionNo || !student.semester)) {
                        const response = await axios.get(`${API_BASE_URL}/api/student-profile/${student._id}`);
                        if (response.data.success) {
                            completeStudentData = response.data.student;
                            localStorage.setItem('studentInfo', JSON.stringify(completeStudentData));
                        }
                    }
                    
                    setStudentInfo(completeStudentData);
                    
                    // Auto-populate form with student data
                    setFormData(prevData => ({
                        ...prevData,
                        studentName: completeStudentData.name || completeStudentData.username || '',
                        admissionNo: completeStudentData.admissionNo || '',
                        branchSemester: `${completeStudentData.department || ''}, ${completeStudentData.semester || ''} Semester`.trim().replace(/^,\s*/, ''),
                        semester: completeStudentData.semester || '',
                        department: completeStudentData.department || '',
                        course: completeStudentData.course || '',
                        section: completeStudentData.section || ''
                    }));
                }
            } catch (error) {
                console.error('Error loading student profile:', error);
            } finally {
                setProfileLoading(false);
            }
        };

        loadStudentProfile();
    }, []);

    // Check if editing existing review
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const editReviewId = urlParams.get('edit');
        
        if (editReviewId) {
            setIsEditMode(true);
            setEditingReviewId(editReviewId);
        }
    }, [location]);

    // Fetch faculty list
    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/faculty`);
                setFacultyList(response.data);
                
                // Extract unique departments
                const uniqueDepartments = [...new Set(response.data.map(faculty => faculty.department))];
                setDepartments(uniqueDepartments);
                
                // If student has department, auto-select it
                if (studentInfo?.department && uniqueDepartments.includes(studentInfo.department)) {
                    setSelectedDepartment(studentInfo.department);
                }
            } catch (error) {
                console.error('Error fetching faculty:', error);
                // Fallback with common departments
                setDepartments([
                    'Computer Science',
                    'Information Technology', 
                    'Electronics & Communication',
                    'Mechanical Engineering',
                    'Civil Engineering',
                    'Electrical Engineering'
                ]);
            }
        };

        fetchFaculty();
    }, [studentInfo]);

    // Filter faculty by selected department  
    const filteredFaculty = facultyList.filter(faculty => 
        selectedDepartment ? faculty.department === selectedDepartment : true
    );

    // Generate subject suggestions based on selected faculty and department
    useEffect(() => {
        if (selectedDepartment) {
            const suggestions = [];
            
            // Common subjects by department
            const commonSubjects = {
                'Computer Science': ['Data Structures', 'Algorithms', 'Database Management', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Web Development', 'Machine Learning', 'Artificial Intelligence'],
                'Information Technology': ['Programming', 'Database Systems', 'Network Security', 'Web Technologies', 'Mobile App Development', 'Cloud Computing'],
                'Electronics & Communication': ['Digital Electronics', 'Signals and Systems', 'Communication Systems', 'Microprocessors', 'VLSI Design'],
                'Mechanical Engineering': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes', 'Heat Transfer'],
                'Civil Engineering': ['Structural Analysis', 'Concrete Technology', 'Surveying', 'Geotechnical Engineering', 'Transportation Engineering'],
                'Electrical Engineering': ['Circuit Analysis', 'Power Systems', 'Control Systems', 'Electric Machines', 'Power Electronics']
            };
            
            if (commonSubjects[selectedDepartment]) {
                suggestions.push(...commonSubjects[selectedDepartment]);
            }
            
            setSubjectSuggestions([...new Set(suggestions)]);
        }
    }, [selectedDepartment, facultyList]);

    // Calculate overall evaluation automatically
    useEffect(() => {
        const ratingsArray = Object.values(formData.ratings);
        const average = ratingsArray.reduce((sum, rating) => sum + rating, 0) / ratingsArray.length;
        setFormData(prev => ({
            ...prev,
            overallEvaluation: Math.round(average * 10) / 10
        }));
    }, [formData.ratings]);

    // Form validation
    const validateForm = () => {
        const errors = {};
        
        if (!formData.studentName.trim()) {
            errors.studentName = 'Student name is required';
        }
        
        if (!formData.admissionNo.trim()) {
            errors.admissionNo = 'Admission number is required';
        } else if (!/^[A-Z0-9]{8,15}$/i.test(formData.admissionNo)) {
            errors.admissionNo = 'Admission number should be 8-15 alphanumeric characters';
        }
        
        if (!formData.teacherName) {
            errors.teacherName = 'Please select a teacher';
        }
        
        if (!formData.teacherSubject.trim()) {
            errors.teacherSubject = 'Subject is required';
        }
        
        if (!formData.teacherDepartment) {
            errors.teacherDepartment = 'Department is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Clear specific field error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        if (name in formData.ratings) {
            setFormData(prevFormData => ({
                ...prevFormData,
                ratings: {
                    ...prevFormData.ratings,
                    [name]: Number(value)
                }
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value
            }));
        }
    };

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
        setFormData(prevFormData => ({
            ...prevFormData,
            teacherDepartment: e.target.value,
            teacherName: '', // Reset teacher name when department changes
            teacherSubject: '' // Reset subject when department changes
        }));
    };

    const handleTeacherChange = (e) => {
        const selectedTeacher = facultyList.find(faculty => faculty.name === e.target.value);
        setFormData(prevFormData => ({
            ...prevFormData,
            teacherName: e.target.value,
            teacherDepartment: selectedTeacher ? selectedTeacher.department : ''
        }));
        setSelectedDepartment(selectedTeacher ? selectedTeacher.department : '');
    };

    const handleSubjectSelect = (subject) => {
        setFormData(prev => ({
            ...prev,
            teacherSubject: subject
        }));
    };

    const handleSaveAsDraft = async () => {
        setSaveAsDraft(true);
        try {
            // Save to localStorage as draft
            const draftData = {
                ...formData,
                isDraft: true,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('reviewDraft', JSON.stringify(draftData));
            alert('Review saved as draft! 📝');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft');
        } finally {
            setSaveAsDraft(false);
        }
    };

    const loadDraft = () => {
        try {
            const draft = localStorage.getItem('reviewDraft');
            if (draft) {
                const draftData = JSON.parse(draft);
                if (window.confirm('Load saved draft?')) {
                    setFormData(draftData);
                    if (draftData.teacherDepartment) {
                        setSelectedDepartment(draftData.teacherDepartment);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    };

    const clearDraft = () => {
        localStorage.removeItem('reviewDraft');
        alert('Draft cleared! 🗑️');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('Please fix the errors in the form');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const submitData = {
                ...formData,
                submittedAt: new Date().toISOString(),
                studentId: studentInfo?._id
            };
            
            let response;
            if (isEditMode && editingReviewId) {
                response = await axios.put(`${API_BASE_URL}/api/review/${editingReviewId}`, submitData);
            } else {
                response = await axios.post(`${API_BASE_URL}/api/review`, submitData);
            }
            
            console.log(response.data.message);
            alert(isEditMode ? "Review updated successfully! 🎉" : "Review submitted successfully! 🎉");
            
            // Clear draft after successful submission
            localStorage.removeItem('reviewDraft');
            
            // Navigate back to dashboard
            navigate('/studentdash');
            
        } catch (error) {
            console.error("Failed to submit review", error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to submit review!";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check for saved draft on component mount
    useEffect(() => {
        const draft = localStorage.getItem('reviewDraft');
        if (draft && !isEditMode) {
            const hasDraft = window.confirm('You have a saved draft. Would you like to load it?');
            if (hasDraft) {
                loadDraft();
            }
        }
    }, [isEditMode]);

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
            <SharedNavbar />
            <div className="w-full py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Link 
                                    to="/studentdash" 
                                    className="mr-4 p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                    <FaArrowLeft className="text-xl" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-purple-700 flex items-center">
                                        <MdOutlineRateReview className="mr-3" />
                                        {isEditMode ? 'Edit Review' : 'Faculty Review Form'}
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        {isEditMode ? 'Update your faculty review' : 'Share your feedback to help improve teaching quality'}
                                    </p>
                                </div>
                            </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSaveAsDraft}
                                disabled={saveAsDraft}
                                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                {saveAsDraft ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                                Save Draft
                            </button>
                            {localStorage.getItem('reviewDraft') && (
                                <button
                                    onClick={clearDraft}
                                    className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    <FaTrash className="mr-2" />
                                    Clear Draft
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Student Profile Info */}
                    {studentInfo && (
                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 mb-6">
                            <div className="flex items-center">
                                <MdAutoAwesome className="text-purple-600 text-2xl mr-3" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">Auto-filled from your profile</h3>
                                    <p className="text-sm text-gray-600">
                                        Your student information has been automatically loaded. Verify the details below.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Student Information Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FaUserGraduate className="mr-3 text-purple-600" />
                            Student Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="flex items-center text-gray-700 mb-2 font-medium">
                                    <FaUserGraduate className="mr-2 text-purple-600" /> 
                                    Student Name *
                                </label>
                                <input 
                                    type="text" 
                                    name="studentName" 
                                    value={formData.studentName} 
                                    onChange={handleChange} 
                                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                                        formErrors.studentName ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                                    }`}
                                    placeholder="Enter your name" 
                                    required 
                                />
                                {formErrors.studentName && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <FaExclamationTriangle className="mr-1" />
                                        {formErrors.studentName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center text-gray-700 mb-2 font-medium">
                                    <FaIdBadge className="mr-2 text-purple-600" /> 
                                    Admission Number *
                                </label>
                                <input 
                                    type="text" 
                                    name="admissionNo" 
                                    value={formData.admissionNo} 
                                    onChange={handleChange} 
                                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                                        formErrors.admissionNo ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                                    }`}
                                    placeholder="Enter admission number" 
                                    required 
                                />
                                {formErrors.admissionNo && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <FaExclamationTriangle className="mr-1" />
                                        {formErrors.admissionNo}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center text-gray-700 mb-2 font-medium">
                                    🎓 Branch & Semester
                                </label>
                                <input 
                                    type="text" 
                                    name="branchSemester" 
                                    value={formData.branchSemester} 
                                    onChange={handleChange} 
                                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="E.g., Computer Science, 3rd Semester" 
                                    required 
                                />
                            </div>

                            {studentInfo?.semester && (
                                <div>
                                    <label className="flex items-center text-gray-700 mb-2 font-medium">
                                        📚 Current Semester
                                    </label>
                                    <input 
                                        type="text" 
                                        value={`${studentInfo.semester} Semester`}
                                        readOnly
                                        className="w-full p-4 border-2 border-gray-200 bg-gray-50 rounded-xl"
                                    />
                                </div>
                            )}

                            {studentInfo?.section && (
                                <div>
                                    <label className="flex items-center text-gray-700 mb-2 font-medium">
                                        🏛️ Section
                                    </label>
                                    <input 
                                        type="text" 
                                        value={studentInfo.section}
                                        readOnly
                                        className="w-full p-4 border-2 border-gray-200 bg-gray-50 rounded-xl"
                                    />
                                </div>
                            )}

                            {studentInfo?.course && (
                                <div>
                                    <label className="flex items-center text-gray-700 mb-2 font-medium">
                                        🎯 Course
                                    </label>
                                    <input 
                                        type="text" 
                                        value={studentInfo.course}
                                        readOnly
                                        className="w-full p-4 border-2 border-gray-200 bg-gray-50 rounded-xl"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Faculty Information Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FaChalkboardTeacher className="mr-3 text-purple-600" />
                            Faculty Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center text-gray-700 mb-2 font-medium">
                                    🏫 Department *
                                </label>
                                <select 
                                    name="teacherDepartment" 
                                    value={selectedDepartment} 
                                    onChange={handleDepartmentChange} 
                                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                                        formErrors.teacherDepartment ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                                    }`}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                                {formErrors.teacherDepartment && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <FaExclamationTriangle className="mr-1" />
                                        {formErrors.teacherDepartment}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center text-gray-700 mb-2 font-medium">
                                    <FaChalkboardTeacher className="mr-2 text-purple-600" /> 
                                    Faculty Name *
                                </label>
                                <select 
                                    name="teacherName" 
                                    value={formData.teacherName} 
                                    onChange={handleTeacherChange} 
                                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                                        formErrors.teacherName ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                                    }`}
                                    required
                                >
                                    <option value="">Select Faculty</option>
                                    {filteredFaculty.map((faculty) => (
                                        <option key={faculty._id} value={faculty.name}>
                                            {faculty.name} - {faculty.department}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.teacherName && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <FaExclamationTriangle className="mr-1" />
                                        {formErrors.teacherName}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center text-gray-700 mb-2 font-medium">
                                    📘 Subject *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        name="teacherSubject" 
                                        value={formData.teacherSubject} 
                                        onChange={handleChange} 
                                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                                            formErrors.teacherSubject ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                                        }`}
                                        placeholder="Enter subject name" 
                                        required 
                                    />
                                    {formErrors.teacherSubject && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <FaExclamationTriangle className="mr-1" />
                                            {formErrors.teacherSubject}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Subject Suggestions */}
                                {subjectSuggestions.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 mb-2">📝 Common subjects for {selectedDepartment}:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {subjectSuggestions.slice(0, 8).map((subject) => (
                                                <button
                                                    key={subject}
                                                    type="button"
                                                    onClick={() => handleSubjectSelect(subject)}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                                                >
                                                    {subject}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rating Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FaStar className="mr-3 text-yellow-500" />
                            Faculty Evaluation
                        </h2>
                        
                        <div className="space-y-6">
                            {Object.keys(formData.ratings).map((key, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 capitalize mb-2">
                                                {key.replace(/([A-Z])/g, ' $1')}
                                            </h4>
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <FaInfoCircle className="mr-2 text-blue-500" />
                                                {ratingDescriptions[key]}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {formData.ratings[key]}/5
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {ratingLabels[formData.ratings[key]]}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">Poor</span>
                                        <input
                                            type="range"
                                            name={key}
                                            min="1"
                                            max="5"
                                            value={formData.ratings[key]}
                                            onChange={handleChange}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <span className="text-sm text-gray-600">Excellent</span>
                                    </div>
                                    
                                    <div className="flex justify-between mt-2">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => handleChange({target: {name: key, value: rating}})}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                                                    formData.ratings[key] === rating 
                                                        ? 'bg-purple-600 text-white' 
                                                        : 'bg-gray-200 text-gray-600 hover:bg-purple-100'
                                                }`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Overall Evaluation */}
                        <div className="mt-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Overall Evaluation</h3>
                                    <p className="text-sm text-gray-600">Automatically calculated from your ratings</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-purple-600">
                                        {formData.overallEvaluation}/5
                                    </div>
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <FaStar 
                                                key={star}
                                                className={`text-lg ${
                                                    star <= Math.round(formData.overallEvaluation) 
                                                        ? 'text-yellow-500' 
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FaComments className="mr-3 text-green-600" />
                            Suggestions & Comments
                        </h2>
                        
                        <div>
                            <label className="flex items-center text-gray-700 mb-2 font-medium">
                                💡 Your suggestions for improvement
                            </label>
                            <textarea 
                                name="suggestions" 
                                value={formData.suggestions} 
                                onChange={handleChange} 
                                rows="6"
                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                placeholder="Share your constructive feedback and suggestions to help improve the teaching quality..."
                            />
                            <p className="text-sm text-gray-600 mt-2">
                                💬 Your feedback helps faculty improve their teaching methods and creates a better learning environment.
                            </p>
                        </div>
                    </div>

                    {/* Preview & Submit Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Ready to Submit?</h3>
                                <p className="text-gray-600 mt-1">
                                    Review your feedback and submit your evaluation
                                </p>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    {showPreview ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
                                    {showPreview ? 'Hide Preview' : 'Preview'}
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            {isEditMode ? 'Updating...' : 'Submitting...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle className="mr-2" />
                                            {isEditMode ? 'Update Review' : 'Submit Review'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        {showPreview && (
                            <div className="mt-6 border-t pt-6">
                                <h4 className="font-semibold text-gray-800 mb-4">📋 Review Preview</h4>
                                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><strong>Student:</strong> {formData.studentName}</div>
                                        <div><strong>Admission No:</strong> {formData.admissionNo}</div>
                                        <div><strong>Faculty:</strong> {formData.teacherName}</div>
                                        <div><strong>Subject:</strong> {formData.teacherSubject}</div>
                                        <div><strong>Department:</strong> {formData.teacherDepartment}</div>
                                        <div><strong>Overall Rating:</strong> {formData.overallEvaluation}/5 ⭐</div>
                                    </div>
                                    {formData.suggestions && (
                                        <div>
                                            <strong>Suggestions:</strong>
                                            <p className="mt-1 text-gray-700">{formData.suggestions}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                <style jsx>{`
                    .slider::-webkit-slider-thumb {
                        appearance: none;
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: #7c3aed;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    
                    .slider::-moz-range-thumb {
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: #7c3aed;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                `}</style>
            </div>
        </div>
    </div>
    );
};

export default TeacherReviewForm;
