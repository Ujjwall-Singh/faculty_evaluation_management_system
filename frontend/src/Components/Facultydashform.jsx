import React from "react";

const Facultydashform = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex w-4/5 h-3/5 bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Form Fields */}
        <div className="w-1/2 flex flex-col justify-center px-10">
          <label className="text-lg font-semibold mb-2">Faculty Name</label>
          <div className="w-full h-10 bg-gray-300 rounded-lg mb-4"></div>

          <label className="text-lg font-semibold mb-2">Department</label>
          <div className="w-full h-10 bg-gray-300 rounded-lg mb-4"></div>

          <label className="text-lg font-semibold mb-2">Semester</label>
          <div className="w-full h-10 bg-gray-300 rounded-lg mb-6"></div>

          <button className="w-32 h-10 bg-purple-600 rounded-full text-white font-semibold">
            Submit
          </button>
        </div>

        {/* Right Side - Illustration */}
        <div className="w-1/2 bg-purple-600 flex items-center justify-center relative">
          <div className="w-4/5 h-4/5">
            <img
              src="/faculty-illustration.png"
              alt="Illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facultydashform;
