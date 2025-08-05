import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ReviewTable = () => {
    const [averageRatings, setAverageRatings] = useState(null);

    useEffect(() => {
        // Fetch the data from the backend
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/review`);
                const reviews = response.data;

                // Calculate average rating for each category
                const ratings = {
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
                    Object.keys(ratings).forEach(key => {
                        ratings[key] += review.ratings[key] || 0;
                    });
                });

                Object.keys(ratings).forEach(key => {
                    ratings[key] = (ratings[key] / reviews.length).toFixed(2);
                });

                setAverageRatings(ratings);
            } catch (error) {
                console.error("Error fetching review data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="w-full lg:w-4/5 mx-auto p-4 md:p-8">
            <h2 className="text-center text-xl md:text-2xl lg:text-3xl font-semibold mb-6">Teacher Review Analysis</h2>
            {averageRatings ? (
                <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-purple-500 text-white">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Average Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(averageRatings).map(([category, rating], index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                                <td className="border border-gray-300 px-4 py-2">
                                    {category.replace(/([A-Z])/g, ' $1').trim()}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{rating}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-500">Loading data...</p>
            )}
        </div>
    );
};

export default ReviewTable;
