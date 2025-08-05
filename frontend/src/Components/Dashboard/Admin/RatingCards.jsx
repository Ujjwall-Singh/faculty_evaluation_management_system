import React from "react";
import { Link } from "react-router-dom";

const RatingCards = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Student Review Card */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <img
            src="https://i.pinimg.com/736x/79/a1/bb/79a1bb0767ecbeb4a3d8157455c14d2c.jpg"
            alt="Student Review GIF"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-purple-500">
              Student Review
            </h2>
            <p className="mt-2 text-gray-600">
              Ratings and feedback given by students.
            </p>
            <Link to='/studentdashform'>
            <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              View in Details
            </button></Link>
          </div>
        </div>

        {/* Teacher Review Card */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <img
            src="https://i.pinimg.com/736x/17/11/10/171110a944b6b9b069719f6d6d6a845e.jpg"
            alt="Teacher Review GIF"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-purple-500">
              Teacher Review
            </h2>
            <p className="mt-2 text-gray-600">
              Ratings and feedback given by teachers.
            </p>
            <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              View in Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingCards;
