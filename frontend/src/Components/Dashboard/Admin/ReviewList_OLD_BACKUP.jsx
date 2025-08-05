import React, { useState, useMemo, useCallback } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaUser, 
  FaGraduationCap, 
  FaSort,
  FaChartBar,
  FaDownload,
  FaSearch,
  FaEyeSlash,
  FaComments,
  FaBookOpen,
  FaClock,
  FaThumbsUp,
  FaFilter,
  FaTimes,
  FaSchool,
  FaUsers,
  FaLayerGroup,
  FaUniversity,
  FaCode,
  FaBook,
  FaCalendar,
  FaCalendarAlt
} from 'react-icons/fa';
import './ReviewList.css';

const ReviewList = ({ 
  reviews, 
  onEdit, 
  onDelete, 
  searchTerm, 
  filterDepartment, 
  filterCourse, 
  filterSemester, 
  filterSection, 
  filterTeacher, 
  filterRating,
  filterBatch 
}) => {
  const [expandedReview, setExpandedReview] = useState(null);

  const toggleExpanded = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const toggleSelectReview = (reviewId) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === sortedAndFilteredReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(sortedAndFilteredReviews.map(r => r._id)));
    }
  };

  const exportSelectedReviews = () => {
    const selectedData = sortedAndFilteredReviews.filter(r => selectedReviews.has(r._id));
    const csv = [
      ['Teacher Name', 'Department', 'Subject', 'Student Name', 'Semester', 'Section', 'Rating', 'Date', 'Feedback'].join(','),
      ...selectedData.map(review => [
        review.teacherName,
        review.teacherDepartment,
        review.teacherSubject,
        review.studentName,
        extractSemester(review) || 'N/A',
        extractSection(review) || 'N/A',
        review.overallEvaluation,
        new Date(review.createdAt || review._id).toLocaleDateString(),
        `"${review.suggestions}"`
      ].join(','))
    ].join('\\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Basic extraction functions for backward compatibility
  const extractSemester = useCallback((review) => {
    // First try individual student fields from review
    if (review.studentSemester) return review.studentSemester.toString();
    if (review.semester) return review.semester.toString();
    
    // Then try branchSemester field
    if (!review.branchSemester) return '';
    
    // Try different patterns for semester extraction
    const patterns = [
      /(\d+)(st|nd|rd|th)?\s*Semester/i,
      /Semester\s*(\d+)/i,
      /-\s*(\d+)\s*Semester/i,
      /Sem\s*(\d+)/i,
      /-\s*(\d+)\s*-/,
      /\s(\d+)\s/,
      /(\d+)$/
    ];
    
    for (const pattern of patterns) {
      const match = review.branchSemester.match(pattern);
      if (match && match[1]) {
        return match[1].toString();
      }
    }
    
    return '';
  }, []);

  const extractSection = useCallback((review) => {
    // First try individual student fields from review
    if (review.studentSection) return review.studentSection.toString().toUpperCase();
    if (review.section) return review.section.toString().toUpperCase();
    
    // Then try branchSemester field
    if (!review.branchSemester) return '';
    
    // Enhanced patterns for section extraction including special sections
    const specialSectionPatterns = [
      /Super60/i,
      /Unique/i,
      /Special/i,
      /Elite/i,
      /Advanced/i,
      /Honors?/i,
      /Premium/i
    ];
    
    // Check for special sections first
    for (const pattern of specialSectionPatterns) {
      const match = review.branchSemester.match(pattern);
      if (match) {
        return match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
      }
    }
    
    // Try different patterns for regular section extraction (A, B, C, D, E)
    const patterns = [
      /Section\s*([A-E])/i,
      /-\s*Section\s*([A-E])/i,
      /-\s*([A-E])\s*$/i,
      /Sec\s*([A-E])/i,
      /-\s*([A-E])$/,
      /\s([A-E])\s*$/,
      /([A-E])$/
    ];
    
    for (const pattern of patterns) {
      const match = review.branchSemester.match(pattern);
      if (match && match[1] && /^[A-E]$/.test(match[1])) {
        return match[1].toUpperCase();
      }
    }
    
    return '';
  }, []);

  const extractBranch = useCallback((review) => {
    // First try individual field
    if (review.branch) return review.branch;
    
    // Then try branchSemester field
    if (!review.branchSemester) return '';
    
    // Extract the first part before the first dash
    const parts = review.branchSemester.split(' - ');
    return parts[0] || '';
  }, []);

  const extractCourse = useCallback((review) => {
    const branch = extractBranch(review);
    // Map branch to course abbreviation
    const courseMap = {
      'Computer Science Engineering': 'CSE',
      'Information Technology': 'IT',
      'Electronics & Communication': 'ECE',
      'Mechanical Engineering': 'ME',
      'Civil Engineering': 'CE',
      'Electrical Engineering': 'EE',
      'Chemical Engineering': 'CHE',
      'Biotechnology': 'BT'
    };
    return courseMap[branch] || branch;
  }, [extractBranch]);

  const extractSubject = useCallback((review) => {
    if (review.teacherSubject) return review.teacherSubject;
    if (review.subject) return review.subject;
    
    // Extract from comments if available
    const comments = review.comments || review.feedback || '';
    const subjectPatterns = [
      /subject[\s:]*([^.,\n]+)/i,
      /course[\s:]*([^.,\n]+)/i,
      /teaching[\s:]*([^.,\n]+)/i
    ];
    
    for (let pattern of subjectPatterns) {
      const match = comments.match(pattern);
      if (match) return match[1].trim();
    }
    return 'General';
  }, []);

  const extractBatch = useCallback((review) => {
    // Try to extract year from createdAt or _id
    const year = new Date(review.createdAt || review._id).getFullYear();
    return year.toString();
  }, []);

  // Enhanced helper functions to extract student academic info from review
  const getStudentDepartment = useCallback((review) => {
    return review.studentDepartment || review.department || extractBranch(review) || 'N/A';
  }, [extractBranch]);

  const getStudentSemester = useCallback((review) => {
    return review.studentSemester || review.semester || extractSemester(review) || 'N/A';
  }, [extractSemester]);

  const getStudentSection = useCallback((review) => {
    return review.studentSection || review.section || extractSection(review) || 'N/A';
  }, [extractSection]);

  const getStudentCourse = useCallback((review) => {
    return review.studentCourse || review.course || extractCourse(review) || 'N/A';
  }, [extractCourse]);

  // Get unique values for filters with enhanced extraction and validation
  const departments = [...new Set(reviews.map(r => r.teacherDepartment).filter(Boolean))].sort();
  const semesters = [...new Set(reviews.map(r => extractSemester(r) || r.studentSemester || r.semester).filter(sem => sem && /^\d+$/.test(sem.toString())))].sort((a, b) => parseInt(a) - parseInt(b));
  
  // Enhanced section extraction with better filtering
  const sections = [...new Set(reviews.map(r => {
    const section = extractSection(r) || r.studentSection || r.section;
    return section;
  }).filter(sec => {
    if (!sec) return false;
    // Accept regular sections A-E
    if (sec.toString().match(/^[A-E]$/)) return true;
    // Accept special sections (case insensitive check but preserve original case)
    const specialSections = ['Super60', 'Unique', 'Special', 'Elite', 'Advanced', 'Honor', 'Honours', 'Premium'];
    return specialSections.some(special => sec.toString().toLowerCase() === special.toLowerCase());
  }))].sort((a, b) => {
    // Sort regular sections (A, B, C, D, E) first, then special sections
    const isRegularA = a.toString().match(/^[A-E]$/);
    const isRegularB = b.toString().match(/^[A-E]$/);
    
    if (isRegularA && isRegularB) return a.localeCompare(b);
    if (isRegularA && !isRegularB) return -1;
    if (!isRegularA && isRegularB) return 1;
    return a.localeCompare(b);
  });
  
  const teachers = [...new Set(reviews.map(r => r.teacherName).filter(Boolean))].sort();
  const branches = [...new Set(reviews.map(r => extractBranch(r)).filter(Boolean))].sort();
  const courses = [...new Set(reviews.map(r => extractCourse(r)).filter(Boolean))].sort();
  const subjects = [...new Set(reviews.map(r => extractSubject(r)).filter(Boolean))].sort();

  // Add batch extraction (year-based)
  const batches = [...new Set(reviews.map(r => extractBatch(r)).filter(Boolean))].sort((a, b) => parseInt(b) - parseInt(a)); // Latest first

  // Test extraction with common formats (for debugging)
  React.useEffect(() => {
    if (reviews.length > 0) {
      const testFormats = [
        "Computer Science Engineering - 3 Semester - Section A",
        "Information Technology - 5th Semester - Section B", 
        "Electronics & Communication - 2nd Semester - Section C",
        "Mechanical Engineering - 7 Semester - Section D",
        "Civil Engineering - Semester 4 - Section E",
        "Computer Science Engineering - 3 Semester - Super60",
        "Information Technology - 5th Semester - Unique",
        "Electronics & Communication - 2nd Semester - Special",
        "Mechanical Engineering - 7 Semester - Elite",
        "Civil Engineering - 6 Semester - Advanced",
        "Computer Science Engineering - 1 Semester - Premium"
      ];
      
      console.log('Testing enhanced section extraction on common formats:');
      testFormats.forEach(format => {
        const testReview = { branchSemester: format };
        console.log(`Format: "${format}" -> Semester: "${extractSemester(testReview)}", Section: "${extractSection(testReview)}"`);
      });
      
      console.log('Actual review data extraction results:', {
        totalReviews: reviews.length,
        extractedSemesters: semesters,
        extractedSections: sections,
        sectionsDetails: sections.map(sec => ({
          section: sec,
          isRegular: sec.match(/^[A-E]$/),
          isSpecial: !sec.match(/^[A-E]$/),
          count: reviews.filter(r => extractSection(r) === sec).length
        })),
        firstFewReviews: reviews.slice(0, 5).map(r => ({
          branchSemester: r.branchSemester,
          semester: r.semester,
          section: r.section,
          extractedSemester: extractSemester(r),
          extractedSection: extractSection(r)
        }))
      });
    }
  }, [reviews, semesters, sections, extractSemester, extractSection]);

  // Debug logging for extracted data (only log first 2 samples to avoid spam)
  if (reviews.length > 0) {
    console.log('=== DYNAMIC SECTION FILTER DEBUG ===');
    console.log('Filter extraction results:', {
      totalReviews: reviews.length,
      extractedSemesters: semesters,
      extractedSections: sections,
      sectionBreakdown: {
        regularSections: sections.filter(sec => sec.match(/^[A-E]$/)),
        specialSections: sections.filter(sec => !sec.match(/^[A-E]$/)),
        totalUniqueSections: sections.length
      },
      sampleExtractions: reviews.slice(0, 3).map(r => ({
        branchSemester: r.branchSemester,
        individualSemester: r.semester,
        individualSection: r.section,
        extractedSemester: extractSemester(r),
        extractedSection: extractSection(r),
        isSpecialSection: extractSection(r) && !extractSection(r).match(/^[A-E]$/)
      }))
    });
    console.log('Available sections for dropdown:', sections);
    console.log('=====================================');
  }

  // Enhanced filtering and sorting
  const sortedAndFilteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.teacherName.toLowerCase().includes(term) ||
        review.studentName.toLowerCase().includes(term) ||
        review.teacherDepartment.toLowerCase().includes(term) ||
        review.teacherSubject.toLowerCase().includes(term) ||
        review.suggestions.toLowerCase().includes(term) ||
        review.admissionNo.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(review => review.teacherDepartment === filterDepartment);
    }

    // Semester filter with improved validation
    if (filterSemester !== 'all') {
      filtered = filtered.filter(review => {
        const semester = extractSemester(review) || review.studentSemester || review.semester;
        return semester && semester.toString() === filterSemester.toString();
      });
    }

    // Section filter with improved validation
    if (filterSection !== 'all') {
      filtered = filtered.filter(review => {
        const section = extractSection(review) || review.studentSection || review.section;
        return section && section.toString().toUpperCase() === filterSection.toString().toUpperCase();
      });
    }

    // Teacher filter
    if (filterTeacher !== 'all') {
      filtered = filtered.filter(review => review.teacherName === filterTeacher);
    }

    // Branch filter
    if (filterBranch !== 'all') {
      filtered = filtered.filter(review => {
        const branch = extractBranch(review);
        return branch === filterBranch;
      });
    }

    // Course filter
    if (filterCourse !== 'all') {
      filtered = filtered.filter(review => {
        const course = extractCourse(review);
        return course === filterCourse;
      });
    }

    // Subject filter
    if (filterSubject !== 'all') {
      filtered = filtered.filter(review => review.teacherSubject === filterSubject);
    }

    // Batch filter (year-based)
    if (filterBatch !== 'all') {
      filtered = filtered.filter(review => {
        const reviewYear = new Date(review.createdAt || review._id).getFullYear().toString();
        return reviewYear === filterBatch;
      });
    }

    // Rating filter
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      filtered = filtered.filter(review => {
        if (rating === 5) return review.overallEvaluation >= 4.5;
        if (rating === 4) return review.overallEvaluation >= 3.5 && review.overallEvaluation < 4.5;
        if (rating === 3) return review.overallEvaluation >= 2.5 && review.overallEvaluation < 3.5;
        if (rating === 2) return review.overallEvaluation >= 1.5 && review.overallEvaluation < 2.5;
        if (rating === 1) return review.overallEvaluation < 1.5;
        return true;
      });
    }

    // Sort reviews
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.overallEvaluation;
          bValue = b.overallEvaluation;
          break;
        case 'teacher':
          aValue = a.teacherName.toLowerCase();
          bValue = b.teacherName.toLowerCase();
          break;
        case 'student':
          aValue = a.studentName.toLowerCase();
          bValue = b.studentName.toLowerCase();
          break;
        case 'department':
          aValue = a.teacherDepartment.toLowerCase();
          bValue = b.teacherDepartment.toLowerCase();
          break;
        case 'semester':
          aValue = a.semester || extractSemester(a.branchSemester);
          bValue = b.semester || extractSemester(b.branchSemester);
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt || a._id);
          bValue = new Date(b.createdAt || b._id);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [reviews, sortBy, sortOrder, filterRating, searchTerm, filterDepartment, filterSemester, filterSection, filterTeacher, filterBranch, filterCourse, filterSubject, filterBatch, extractBranch, extractCourse, extractSemester, extractSection]);

  // Calculate enhanced statistics
  const statistics = useMemo(() => {
    if (reviews.length === 0) return { 
      average: 0, 
      total: 0, 
      distribution: {}, 
      departmentStats: {}, 
      semesterStats: {},
      sectionStats: {},
      teacherStats: {},
      branchStats: {},
      courseStats: {},
      subjectStats: {},
      batchStats: {}
    };

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.overallEvaluation, 0);
    const average = (sum / total).toFixed(1);
    
    const distribution = {
      5: reviews.filter(r => r.overallEvaluation >= 4.5).length,
      4: reviews.filter(r => r.overallEvaluation >= 3.5 && r.overallEvaluation < 4.5).length,
      3: reviews.filter(r => r.overallEvaluation >= 2.5 && r.overallEvaluation < 3.5).length,
      2: reviews.filter(r => r.overallEvaluation >= 1.5 && r.overallEvaluation < 2.5).length,
      1: reviews.filter(r => r.overallEvaluation < 1.5).length,
    };

    // Department-wise statistics
    const departmentStats = departments.reduce((acc, dept) => {
      const deptReviews = reviews.filter(r => r.teacherDepartment === dept);
      acc[dept] = {
        count: deptReviews.length,
        average: deptReviews.length > 0 ? (deptReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / deptReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Semester-wise statistics using enhanced extraction
    const semesterStats = semesters.reduce((acc, sem) => {
      const semReviews = reviews.filter(r => {
        const semester = extractSemester(r) || r.studentSemester || r.semester;
        return semester && semester.toString() === sem.toString();
      });
      acc[sem] = {
        count: semReviews.length,
        average: semReviews.length > 0 ? (semReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / semReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Section-wise statistics using enhanced extraction
    const sectionStats = sections.reduce((acc, section) => {
      const sectionReviews = reviews.filter(r => {
        const sec = extractSection(r) || r.studentSection || r.section;
        return sec && sec.toString() === section.toString();
      });
      acc[section] = {
        count: sectionReviews.length,
        average: sectionReviews.length > 0 ? (sectionReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / sectionReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Teacher-wise statistics
    const teacherStats = teachers.reduce((acc, teacher) => {
      const teacherReviews = reviews.filter(r => r.teacherName === teacher);
      acc[teacher] = {
        count: teacherReviews.length,
        average: teacherReviews.length > 0 ? (teacherReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / teacherReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Branch-wise statistics
    const branchStats = branches.reduce((acc, branch) => {
      const branchReviews = reviews.filter(r => extractBranch(r) === branch);
      acc[branch] = {
        count: branchReviews.length,
        average: branchReviews.length > 0 ? (branchReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / branchReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Course-wise statistics
    const courseStats = courses.reduce((acc, course) => {
      const courseReviews = reviews.filter(r => extractCourse(r) === course);
      acc[course] = {
        count: courseReviews.length,
        average: courseReviews.length > 0 ? (courseReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / courseReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Subject-wise statistics
    const subjectStats = subjects.reduce((acc, subject) => {
      const subjectReviews = reviews.filter(r => extractSubject(r) === subject);
      acc[subject] = {
        count: subjectReviews.length,
        average: subjectReviews.length > 0 ? (subjectReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / subjectReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Batch-wise statistics
    const batchStats = batches.reduce((acc, batch) => {
      const batchReviews = reviews.filter(r => extractBatch(r) === batch);
      acc[batch] = {
        count: batchReviews.length,
        average: batchReviews.length > 0 ? (batchReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / batchReviews.length).toFixed(1) : 0
      };
      return acc;
    }, {});

    return { average, total, distribution, departmentStats, semesterStats, sectionStats, teacherStats, branchStats, courseStats, subjectStats, batchStats };
  }, [reviews, departments, semesters, sections, teachers, branches, courses, subjects, batches, extractSemester, extractSection, extractBranch, extractCourse, extractSubject, extractBatch]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        />
      );
    }
    return stars;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterDepartment('all');
    setFilterSemester('all');
    setFilterSection('all');
    setFilterTeacher('all');
    setFilterRating('all');
    setFilterBranch('all');
    setFilterCourse('all');
    setFilterSubject('all');
    setFilterBatch('all');
  };

  if (reviews.length === 0) {
    return (
      <div className="review-list-container">
        <div className="empty-state">
          <div className="empty-icon">
            <FaStar />
          </div>
          <h3>No Reviews Found</h3>
          <p>No reviews have been submitted yet. Students can add reviews for faculty members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-list-container">
      {/* Enhanced Header Section */}
      <div className="list-header-section">
        <div className="header-main">
          <div className="header-left">
            <h2 className="page-title">
              <FaComments className="title-icon" />
              Student Reviews
            </h2>
            <div className="header-stats">
              <span className="total-count">{sortedAndFilteredReviews.length} of {reviews.length} reviews</span>
              <span className="avg-rating">
                <FaStar className="star-icon" />
                {statistics.average}/5 average
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            >
              <FaFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
              className="view-toggle-btn"
            >
              <FaLayerGroup />
              {viewMode === 'cards' ? 'List View' : 'Card View'}
            </button>
            {selectedReviews.size > 0 && (
              <button 
                onClick={exportSelectedReviews}
                className="export-btn"
              >
                <FaDownload />
                Export ({selectedReviews.size})
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FaComments />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.average}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <FaThumbsUp />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.distribution[5] + statistics.distribution[4]}</div>
              <div className="stat-label">Positive Reviews</div>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">
              <FaSchool />
            </div>
            <div className="stat-content">
              <div className="stat-value">{departments.length}</div>
              <div className="stat-label">Departments</div>
            </div>
          </div>

          <div className="stat-card accent">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <div className="stat-value">{teachers.length}</div>
              <div className="stat-label">Teachers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>
              <FaFilter />
              Advanced Filters
            </h3>
            <button onClick={clearAllFilters} className="clear-filters-btn">
              <FaTimes />
              Clear All
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search reviews by teacher, student, department, subject, admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-search-btn"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Filter Grid */}
          <div className="filter-grid">
            <div className="filter-group">
              <label>
                <FaSchool />
                Department
              </label>
              <select 
                value={filterDepartment} 
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept} ({statistics.departmentStats[dept]?.count || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaGraduationCap />
                Semester
                {semesters.length > 0 && <span className="filter-count">({semesters.length} available)</span>}
              </label>
              <select 
                value={filterSemester} 
                onChange={(e) => setFilterSemester(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Semesters ({reviews.length} total)</option>
                {semesters.length > 0 ? semesters.map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem} ({statistics.semesterStats[sem]?.count || 0} reviews)
                  </option>
                )) : (
                  <option disabled>No semesters found in data</option>
                )}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaLayerGroup />
                Section
                {sections.length > 0 && <span className="filter-count">({sections.length} available)</span>}
              </label>
              <select 
                value={filterSection} 
                onChange={(e) => setFilterSection(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Sections ({reviews.length} total)</option>
                {sections.length > 0 ? (
                  <>
                    {/* Regular Sections (A-E) */}
                    {sections.filter(sec => sec.match(/^[A-E]$/)).map(section => (
                      <option 
                        key={section} 
                        value={section}
                        className="regular-section-option"
                      >
                        Section {section} ({statistics.sectionStats[section]?.count || 0} reviews)
                      </option>
                    ))}
                    
                    {/* Special Sections */}
                    {sections.filter(sec => !sec.match(/^[A-E]$/)).length > 0 && (
                      <optgroup label="Special Sections">
                        {sections.filter(sec => !sec.match(/^[A-E]$/)).map(section => (
                          <option 
                            key={section} 
                            value={section}
                            className="special-section-option"
                          >
                            {section} ({statistics.sectionStats[section]?.count || 0} reviews)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                ) : (
                  <option disabled>No sections found in data</option>
                )}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaUser />
                Teacher
              </label>
              <select 
                value={filterTeacher} 
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher} value={teacher}>
                    {teacher} ({statistics.teacherStats[teacher]?.count || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaUniversity />
                Branch
                {branches.length > 0 && <span className="filter-count">({branches.length} available)</span>}
              </label>
              <select 
                value={filterBranch} 
                onChange={(e) => setFilterBranch(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Branches ({reviews.length} total)</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>
                    {branch} ({reviews.filter(r => extractBranch(r) === branch).length} reviews)
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaCode />
                Course
                {courses.length > 0 && <span className="filter-count">({courses.length} available)</span>}
              </label>
              <select 
                value={filterCourse} 
                onChange={(e) => setFilterCourse(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Courses ({reviews.length} total)</option>
                {courses.map(course => (
                  <option key={course} value={course}>
                    {course} ({reviews.filter(r => extractCourse(r) === course).length} reviews)
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaBook />
                Subject
                {subjects.length > 0 && <span className="filter-count">({subjects.length} available)</span>}
              </label>
              <select 
                value={filterSubject} 
                onChange={(e) => setFilterSubject(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Subjects ({reviews.length} total)</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject} ({reviews.filter(r => extractSubject(r) === subject).length} reviews)
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaCalendar />
                Batch/Year
                {batches.length > 0 && <span className="filter-count">({batches.length} available)</span>}
              </label>
              <select 
                value={filterBatch} 
                onChange={(e) => setFilterBatch(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Years ({reviews.length} total)</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>
                    {batch} ({reviews.filter(r => extractBatch(r) === batch).length} reviews)
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaStar />
                Rating
              </label>
              <select 
                value={filterRating} 
                onChange={(e) => setFilterRating(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="5">★★★★★ Excellent (4.5+)</option>
                <option value="4">★★★★☆ Good (3.5-4.4)</option>
                <option value="3">★★★☆☆ Average (2.5-3.4)</option>
                <option value="2">★★☆☆☆ Below Average (1.5-2.4)</option>
                <option value="1">★☆☆☆☆ Poor (Below 1.5)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaSort />
                Sort By
              </label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Date Added</option>
                <option value="rating">Rating</option>
                <option value="teacher">Teacher Name</option>
                <option value="student">Student Name</option>
                <option value="department">Department</option>
                <option value="semester">Semester</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div className="filter-group bulk-actions">
              <label className="bulk-select">
                <input
                  type="checkbox"
                  checked={selectedReviews.size === sortedAndFilteredReviews.length && sortedAndFilteredReviews.length > 0}
                  onChange={toggleSelectAll}
                />
                Select All ({sortedAndFilteredReviews.length})
              </label>
              {selectedReviews.size > 0 && (
                <span className="selected-info">
                  {selectedReviews.size} selected
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Container */}
      <div className={`reviews-container ${viewMode}-view`}>
        {sortedAndFilteredReviews.map((review) => (
          <div key={review._id} className="review-card">
            {/* Card Header */}
            <div className="card-header">
              <div className="card-select">
                <input
                  type="checkbox"
                  checked={selectedReviews.has(review._id)}
                  onChange={() => toggleSelectReview(review._id)}
                />
              </div>
              
              <div className="teacher-info">
                <div className="teacher-avatar">
                  {review.teacherName.charAt(0).toUpperCase()}
                </div>
                <div className="teacher-details">
                  <h3 className="teacher-name">{review.teacherName}</h3>
                  <p className="teacher-meta">
                    <FaSchool /> {review.teacherDepartment}
                  </p>
                  <p className="teacher-subject">
                    <FaBookOpen /> {review.teacherSubject}
                  </p>
                </div>
              </div>

              <div className="rating-display">
                <div className="rating-stars">
                  {renderStars(review.overallEvaluation)}
                </div>
                <div className="rating-value">{review.overallEvaluation.toFixed(1)}</div>
                <div className="rating-label">
                  {review.overallEvaluation >= 4.5 ? 'Excellent' :
                   review.overallEvaluation >= 3.5 ? 'Good' :
                   review.overallEvaluation >= 2.5 ? 'Average' :
                   review.overallEvaluation >= 1.5 ? 'Below Average' : 'Poor'}
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => toggleExpanded(review._id)}
                  className="action-btn view-btn"
                  title={expandedReview === review._id ? "Hide details" : "View details"}
                >
                  {expandedReview === review._id ? <FaEyeSlash /> : <FaEye />}
                </button>
                <button
                  onClick={() => onEdit(review)}
                  className="action-btn edit-btn"
                  title="Edit review"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(review._id)}
                  className="action-btn delete-btn"
                  title="Delete review"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* Card Meta */}
            <div className="card-meta">
              <div className="student-info">
                <FaUser className="meta-icon" />
                <span className="student-name">{review.studentName}</span>
                <span className="admission-no">({review.admissionNo})</span>
              </div>
              
              <div className="academic-info">
                <div className="academic-row">
                  <span className="department">
                    <FaSchool className="meta-icon" />
                    {getStudentDepartment(review)}
                  </span>
                  <span className="semester">
                    <FaGraduationCap className="meta-icon" />
                    {getStudentSemester(review)} - {getStudentSection(review)}
                  </span>
                </div>
                <div className="academic-row">
                  <span className="course">
                    <FaBookOpen className="meta-icon" />
                    {getStudentCourse(review)}
                  </span>
                  <span className="batch">
                    <FaCalendarAlt className="meta-icon" />
                    Batch {extractBatch(review)}
                  </span>
                </div>
              </div>
              
              <div className="review-date">
                <FaClock className="meta-icon" />
                <span>{new Date(review.createdAt || review._id).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedReview === review._id && (
              <div className="card-expanded">
                {/* Detailed Ratings */}
                {review.ratings && Object.keys(review.ratings).length > 0 && (
                  <div className="detailed-ratings">
                    <h4>
                      <FaChartBar />
                      Detailed Ratings
                    </h4>
                    <div className="ratings-grid">
                      {Object.entries(review.ratings).map(([key, value]) => (
                        <div key={key} className="rating-item">
                          <span className="rating-category">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <div className="rating-stars-small">
                            {renderStars(value)}
                          </div>
                          <span className="rating-num">{value}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Student Feedback */}
                <div className="feedback-section">
                  <h4>
                    <FaComments />
                    Student Feedback
                  </h4>
                  <div className="feedback-content">
                    <p>{review.suggestions}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                {review.adminNotes && (
                  <div className="admin-notes">
                    <h4>Admin Notes</h4>
                    <p>{review.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* No Results */}
        {sortedAndFilteredReviews.length === 0 && (searchTerm || filterDepartment !== 'all' || filterSemester !== 'all' || filterSection !== 'all' || filterTeacher !== 'all' || filterRating !== 'all') && (
          <div className="no-results">
            <FaSearch className="no-results-icon" />
            <h3>No matching reviews found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button onClick={clearAllFilters} className="clear-all-btn">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
