import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from '../config/api';

const FacultyForm = () => {
  const [teacherName, setTeacherName] = useState("");
  const [teacherDepartment, setTeacherDepartment] = useState("");
  const [branchSemester, setBranchSemester] = useState("");
  const [reviewData, setReviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averageRatings, setAverageRatings] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/review/filter`, {
        teacherName,
        teacherDepartment,
        branchSemester,
      });
      setReviewData(response.data);

      // Calculate average ratings
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

      response.data.forEach((review) => {
        Object.keys(ratings).forEach((key) => {
          ratings[key] += review.ratings[key] || 0;
        });
      });

      Object.keys(ratings).forEach((key) => {
        ratings[key] = (ratings[key] / response.data.length).toFixed(2);
      });

      setAverageRatings(ratings);
    } catch (error) {
      console.error("Error fetching review data:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6">
      <div className="w-4/5 h-auto bg-white rounded-lg shadow-lg overflow-hidden p-6">
        {/* Form Fields */}
        <div className="flex flex-col mb-6">
          <label className="text-sm font-medium mb-1">Faculty Name</label>
          <input
            type="text"
            className="w-full h-9 bg-gray-200 rounded-lg mb-3 px-3 text-sm"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
          />

          <label className="text-sm font-medium mb-1">Department</label>
          <input
            type="text"
            className="w-full h-9 bg-gray-200 rounded-lg mb-3 px-3 text-sm"
            value={teacherDepartment}
            onChange={(e) => setTeacherDepartment(e.target.value)}
          />

          <label className="text-sm font-medium mb-1">Semester</label>
          <input
            type="text"
            className="w-full h-9 bg-gray-200 rounded-lg mb-3 px-3 text-sm"
            value={branchSemester}
            onChange={(e) => setBranchSemester(e.target.value)}
          />

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-4 p-2 bg-purple-600 text-white rounded-lg"
          >
            Fetch Reviews
          </button>
        </div>

        {/* Table for displaying reviews */}
        <div className="mt-6">
          {loading ? (
            <div>Loading...</div>
          ) : reviewData.length > 0 ? (
            <>
              <table className="table-auto w-full mt-4 border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">Student Name</th>
                    <th className="px-4 py-2">Suggestions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewData.map((review, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{review.studentName}</td>
                      <td className="px-4 py-2">{review.suggestions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Ratings Table */}
              <table className="w-full mt-6 border-collapse">
                <thead className="bg-purple-500 text-white">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Average Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {averageRatings ? (
                    Object.entries(averageRatings).map(([category, rating], index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-purple-50" : "bg-white"}>
                        <td className="border border-gray-300 px-4 py-2">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{rating} ⭐</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center text-gray-500">
                        No ratings available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <div>No reviews found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyForm;
