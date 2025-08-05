import React from "react";

const UserProfile = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-purple-500 text-white flex items-center justify-center text-2xl font-bold">
            U
          </div>
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">John Doe</h1>
          <p className="text-gray-600">johndoe@example.com</p>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Username:</span>
            <span className="text-gray-800">john_doe</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role:</span>
            <span className="text-gray-800">Admin</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Joined:</span>
            <span className="text-gray-800">Jan 2025</span>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
