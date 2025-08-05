import React, { useState, useEffect } from 'react';
import { 
  FaFileAlt, 
  FaDownload, 
  FaCalendarAlt, 
  FaFilter, 
  FaChartBar,
  FaTable,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaEye,
  FaShare,
  FaClock,
  FaUsers,
  FaStar,
  FaGraduationCap,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

const ReportsCenter = ({ data, onExportReport, onScheduleReport, onShareReport }) => {
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [generatedReports, setGeneratedReports] = useState([]);
  const [reportData, setReportData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateReportData();
  }, [selectedReportType, dateRange, selectedDepartment, selectedFaculty, data]);

  const reportTypes = [
    { id: 'overview', name: 'System Overview', icon: FaChartBar },
    { id: 'faculty', name: 'Faculty Performance', icon: FaChalkboardTeacher },
    { id: 'student', name: 'Student Engagement', icon: FaGraduationCap },
    { id: 'department', name: 'Department Analysis', icon: FaUsers },
    { id: 'ratings', name: 'Rating Analytics', icon: FaStar },
    { id: 'trends', name: 'Trend Analysis', icon: FaTable },
    { id: 'comparative', name: 'Comparative Report', icon: FaFileAlt },
    { id: 'detailed', name: 'Detailed Review Report', icon: FaFilePdf }
  ];

  const generateReportData = () => {
    if (!data.reviews || !data.faculty || !data.students) return;

    const filteredReviews = filterReviewsByDateAndDepartment();
    
    const reportDataMap = {
      overview: generateOverviewData(filteredReviews),
      faculty: generateFacultyData(filteredReviews),
      student: generateStudentData(filteredReviews),
      department: generateDepartmentData(filteredReviews),
      ratings: generateRatingData(filteredReviews),
      trends: generateTrendsData(filteredReviews),
      comparative: generateComparativeData(filteredReviews),
      detailed: generateDetailedData(filteredReviews)
    };

    setReportData(reportDataMap);
  };

  const filterReviewsByDateAndDepartment = () => {
    let filtered = [...data.reviews];

    // Date filter
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    filtered = filtered.filter(review => {
      const reviewDate = new Date(review.createdAt);
      return reviewDate >= startDate && reviewDate <= endDate;
    });

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(review => review.teacherDepartment === selectedDepartment);
    }

    // Faculty filter
    if (selectedFaculty !== 'all') {
      filtered = filtered.filter(review => review.teacherName === selectedFaculty);
    }

    return filtered;
  };

  const generateOverviewData = (reviews) => {
    const totalReviews = reviews.length;
    const avgRating = reviews.length ? 
      (reviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / reviews.length).toFixed(2) : 0;
    const uniqueStudents = new Set(reviews.map(r => r.admissionNo)).size;
    const uniqueFaculty = new Set(reviews.map(r => r.teacherName)).size;

    const monthlyData = getMonthlyTrends(reviews);
    const departmentData = getDepartmentBreakdown(reviews);

    return {
      stats: {
        totalReviews,
        avgRating,
        uniqueStudents,
        uniqueFaculty
      },
      charts: {
        monthlyTrend: {
          labels: monthlyData.labels,
          datasets: [{
            label: 'Reviews',
            data: monthlyData.counts,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          }]
        },
        departmentBreakdown: {
          labels: departmentData.labels,
          datasets: [{
            data: departmentData.counts,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ]
          }]
        }
      }
    };
  };

  const generateFacultyData = (reviews) => {
    const facultyStats = {};
    
    reviews.forEach(review => {
      const faculty = review.teacherName;
      if (!facultyStats[faculty]) {
        facultyStats[faculty] = {
          name: faculty,
          department: review.teacherDepartment,
          reviews: [],
          totalRating: 0,
          reviewCount: 0
        };
      }
      
      facultyStats[faculty].reviews.push(review);
      facultyStats[faculty].totalRating += review.overallEvaluation;
      facultyStats[faculty].reviewCount++;
    });

    const facultyArray = Object.values(facultyStats).map(faculty => ({
      ...faculty,
      avgRating: (faculty.totalRating / faculty.reviewCount).toFixed(2),
      ratingBreakdown: {
        teaching: (faculty.reviews.reduce((sum, r) => sum + (r.teachingEffectiveness || 0), 0) / faculty.reviewCount).toFixed(2),
        communication: (faculty.reviews.reduce((sum, r) => sum + (r.communicationSkills || 0), 0) / faculty.reviewCount).toFixed(2),
        knowledge: (faculty.reviews.reduce((sum, r) => sum + (r.subjectKnowledge || 0), 0) / faculty.reviewCount).toFixed(2)
      }
    })).sort((a, b) => b.avgRating - a.avgRating);

    return {
      facultyList: facultyArray,
      topPerformers: facultyArray.slice(0, 10),
      chartData: {
        labels: facultyArray.slice(0, 10).map(f => f.name.split(' ').slice(0, 2).join(' ')),
        datasets: [{
          label: 'Average Rating',
          data: facultyArray.slice(0, 10).map(f => f.avgRating),
          backgroundColor: 'rgba(54, 162, 235, 0.8)'
        }]
      }
    };
  };

  const generateStudentData = (reviews) => {
    const studentStats = {};
    
    reviews.forEach(review => {
      const student = review.admissionNo;
      if (!studentStats[student]) {
        studentStats[student] = {
          admissionNo: student,
          name: review.studentName || 'Unknown',
          department: review.studentDepartment || 'Unknown',
          reviewCount: 0,
          reviewsGiven: []
        };
      }
      
      studentStats[student].reviewCount++;
      studentStats[student].reviewsGiven.push(review);
    });

    const studentArray = Object.values(studentStats)
      .sort((a, b) => b.reviewCount - a.reviewCount);

    const engagementData = getStudentEngagementTrends(reviews);

    return {
      studentList: studentArray,
      mostActive: studentArray.slice(0, 20),
      engagementTrends: engagementData,
      chartData: {
        labels: engagementData.labels,
        datasets: [{
          label: 'Active Students',
          data: engagementData.counts,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        }]
      }
    };
  };

  const generateDepartmentData = (reviews) => {
    const departmentStats = {};
    
    reviews.forEach(review => {
      const dept = review.teacherDepartment;
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          name: dept,
          reviews: [],
          totalRating: 0,
          facultyCount: new Set(),
          studentCount: new Set()
        };
      }
      
      departmentStats[dept].reviews.push(review);
      departmentStats[dept].totalRating += review.overallEvaluation;
      departmentStats[dept].facultyCount.add(review.teacherName);
      departmentStats[dept].studentCount.add(review.admissionNo);
    });

    const departmentArray = Object.values(departmentStats).map(dept => ({
      ...dept,
      avgRating: (dept.totalRating / dept.reviews.length).toFixed(2),
      reviewCount: dept.reviews.length,
      facultyCount: dept.facultyCount.size,
      studentCount: dept.studentCount.size
    })).sort((a, b) => b.avgRating - a.avgRating);

    return {
      departmentList: departmentArray,
      chartData: {
        labels: departmentArray.map(d => d.name),
        datasets: [
          {
            label: 'Average Rating',
            data: departmentArray.map(d => d.avgRating),
            backgroundColor: 'rgba(75, 192, 192, 0.8)'
          },
          {
            label: 'Review Count',
            data: departmentArray.map(d => d.reviewCount),
            backgroundColor: 'rgba(255, 159, 64, 0.8)',
            yAxisID: 'y1'
          }
        ]
      }
    };
  };

  const generateRatingData = (reviews) => {
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const aspectRatings = {
      teachingEffectiveness: 0,
      communicationSkills: 0,
      subjectKnowledge: 0,
      accessibility: 0,
      fairness: 0
    };

    reviews.forEach(review => {
      const overallRating = Math.floor(review.overallEvaluation);
      ratingDistribution[overallRating] = (ratingDistribution[overallRating] || 0) + 1;
      
      Object.keys(aspectRatings).forEach(aspect => {
        if (review[aspect]) {
          aspectRatings[aspect] += review[aspect];
        }
      });
    });

    Object.keys(aspectRatings).forEach(aspect => {
      aspectRatings[aspect] = (aspectRatings[aspect] / reviews.length).toFixed(2);
    });

    return {
      distribution: ratingDistribution,
      aspects: aspectRatings,
      distributionChart: {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [{
          data: Object.values(ratingDistribution),
          backgroundColor: ['#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb']
        }]
      },
      aspectChart: {
        labels: Object.keys(aspectRatings).map(key => 
          key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        ),
        datasets: [{
          label: 'Average Rating',
          data: Object.values(aspectRatings),
          backgroundColor: 'rgba(153, 102, 255, 0.8)'
        }]
      }
    };
  };

  const generateTrendsData = (reviews) => {
    const monthlyTrends = getMonthlyTrends(reviews);
    const weeklyTrends = getWeeklyTrends(reviews);
    const dailyTrends = getDailyTrends(reviews);

    return {
      monthly: monthlyTrends,
      weekly: weeklyTrends,
      daily: dailyTrends,
      trendChart: {
        labels: monthlyTrends.labels,
        datasets: [
          {
            label: 'Reviews',
            data: monthlyTrends.counts,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
          {
            label: 'Avg Rating',
            data: monthlyTrends.avgRatings,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            yAxisID: 'y1'
          }
        ]
      }
    };
  };

  const generateComparativeData = (reviews) => {
    const currentPeriod = reviews;
    const previousPeriodStart = new Date(dateRange.start);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 
      (new Date(dateRange.end) - new Date(dateRange.start)) / (24 * 60 * 60 * 1000));
    
    const previousPeriodReviews = data.reviews.filter(review => {
      const reviewDate = new Date(review.createdAt);
      return reviewDate >= previousPeriodStart && reviewDate < new Date(dateRange.start);
    });

    const comparison = {
      current: {
        reviewCount: currentPeriod.length,
        avgRating: currentPeriod.length ? 
          (currentPeriod.reduce((sum, r) => sum + r.overallEvaluation, 0) / currentPeriod.length).toFixed(2) : 0,
        uniqueStudents: new Set(currentPeriod.map(r => r.admissionNo)).size,
        uniqueFaculty: new Set(currentPeriod.map(r => r.teacherName)).size
      },
      previous: {
        reviewCount: previousPeriodReviews.length,
        avgRating: previousPeriodReviews.length ? 
          (previousPeriodReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / previousPeriodReviews.length).toFixed(2) : 0,
        uniqueStudents: new Set(previousPeriodReviews.map(r => r.admissionNo)).size,
        uniqueFaculty: new Set(previousPeriodReviews.map(r => r.teacherName)).size
      }
    };

    return {
      comparison,
      chartData: {
        labels: ['Review Count', 'Avg Rating', 'Active Students', 'Active Faculty'],
        datasets: [
          {
            label: 'Current Period',
            data: [
              comparison.current.reviewCount,
              comparison.current.avgRating * 20, // Scale for visualization
              comparison.current.uniqueStudents,
              comparison.current.uniqueFaculty
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.8)'
          },
          {
            label: 'Previous Period',
            data: [
              comparison.previous.reviewCount,
              comparison.previous.avgRating * 20,
              comparison.previous.uniqueStudents,
              comparison.previous.uniqueFaculty
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.8)'
          }
        ]
      }
    };
  };

  const generateDetailedData = (reviews) => {
    return {
      reviewList: reviews.map(review => ({
        ...review,
        createdAt: new Date(review.createdAt).toLocaleDateString(),
        overallEvaluation: review.overallEvaluation.toFixed(1)
      })),
      summary: {
        totalReviews: reviews.length,
        avgRating: reviews.length ? 
          (reviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / reviews.length).toFixed(2) : 0,
        dateRange: `${dateRange.start} to ${dateRange.end}`,
        department: selectedDepartment === 'all' ? 'All Departments' : selectedDepartment,
        faculty: selectedFaculty === 'all' ? 'All Faculty' : selectedFaculty
      }
    };
  };

  // Helper functions
  const getMonthlyTrends = (reviews) => {
    const monthly = {};
    reviews.forEach(review => {
      const month = new Date(review.createdAt).toLocaleDateString('en', {month: 'short', year: '2-digit'});
      if (!monthly[month]) {
        monthly[month] = { count: 0, totalRating: 0 };
      }
      monthly[month].count++;
      monthly[month].totalRating += review.overallEvaluation;
    });

    return {
      labels: Object.keys(monthly),
      counts: Object.values(monthly).map(m => m.count),
      avgRatings: Object.values(monthly).map(m => (m.totalRating / m.count).toFixed(2))
    };
  };

  const getWeeklyTrends = (reviews) => {
    // Similar implementation for weekly trends
    return { labels: [], counts: [], avgRatings: [] };
  };

  const getDailyTrends = (reviews) => {
    // Similar implementation for daily trends
    return { labels: [], counts: [], avgRatings: [] };
  };

  const getDepartmentBreakdown = (reviews) => {
    const departments = {};
    reviews.forEach(review => {
      const dept = review.teacherDepartment;
      departments[dept] = (departments[dept] || 0) + 1;
    });

    return {
      labels: Object.keys(departments),
      counts: Object.values(departments)
    };
  };

  const getStudentEngagementTrends = (reviews) => {
    const monthly = {};
    reviews.forEach(review => {
      const month = new Date(review.createdAt).toLocaleDateString('en', {month: 'short'});
      if (!monthly[month]) monthly[month] = new Set();
      monthly[month].add(review.admissionNo);
    });

    return {
      labels: Object.keys(monthly),
      counts: Object.values(monthly).map(set => set.size)
    };
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await onExportReport(selectedReportType, reportFormat, {
        dateRange,
        department: selectedDepartment,
        faculty: selectedFaculty,
        data: reportData[selectedReportType]
      });
      
      // Add to generated reports list
      const newReport = {
        id: Date.now(),
        type: selectedReportType,
        format: reportFormat,
        generatedAt: new Date().toISOString(),
        parameters: {
          dateRange,
          department: selectedDepartment,
          faculty: selectedFaculty
        }
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const departments = [...new Set(data.faculty?.map(f => f.department) || [])];
  const facultyList = selectedDepartment === 'all' ? 
    data.faculty || [] : 
    (data.faculty || []).filter(f => f.department === selectedDepartment);

  return (
    <div className="reports-center">
      {/* Header */}
      <div className="reports-header">
        <h2>Reports Center</h2>
        <div className="header-actions">
          <button 
            className="btn-primary" 
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? <FaClock /> : <FaDownload />}
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="report-config">
        <div className="config-section">
          <h3>Report Type</h3>
          <div className="report-type-grid">
            {reportTypes.map(type => (
              <button
                key={type.id}
                className={`report-type-btn ${selectedReportType === type.id ? 'active' : ''}`}
                onClick={() => setSelectedReportType(type.id)}
              >
                <type.icon />
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h3>Filters & Parameters</h3>
          <div className="config-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date Range</label>
                <div className="date-range">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select 
                  value={selectedDepartment} 
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Faculty</label>
                <select 
                  value={selectedFaculty} 
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                >
                  <option value="all">All Faculty</option>
                  {facultyList.map(faculty => (
                    <option key={faculty._id} value={faculty.name}>{faculty.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Format</label>
                <div className="format-options">
                  <button 
                    className={reportFormat === 'pdf' ? 'active' : ''}
                    onClick={() => setReportFormat('pdf')}
                  >
                    <FaFilePdf /> PDF
                  </button>
                  <button 
                    className={reportFormat === 'excel' ? 'active' : ''}
                    onClick={() => setReportFormat('excel')}
                  >
                    <FaFileExcel /> Excel
                  </button>
                  <button 
                    className={reportFormat === 'csv' ? 'active' : ''}
                    onClick={() => setReportFormat('csv')}
                  >
                    <FaFileCsv /> CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="report-preview">
        <h3>Report Preview</h3>
        {reportData[selectedReportType] && (
          <ReportPreview 
            type={selectedReportType} 
            data={reportData[selectedReportType]} 
          />
        )}
      </div>

      {/* Generated Reports History */}
      <div className="reports-history">
        <h3>Recent Reports</h3>
        <div className="reports-list">
          {generatedReports.length > 0 ? (
            generatedReports.map(report => (
              <div key={report.id} className="report-item">
                <div className="report-info">
                  <h4>{reportTypes.find(t => t.id === report.type)?.name}</h4>
                  <p>Generated: {new Date(report.generatedAt).toLocaleString()}</p>
                  <p>Format: {report.format.toUpperCase()}</p>
                </div>
                <div className="report-actions">
                  <button onClick={() => onShareReport(report.id)}>
                    <FaShare /> Share
                  </button>
                  <button onClick={() => onExportReport(report.type, report.format, report.parameters)}>
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No reports generated yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Report Preview Component
const ReportPreview = ({ type, data }) => {
  const renderPreview = () => {
    switch(type) {
      case 'overview':
        return (
          <div className="overview-preview">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Reviews</h4>
                <p>{data.stats?.totalReviews || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Average Rating</h4>
                <p>{data.stats?.avgRating || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Active Students</h4>
                <p>{data.stats?.uniqueStudents || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Active Faculty</h4>
                <p>{data.stats?.uniqueFaculty || 0}</p>
              </div>
            </div>
            {data.charts?.monthlyTrend && (
              <div className="preview-chart">
                <Line data={data.charts.monthlyTrend} options={{responsive: true, maintainAspectRatio: false}} />
              </div>
            )}
          </div>
        );
      
      case 'faculty':
        return (
          <div className="faculty-preview">
            {data.chartData && (
              <div className="preview-chart">
                <Bar data={data.chartData} options={{responsive: true, maintainAspectRatio: false}} />
              </div>
            )}
            <div className="top-faculty">
              <h4>Top Performers</h4>
              {data.topPerformers?.slice(0, 5).map((faculty, index) => (
                <div key={index} className="faculty-item">
                  <span>{faculty.name}</span>
                  <span>{faculty.avgRating} ⭐</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return <div>Report preview will be generated based on selected parameters.</div>;
    }
  };

  return (
    <div className="report-preview-content">
      {renderPreview()}
    </div>
  );
};

export default ReportsCenter;
