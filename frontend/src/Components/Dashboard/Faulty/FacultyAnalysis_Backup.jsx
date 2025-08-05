import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';
import { 
  FaChartBar, 
  FaChartPie, 
  FaChartLine, 
  FaArrowLeft, 
  FaStar, 
  FaUsers, 
  FaTrophy,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

const FacultyAnalysis = () => {
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  const [showStudentNames, setShowStudentNames] = useState(false);
  const [analysisData, setAnalysisData] = useState({});

  useEffect(() => {
    const fetchFacultyReviews = async (name, department) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/review/faculty/${encodeURIComponent(name)}/${encodeURIComponent(department)}`);
        setReviews(response.data);
        processAnalysisData(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    const storedFacultyInfo = localStorage.getItem('facultyInfo');
    if (storedFacultyInfo) {
      const faculty = JSON.parse(storedFacultyInfo);
      setFacultyInfo(faculty);
      fetchFacultyReviews(faculty.name, faculty.department);
    }
  }, []);

  const processAnalysisData = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      setAnalysisData({
        averageRatings: {},
        ratingDistribution: {},
        performanceMetrics: {},
        totalReviews: 0
      });
      return;
    }

    const ratingCategories = [
      'conceptExplanation',
      'subjectKnowledge', 
      'contentOrganization',
      'classTiming',
      'learningEnvironment',
      'studentParticipation',
      'feedbackQuality',
      'resourceUtilization',
      'innovation',
      'accessibility',
      'supportiveness',
      'professionalism'
    ];

    // Calculate average ratings for each category
    const averageRatings = {};
    ratingCategories.forEach(category => {
      const total = reviewsData.reduce((sum, review) => {
        return sum + (review.ratings && review.ratings[category] ? review.ratings[category] : 0);
      }, 0);
      averageRatings[category] = reviewsData.length > 0 ? (total / reviewsData.length).toFixed(2) : 0;
    });

    // Calculate overall performance metrics
    const overallRatings = reviewsData.map(review => review.overallEvaluation || 0);
    const averageOverall = overallRatings.length > 0 ? 
      (overallRatings.reduce((sum, rating) => sum + rating, 0) / overallRatings.length).toFixed(2) : 0;

    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    overallRatings.forEach(rating => {
      const roundedRating = Math.round(rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        ratingDistribution[roundedRating]++;
      }
    });

    setAnalysisData({
      averageRatings,
      ratingDistribution,
      performanceMetrics: {
        averageOverall,
        totalReviews: reviewsData.length,
        excellentCount: overallRatings.filter(r => r >= 4).length,
        goodCount: overallRatings.filter(r => r >= 3 && r < 4).length,
        averageCount: overallRatings.filter(r => r >= 2 && r < 3).length,
        poorCount: overallRatings.filter(r => r < 2).length
      },
      totalReviews: reviewsData.length
    });
  };
      'classTiming',
      'learningEnvironment',
      'studentParticipation',
      'feedbackQuality',
      'resourceUtilization',
      'innovation',
      'accessibility',
      'supportiveness',
      'professionalism'
    ];

    const categoryLabels = {
      conceptExplanation: 'Concept Explanation',
      subjectKnowledge: 'Subject Knowledge',
      contentOrganization: 'Content Organization',
      classTiming: 'Class Timing',
      learningEnvironment: 'Learning Environment',
      studentParticipation: 'Student Participation',
      feedbackQuality: 'Feedback Quality',
      resourceUtilization: 'Resource Utilization',
      innovation: 'Innovation',
      accessibility: 'Accessibility',
      supportiveness: 'Supportiveness',
      professionalism: 'Professionalism'
    };

    // Calculate average ratings for each category
    const categoryAverages = {};
    ratingCategories.forEach(category => {
      const total = reviewsData.reduce((sum, review) => sum + (review.ratings[category] || 0), 0);
      categoryAverages[category] = total / reviewsData.length;
    });

    // Overall evaluation trend over time
    const monthlyData = {};
    reviewsData.forEach(review => {
      const month = new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += review.overallEvaluation;
      monthlyData[month].count += 1;
    });

    const monthlyAverages = Object.keys(monthlyData).map(month => ({
      month,
      average: monthlyData[month].total / monthlyData[month].count
    }));

    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsData.forEach(review => {
      const avgRating = Math.round(review.overallEvaluation);
      if (ratingDistribution[avgRating] !== undefined) {
        ratingDistribution[avgRating]++;
      }
    });

    setAnalysisData({
      categoryAverages,
      categoryLabels,
      monthlyAverages,
      ratingDistribution,
      totalReviews: reviewsData.length,
      overallAverage: reviewsData.reduce((sum, review) => sum + review.overallEvaluation, 0) / reviewsData.length
    });
  };

  const getBarChartData = () => {
    if (!analysisData.averageRatings || Object.keys(analysisData.averageRatings).length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Average Rating',
          data: [0],
          backgroundColor: ['rgba(200, 200, 200, 0.8)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 2
        }]
      };
    }

    const categoryLabels = {
      'conceptExplanation': 'Concept Explanation',
      'subjectKnowledge': 'Subject Knowledge',
      'contentOrganization': 'Content Organization',
      'classTiming': 'Class Timing',
      'learningEnvironment': 'Learning Environment',
      'studentParticipation': 'Student Participation',
      'feedbackQuality': 'Feedback Quality',
      'resourceUtilization': 'Resource Utilization',
      'innovation': 'Innovation',
      'accessibility': 'Accessibility',
      'supportiveness': 'Supportiveness',
      'professionalism': 'Professionalism'
    };

    return {
      labels: Object.keys(analysisData.averageRatings).map(key => categoryLabels[key] || key),
      datasets: [{
        label: 'Average Rating',
        data: Object.values(analysisData.averageRatings),
        backgroundColor: [
          'rgba(139, 69, 19, 0.8)',   // conceptExplanation - Brown
          'rgba(255, 99, 132, 0.8)',  // subjectKnowledge - Red
          'rgba(54, 162, 235, 0.8)',  // contentOrganization - Blue
          'rgba(255, 206, 86, 0.8)',  // classTiming - Yellow
          'rgba(75, 192, 192, 0.8)',  // learningEnvironment - Teal
          'rgba(153, 102, 255, 0.8)', // studentParticipation - Purple
          'rgba(255, 159, 64, 0.8)',  // feedbackQuality - Orange
          'rgba(199, 199, 199, 0.8)', // resourceUtilization - Gray
          'rgba(83, 102, 255, 0.8)',  // innovation - Indigo
          'rgba(255, 99, 255, 0.8)',  // accessibility - Magenta
          'rgba(132, 255, 99, 0.8)',  // supportiveness - Light Green
          'rgba(255, 132, 99, 0.8)'   // professionalism - Coral
        ],
        borderColor: [
          'rgba(139, 69, 19, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(255, 99, 255, 1)',
          'rgba(132, 255, 99, 1)',
          'rgba(255, 132, 99, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const getPieChartData = () => {
    if (!analysisData.ratingDistribution || Object.keys(analysisData.ratingDistribution).length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(200, 200, 200, 0.8)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 2
        }]
      };
    }

    return {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [{
        data: Object.values(analysisData.ratingDistribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 2
      }]
    };
  };
      datasets: [{
        data: Object.values(analysisData.ratingDistribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const getLineChartData = () => {
    if (!analysisData.averageRatings || Object.keys(analysisData.averageRatings).length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Data Available',
          data: [0],
          borderColor: 'rgba(200, 200, 200, 1)',
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          tension: 0.1,
          fill: true
        }]
      };
    }

    // Create a simple line chart based on categories for now
    const categoryLabels = {
      'conceptExplanation': 'Concept Explanation',
      'subjectKnowledge': 'Subject Knowledge',
      'contentOrganization': 'Content Organization',
      'classTiming': 'Class Timing',
      'learningEnvironment': 'Learning Environment',
      'studentParticipation': 'Student Participation',
      'feedbackQuality': 'Feedback Quality',
      'resourceUtilization': 'Resource Utilization',
      'innovation': 'Innovation',
      'accessibility': 'Accessibility',
      'supportiveness': 'Supportiveness',
      'professionalism': 'Professionalism'
    };

    return {
      labels: Object.keys(analysisData.averageRatings).map(key => categoryLabels[key] || key),
      datasets: [{
        label: 'Category Performance',
        data: Object.values(analysisData.averageRatings),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      }]
    };
  };

  const getRadarChartData = () => {
    if (!analysisData.averageRatings || Object.keys(analysisData.averageRatings).length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Data Available',
          data: [0],
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          pointBackgroundColor: 'rgba(200, 200, 200, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(200, 200, 200, 1)'
        }]
      };
    }

    const categoryLabels = {
      'conceptExplanation': 'Concept Explanation',
      'subjectKnowledge': 'Subject Knowledge',
      'contentOrganization': 'Content Organization',
      'classTiming': 'Class Timing',
      'learningEnvironment': 'Learning Environment',
      'studentParticipation': 'Student Participation',
      'feedbackQuality': 'Feedback Quality',
      'resourceUtilization': 'Resource Utilization',
      'innovation': 'Innovation',
      'accessibility': 'Accessibility',
      'supportiveness': 'Supportiveness',
      'professionalism': 'Professionalism'
    };

    return {
      labels: Object.keys(analysisData.averageRatings).map(key => categoryLabels[key] || key),
      datasets: [{
        label: 'Performance Radar',
        data: Object.values(analysisData.averageRatings),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(153, 102, 255, 1)'
      }]
    };
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
        text: `Faculty Performance Analysis - ${facultyInfo?.name || 'Faculty'}`
      }
    },
    scales: chartType === 'bar' || chartType === 'line' ? {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    } : {}
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Performance Radar - ${facultyInfo?.name || 'Faculty'}`
      }
    },
    scales: {
      r: {
        angleLines: {
          display: false
        },
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              to="/facultydash" 
              className="mr-4 p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <FaArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Faculty Performance Analysis</h1>
              <p className="text-gray-600">{facultyInfo?.name} - {facultyInfo?.department}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowStudentNames(!showStudentNames)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showStudentNames 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {showStudentNames ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
              {showStudentNames ? 'Hide' : 'Show'} Student Names
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-800">{analysisData.totalReviews || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FaStar className="text-2xl text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Overall Average</p>
              <p className="text-2xl font-bold text-gray-800">
                {analysisData.performanceMetrics && analysisData.performanceMetrics.averageOverall 
                  ? parseFloat(analysisData.performanceMetrics.averageOverall).toFixed(2) 
                  : '0.00'}/5
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaTrophy className="text-2xl text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Highest Category</p>
              <p className="text-sm font-bold text-gray-800">
                {analysisData.averageRatings && Object.keys(analysisData.averageRatings).length > 0
                  ? Object.keys(analysisData.averageRatings).reduce((a, b) => 
                      analysisData.averageRatings[a] > analysisData.averageRatings[b] ? a : b
                    ).replace(/([A-Z])/g, ' $1').trim()
                  : 'No data'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaCalendarAlt className="text-2xl text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Latest Review</p>
              <p className="text-sm font-bold text-gray-800">
                {reviews.length > 0 
                  ? new Date(reviews[0].createdAt).toLocaleDateString()
                  : 'No reviews'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              chartType === 'bar' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChartBar className="mr-2" />
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              chartType === 'pie' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChartPie className="mr-2" />
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              chartType === 'line' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChartLine className="mr-2" />
            Trend Line
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              chartType === 'radar' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChartPie className="mr-2" />
            Radar Chart
          </button>
        </div>
      </div>

      {/* Chart Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-96">
            {!loading && (
              <>
                {chartType === 'bar' && <Bar data={getBarChartData()} options={chartOptions} />}
                {chartType === 'pie' && <Pie data={getPieChartData()} options={chartOptions} />}
                {chartType === 'line' && <Line data={getLineChartData()} options={chartOptions} />}
                {chartType === 'radar' && <Radar data={getRadarChartData()} options={radarOptions} />}
              </>
            )}
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <p className="ml-3 text-gray-600">Loading chart data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Category Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analysisData.averageRatings && Object.keys(analysisData.averageRatings).length > 0 ? (
              Object.entries(analysisData.averageRatings).map(([key, value]) => {
                const categoryLabels = {
                  'conceptExplanation': 'Concept Explanation',
                  'subjectKnowledge': 'Subject Knowledge',
                  'contentOrganization': 'Content Organization',
                  'classTiming': 'Class Timing',
                  'learningEnvironment': 'Learning Environment',
                  'studentParticipation': 'Student Participation',
                  'feedbackQuality': 'Feedback Quality',
                  'resourceUtilization': 'Resource Utilization',
                  'innovation': 'Innovation',
                  'accessibility': 'Accessibility',
                  'supportiveness': 'Supportiveness',
                  'professionalism': 'Professionalism'
                };
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{categoryLabels[key] || key}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(parseFloat(value) / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{parseFloat(value).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anonymous Reviews List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {showStudentNames ? 'Detailed Reviews' : 'Anonymous Reviews'}
          </h3>
          <span className="text-sm text-gray-600">{reviews.length} total reviews</span>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews && reviews.length > 0 ? (
            reviews.map((review, index) => {
              const ratingsValues = review.ratings ? Object.values(review.ratings) : [];
              const avgRating = ratingsValues.length > 0 
                ? ratingsValues.reduce((sum, rating) => sum + (rating || 0), 0) / ratingsValues.length 
                : 0;
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {showStudentNames ? (review.studentName || 'Unknown Student') : `Anonymous Review #${index + 1}`}
                      </h4>
                      {showStudentNames && (
                        <p className="text-sm text-gray-600">
                          {review.admissionNo || 'No Admission No'} • {review.branchSemester || 'No Branch Info'}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Subject: {review.teacherSubject || 'Not specified'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className="font-semibold">{avgRating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                  </div>
                  
                  {review.suggestions && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Feedback:</span> {review.suggestions}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <FaStar className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No reviews available for this faculty member</p>
            </div>
          )}
        </div>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {review.suggestions && (
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Suggestions:</strong> {review.suggestions}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FacultyAnalysis;
