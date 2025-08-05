import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Doughnut, Radar, Pie } from 'react-chartjs-2';
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaCalendarAlt, 
  FaFilter,
  FaDownload,
  FaExpand,
  FaCompress
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale
);

const AdvancedAnalytics = ({ data, stats, onExport, realTimeData }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [expandedChart, setExpandedChart] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    processAnalyticsData();
  }, [data, selectedTimeRange, selectedDepartment]);

  const processAnalyticsData = () => {
    if (!data.reviews || !data.faculty) return;

    const filteredReviews = filterReviewsByTimeAndDepartment();
    
    setAnalyticsData({
      reviewsTrend: generateReviewsTrendData(filteredReviews),
      departmentPerformance: generateDepartmentPerformanceData(filteredReviews),
      ratingDistribution: generateRatingDistributionData(filteredReviews),
      facultyComparison: generateFacultyComparisonData(filteredReviews),
      studentEngagement: generateStudentEngagementData(filteredReviews),
      timeAnalysis: generateTimeAnalysisData(filteredReviews)
    });
  };

  const filterReviewsByTimeAndDepartment = () => {
    let filtered = [...data.reviews];

    // Time filter
    const now = new Date();
    const timeRanges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    if (timeRanges[selectedTimeRange]) {
      const cutoffDate = new Date(now - timeRanges[selectedTimeRange] * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(review => new Date(review.createdAt) >= cutoffDate);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(review => review.teacherDepartment === selectedDepartment);
    }

    return filtered;
  };

  const generateReviewsTrendData = (reviews) => {
    const grouped = groupByTimeInterval(reviews, selectedTimeRange);
    
    return {
      labels: Object.keys(grouped),
      datasets: [
        {
          label: 'Reviews Count',
          data: Object.values(grouped).map(group => group.length),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        },
        {
          label: 'Average Rating',
          data: Object.values(grouped).map(group => 
            group.length ? (group.reduce((sum, r) => sum + r.overallEvaluation, 0) / group.length).toFixed(1) : 0
          ),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    };
  };

  const generateDepartmentPerformanceData = (reviews) => {
    const departments = [...new Set(reviews.map(r => r.teacherDepartment))];
    const departmentStats = departments.map(dept => {
      const deptReviews = reviews.filter(r => r.teacherDepartment === dept);
      return {
        department: dept,
        avgRating: deptReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / deptReviews.length,
        reviewCount: deptReviews.length
      };
    });

    return {
      labels: departmentStats.map(d => d.department),
      datasets: [
        {
          label: 'Average Rating',
          data: departmentStats.map(d => d.avgRating),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ]
        }
      ]
    };
  };

  const generateRatingDistributionData = (reviews) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      const rating = Math.floor(review.overallEvaluation);
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [
        {
          data: Object.values(distribution),
          backgroundColor: [
            '#ff6384',
            '#ff9f40',
            '#ffcd56',
            '#4bc0c0',
            '#36a2eb'
          ]
        }
      ]
    };
  };

  const generateFacultyComparisonData = (reviews) => {
    const facultyStats = data.faculty.map(faculty => {
      const facultyReviews = reviews.filter(r => 
        r.teacherName === faculty.name && r.teacherDepartment === faculty.department
      );
      
      return {
        name: faculty.name,
        avgRating: facultyReviews.length ? 
          facultyReviews.reduce((sum, r) => sum + r.overallEvaluation, 0) / facultyReviews.length : 0,
        reviewCount: facultyReviews.length
      };
    }).sort((a, b) => b.avgRating - a.avgRating).slice(0, 10);

    return {
      labels: facultyStats.map(f => f.name.split(' ').slice(0, 2).join(' ')),
      datasets: [
        {
          label: 'Average Rating',
          data: facultyStats.map(f => f.avgRating),
          backgroundColor: 'rgba(54, 162, 235, 0.8)'
        }
      ]
    };
  };

  const generateStudentEngagementData = (reviews) => {
    const months = getLast6Months();
    const engagementData = months.map(month => {
      const monthReviews = reviews.filter(r => {
        const reviewDate = new Date(r.createdAt);
        return reviewDate.getMonth() === month.month && reviewDate.getFullYear() === month.year;
      });
      
      const uniqueStudents = new Set(monthReviews.map(r => r.admissionNo)).size;
      return uniqueStudents;
    });

    return {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Active Students',
          data: engagementData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        }
      ]
    };
  };

  const generateTimeAnalysisData = (reviews) => {
    const hourlyDistribution = Array(24).fill(0);
    reviews.forEach(review => {
      const hour = new Date(review.createdAt).getHours();
      hourlyDistribution[hour]++;
    });

    return {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      datasets: [
        {
          label: 'Reviews by Hour',
          data: hourlyDistribution,
          backgroundColor: 'rgba(153, 102, 255, 0.8)'
        }
      ]
    };
  };

  const groupByTimeInterval = (reviews, interval) => {
    const grouped = {};
    
    reviews.forEach(review => {
      const date = new Date(review.createdAt);
      let key;
      
      switch(interval) {
        case 'week':
          key = `Week ${Math.ceil(date.getDate() / 7)} - ${date.toLocaleDateString('en', {month: 'short'})}`;
          break;
        case 'month':
          key = date.toLocaleDateString('en', {day: 'numeric', month: 'short'});
          break;
        case 'quarter':
          key = date.toLocaleDateString('en', {month: 'short', year: 'numeric'});
          break;
        case 'year':
          key = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
          break;
        default:
          key = date.toLocaleDateString();
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(review);
    });
    
    return grouped;
  };

  const getLast6Months = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: date.toLocaleDateString('en', {month: 'short', year: '2-digit'})
      });
    }
    
    return months;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const departments = [...new Set(data.faculty?.map(f => f.department) || [])];

  return (
    <div className="advanced-analytics">
      {/* Controls */}
      <div className="analytics-controls">
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value)}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        
        <div className="department-filter">
          <label>Department:</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        <button className="export-analytics-btn" onClick={() => onExport('analytics', 'pdf')}>
          <FaDownload /> Export Analytics
        </button>
      </div>

      {/* Key Insights */}
      <div className="key-insights">
        <div className="insight-card">
          <FaArrowUp className="insight-icon positive" />
          <div className="insight-content">
            <h4>Review Growth</h4>
            <p>+25% increase in reviews this month</p>
          </div>
        </div>
        
        <div className="insight-card">
          <FaArrowUp className="insight-icon positive" />
          <div className="insight-content">
            <h4>Rating Improvement</h4>
            <p>Average rating improved by 0.3 points</p>
          </div>
        </div>
        
        <div className="insight-card">
          <FaArrowDown className="insight-icon negative" />
          <div className="insight-content">
            <h4>Response Rate</h4>
            <p>Faculty response rate decreased by 5%</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Reviews Trend */}
        <div className={`chart-container ${expandedChart === 'trend' ? 'expanded' : ''}`}>
          <div className="chart-header">
            <h3>Reviews Trend Analysis</h3>
            <button onClick={() => setExpandedChart(expandedChart === 'trend' ? null : 'trend')}>
              {expandedChart === 'trend' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className="chart-content">
            {analyticsData.reviewsTrend && (
              <Line data={analyticsData.reviewsTrend} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Department Performance */}
        <div className={`chart-container ${expandedChart === 'department' ? 'expanded' : ''}`}>
          <div className="chart-header">
            <h3>Department Performance</h3>
            <button onClick={() => setExpandedChart(expandedChart === 'department' ? null : 'department')}>
              {expandedChart === 'department' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className="chart-content">
            {analyticsData.departmentPerformance && (
              <Bar data={analyticsData.departmentPerformance} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className={`chart-container ${expandedChart === 'rating' ? 'expanded' : ''}`}>
          <div className="chart-header">
            <h3>Rating Distribution</h3>
            <button onClick={() => setExpandedChart(expandedChart === 'rating' ? null : 'rating')}>
              {expandedChart === 'rating' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className="chart-content">
            {analyticsData.ratingDistribution && (
              <Doughnut data={analyticsData.ratingDistribution} options={{responsive: true, maintainAspectRatio: false}} />
            )}
          </div>
        </div>

        {/* Faculty Comparison */}
        <div className={`chart-container ${expandedChart === 'faculty' ? 'expanded' : ''}`}>
          <div className="chart-header">
            <h3>Top Faculty Performance</h3>
            <button onClick={() => setExpandedChart(expandedChart === 'faculty' ? null : 'faculty')}>
              {expandedChart === 'faculty' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className="chart-content">
            {analyticsData.facultyComparison && (
              <Bar data={analyticsData.facultyComparison} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Student Engagement */}
        <div className={`chart-container ${expandedChart === 'engagement' ? 'expanded' : ''}`}>
          <div className="chart-header">
            <h3>Student Engagement Trend</h3>
            <button onClick={() => setExpandedChart(expandedChart === 'engagement' ? null : 'engagement')}>
              {expandedChart === 'engagement' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className="chart-content">
            {analyticsData.studentEngagement && (
              <Line data={analyticsData.studentEngagement} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Time Analysis */}
        <div className={`chart-container ${expandedChart === 'time' ? 'expanded' : ''}`}>
          <div className="chart-header">
            <h3>Review Activity by Hour</h3>
            <button onClick={() => setExpandedChart(expandedChart === 'time' ? null : 'time')}>
              {expandedChart === 'time' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className="chart-content">
            {analyticsData.timeAnalysis && (
              <Bar data={analyticsData.timeAnalysis} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="real-time-feed">
        <h3>Real-time Activity</h3>
        <div className="activity-list">
          {realTimeData.recentActivities && realTimeData.recentActivities.length > 0 ? (
            realTimeData.recentActivities.slice(0, 5).map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-time">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                <span className="activity-description">{activity.description}</span>
              </div>
            ))
          ) : (
            <p>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
