import React from 'react';
import landing from "../Assets/landing.png";
import logo from "../Assets/logo.png";

function HomePage() {
  return (
    <div>
      {/* Navbar Section */}
      <div className="mx-auto max-w-screen-xl px-6 lg:px-8 relative pt-3">
        <div className="relative flex h-16 space-x-10 w-full">
          <div className="flex justify-start">
            <a className="flex flex-shrink-0 items-center" href="/">
              <img
                className="block h-14 w-auto"
                src={logo}
                alt="Logo"
              />
            </a>
          </div>
          <div className="flex-shrink-0 flex px-2 py-3 items-center space-x-8 flex-1 justify-end">
            <a
              className="text-gray-700 hover:text-purple-500 text-sm font-medium"
              href="/login"
            >
              Login
            </a>
            <a
              className="text-white bg-purple-500 hover:bg-purple-800 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm"
              href="/signup"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>

      {/* Background Image Section (below navbar) */}
      <div
        className="relative"
        style={{
          backgroundImage: `url(${landing})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',// Adjust this height as needed
        }}
      >
        <div className="max-w-7xl mx-auto relative">
          <div className="relative py-16 flex justify-center px-4 sm:px-0">
            <div className="max-w-3xl text-center">
              <div className="pb-4">
                <span className="inline-flex items-center rounded-2xl bg-purple-100 px-4 py-1.5 text-xs sm:text-sm font-serif font-medium text-purple-700">
                  Unlock the potential of AI in education.
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 xl:text-6xl font-serif !leading-tight">
                Faculty Evaluation System
              </h1>
              <p
                className="mt-4 text-lg sm:text-xl leading-8 text-gray-800 sm:px-12"
                style={{ whiteSpace: 'pre-line' }}
              >
                "Empowering academic growth through feedback. Our Faculty Evaluation System enables transparent, constructive, and data-driven assessments to enhance teaching quality and foster a culture of continuous improvement."
              </p>
              <div className="mt-8 flex w-full space-x-8 justify-center">
                <a href="/login">
                  <button className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none ring-2 ring-offset-2 ring-transparent ring-offset-transparent disabled:bg-gray-400 appearance-none text-white bg-purple-500 hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-white !px-12 !shadow-lg !rounded-full !text-base">
                    <p>Evaluate Now </p>
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
