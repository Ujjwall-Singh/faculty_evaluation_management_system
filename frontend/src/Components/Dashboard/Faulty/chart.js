// src/components/ReviewPieChart.js

import React, { useEffect, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { 
    Chart, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement, 
    Title 
} from 'chart.js';
import { FaChartPie, FaChartBar, FaChartLine, FaStar, FaUsers, FaCalendar, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Register necessary components for the charts
Chart.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement, 
    Title
);

const ReviewChart = () => {
    const [chartData, setChartData] = useState(null);
    const [facultyInfo, setFacultyInfo] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [chartType, setChartType] = useState('pie');
    const [allFacultyData, setAllFacultyData] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        totalFaculty: 0
    });

    useEffect(() => {
        // Get user info from localStorage
        const adminInfo = localStorage.getItem('adminInfo');
        const facultyInfo = localStorage.getItem('facultyInfo');
        
        if (adminInfo) {
            setUserRole('Admin');
            setFacultyInfo(JSON.parse(adminInfo));
        } else if (facultyInfo) {
            setUserRole('Faculty');
            setFacultyInfo(JSON.parse(facultyInfo));
        }

        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            let reviews = [];
            let facultyList = [];

            if (userRole === 'Admin') {
                // Admin can see all reviews and faculty
                const [reviewsResponse, facultyResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/review`),
                    axios.get(`${API_BASE_URL}/api/faculty`)
                ]);
                reviews = reviewsResponse.data;
                facultyList = facultyResponse.data;
                setAllFacultyData(facultyList);
            } else if (userRole === 'Faculty' && facultyInfo) {
                // Faculty can only see their own reviews
                const response = await axios.get(
                    `${API_BASE_URL}/api/review/faculty/${encodeURIComponent(facultyInfo.name)}/${encodeURIComponent(facultyInfo.department)}`
                );
                reviews = response.data;
            }

            if (reviews.length === 0) {
                setLoading(false);
                return;
            }

            // Calculate statistics
            const totalReviews = reviews.length;
            const totalFaculty = userRole === 'Admin' ? facultyList.length : 1;
            
            let averageRating = 0;
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => {
                    const reviewAvg = Object.values(review.ratings).reduce((a, b) => a + b, 0) / 12;
                    return sum + reviewAvg;
                }, 0);
                averageRating = totalRating / reviews.length;
            }

            setStats({
                totalReviews,
                averageRating: averageRating.toFixed(2),
                totalFaculty
            });

            // Process reviews for chart
            processChartData(reviews);

        } catch (error) {
            console.error("Error fetching review data", error);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (reviews) => {
        if (!reviews || reviews.length === 0) {
            setChartData(null);
            return;
        }

        // Calculate average rating for each category
        const averageRatings = {
            conceptExplanation: 0,
            subjectKnowledge: 0,
            contentOrganization: 0,
            classTiming: 0,
            learningEnvironment: 0,
            studentParticipation: 0,
            feedbackQuality: 0,
            resourceUtilization: 0,
            innovation: 0,
            accessibility: 0,
            supportiveness: 0,
            professionalism: 0,
        };

        reviews.forEach(review => {
            if (review.ratings) {
                Object.keys(averageRatings).forEach(key => {
                    averageRatings[key] += review.ratings[key] || 0;
                });
            }
        });

        Object.keys(averageRatings).forEach(key => {
            averageRatings[key] = reviews.length > 0 ? averageRatings[key] / reviews.length : 0;
        });

        const labels = Object.keys(averageRatings).map(key => 
            key.replace(/([A-Z])/g, ' $1').trim()
        );

        const colors = [
            '#8B5CF6', '#A855F7', '#C084FC', '#D946EF', '#EC4899',
            '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6B7280',
            '#8B5CF6', '#A855F7'
        ];

        setChartData({
            labels,
            datasets: [
                {
                    label: 'Average Ratings',
                    data: Object.values(averageRatings),
                    backgroundColor: colors,
                    hoverBackgroundColor: colors.map(color => color + 'CC'),
                    borderColor: colors,
                    borderWidth: 2
                }
            ]
        });
    };

    const handleFacultyChange = async (facultyName) => {
        if (facultyName === 'all') {
            fetchData();
            return;
        }

        try {
            const faculty = allFacultyData.find(f => f.name === facultyName);
            if (faculty) {
                const response = await axios.get(
                    `${API_BASE_URL}/api/review/faculty/${encodeURIComponent(faculty.name)}/${encodeURIComponent(faculty.department)}`
                );
                processChartData(response.data);
                setStats({
                    totalReviews: response.data.length,
                    averageRating: response.data.length > 0 ? 
                        (response.data.reduce((sum, review) => {
                            const reviewAvg = Object.values(review.ratings).reduce((a, b) => a + b, 0) / 12;
                            return sum + reviewAvg;
                        }, 0) / response.data.length).toFixed(2) : '0',
                    totalFaculty: 1
                });
            }
        } catch (error) {
            console.error("Error fetching faculty-specific data", error);
        }
    };

    const renderChart = () => {
        if (!chartData) return null;

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: `${userRole === 'Admin' ? 'All Faculty' : facultyInfo?.name}'s Review Analysis`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        };

        switch (chartType) {
            case 'pie':
                return (
                    <div className="h-96">
                        <Pie
                            data={chartData}
                            options={commonOptions}
                        />
                    </div>
                );
            case 'bar':
                return (
                    <div className="h-96">
                        <Bar
                            data={chartData}
                            options={{
                                ...commonOptions,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 5,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                );
            case 'line':
                return (
                    <div className="h-96">
                        <Line
                            data={chartData}
                            options={{
                                ...commonOptions,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 5,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="w-full lg:w-4/5 mx-auto p-4 md:p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                        <span className="ml-3 text-purple-600">Loading chart data...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="w-full lg:w-4/5 mx-auto p-4 md:p-8">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link 
                            to={userRole === 'Admin' ? '/admindashboard' : '/facultydash'}
                            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Dashboard
                        </Link>
                    </div>
                    <h2 className="text-center text-2xl md:text-3xl font-bold text-purple-700 mb-2">
                        Review Analysis Dashboard
                    </h2>
                    {userRole === 'Faculty' && facultyInfo && (
                        <p className="text-center text-lg text-gray-600">
                            Faculty: <span className="font-semibold">{facultyInfo.name}</span> | 
                            Department: <span className="font-semibold">{facultyInfo.department}</span>
                        </p>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
                        <div className="flex items-center">
                            <FaUsers className="text-2xl mr-3" />
                            <div>
                                <p className="text-sm opacity-90">Total Reviews</p>
                                <p className="text-2xl font-bold">{stats.totalReviews}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
                        <div className="flex items-center">
                            <FaStar className="text-2xl mr-3" />
                            <div>
                                <p className="text-sm opacity-90">Average Rating</p>
                                <p className="text-2xl font-bold">{stats.averageRating}/5</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
                        <div className="flex items-center">
                            <FaCalendar className="text-2xl mr-3" />
                            <div>
                                <p className="text-sm opacity-90">Total Faculty</p>
                                <p className="text-2xl font-bold">{stats.totalFaculty}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Controls */}
                {userRole === 'Admin' && (
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-lg">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Faculty
                                </label>
                                <select
                                    value={selectedFaculty}
                                    onChange={(e) => {
                                        setSelectedFaculty(e.target.value);
                                        handleFacultyChange(e.target.value);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">All Faculty</option>
                                    {allFacultyData.map((faculty, index) => (
                                        <option key={index} value={faculty.name}>
                                            {faculty.name} - {faculty.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart Type Selector */}
                <div className="mb-6 flex justify-center">
                    <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-lg">
                        <button
                            onClick={() => setChartType('pie')}
                            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                                chartType === 'pie' 
                                    ? 'bg-purple-500 text-white' 
                                    : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FaChartPie />
                            <span>Pie</span>
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                                chartType === 'bar' 
                                    ? 'bg-purple-500 text-white' 
                                    : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FaChartBar />
                            <span>Bar</span>
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                                chartType === 'line' 
                                    ? 'bg-purple-500 text-white' 
                                    : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FaChartLine />
                            <span>Line</span>
                        </button>
                    </div>
                </div>

                {/* Chart */}
                <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
                    {renderChart()}
                </div>

                {/* Detailed Table */}
                {chartData && (
                    <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Detailed Ratings</h3>
                        <table className="w-full border-collapse border border-purple-300 rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-purple-500 text-white">
                                    <th className="border border-purple-300 px-4 py-3 text-left">Rating Category</th>
                                    <th className="border border-purple-300 px-4 py-3 text-center">Average Rating</th>
                                    <th className="border border-purple-300 px-4 py-3 text-center">Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.labels.map((label, index) => {
                                    const rating = chartData.datasets[0].data[index];
                                    const performance = rating >= 4 ? 'Excellent' : 
                                                      rating >= 3 ? 'Good' : 
                                                      rating >= 2 ? 'Average' : 'Needs Improvement';
                                    const performanceColor = rating >= 4 ? 'text-green-600' : 
                                                           rating >= 3 ? 'text-blue-600' : 
                                                           rating >= 2 ? 'text-yellow-600' : 'text-red-600';
                                    
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border border-purple-300 px-4 py-3 font-medium">
                                                {label}
                                            </td>
                                            <td className="border border-purple-300 px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-semibold">{rating.toFixed(2)}</span>
                                                    <FaStar className="ml-1 text-yellow-400" />
                                                </div>
                                            </td>
                                            <td className={`border border-purple-300 px-4 py-3 text-center font-medium ${performanceColor}`}>
                                                {performance}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* No Data Message */}
                {!loading && (!chartData || chartData.datasets[0].data.every(d => d === 0)) && (
                    <div className="text-center py-8 bg-white rounded-lg shadow-lg">
                        <FaChartPie className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {userRole === 'Admin' ? 'No review data available for selected faculty.' : 'No reviews available yet.'}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            {userRole === 'Faculty' ? 'Reviews will appear here once students submit them.' : 'Select a faculty member to view their reviews.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewChart;
