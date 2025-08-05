import React from 'react';
import { Link } from "react-router-dom";
import teacher from "../Assets/teacherlogo.png";
import student from "../Assets/stdlogo.png";
import family from "../Assets/familylogo.png";
import selectionimg from "../Assets/selectionimg.gif";
import logo from "../Assets/logo.png";



function Selection() {
  return (
    <div>
      <header className="sticky inset-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 transition-all duration-200 ease-in-out lg:px-12 py-4">
          <div className="flex items-center">
            {/* Logo Section */}
            <a href="/">
              <img className="block h-14 w-auto" src={logo} alt="Logo" />
            </a>
          </div>

          {/* Button Always Visible */}
          <div className="flex items-center justify-center">
            <a
              className="rounded-md bg-purple-500 px-3 py-1.5 font-dm text-sm font-medium text-white shadow-md transition-transform duration-200 ease-in-out hover:scale-[1.03]"
              href="/"
            >
              Go Back
            </a>
          </div>
        </nav>
      </header>


      <section className="flex flex-col md:flex-row w-full shadow-lg bg-gray-100">
        {/* Image Section (hidden on small and medium screens) */}
        <div className="hidden lg:block w-1/2 p-10 shadow-sm">
          <img
            src={selectionimg}
            alt="Image"
            style={{ maxWidth: '100%', height: '100%' }}
          />
        </div>

        <div className="w-full lg:w-1/2 p-5 mt-10  items-center content-center shadow-sm">
          <div className="font-bold text-2xl">Faculty Evaluation System!</div>
          <div className="text-sm">Choose an account type to proceed</div>

          <div>
            {/* Admin Login */}
            <Link to="/adminlogin" className="text-black text-decoration-none">
              <div className="flex border border-gray-500 rounded-md p-2 m-2 w-full lg:w-3/4 bg-purple-400 text-white hover:bg-purple-600 shadow-xl">
                <img className="block h-16 w-auto" src={teacher} alt="Admin Logo" />
                <div className="ml-2">
                  <h2 className="text-lg">Admin Login</h2>
                  <p className="text-sm">I'm an educator/school/admin/IT specialist.</p>
                </div>
              </div>
            </Link>

            {/* Student Login */}
            <Link to="/Studentlogin" className="text-black text-decoration-none">
              <div className="flex border border-gray-500 rounded-md p-2 m-2 w-full lg:w-3/4 bg-purple-400 text-white hover:bg-purple-600 shadow-xl">
                <img className="block h-16 p-2 w-auto" src={student} alt="Student Logo" />
                <div className="ml-2">
                  <h2 className="text-lg">Student Login</h2>
                  <p className="text-sm">I'm a student.</p>
                </div>
              </div>
            </Link>

            {/* Faculty Login */}
            <Link to="/Facultylogin" className="text-black text-decoration-none">
              <div className="flex border border-gray-500 rounded-md p-2 m-2 w-full lg:w-3/4 bg-purple-400 text-white hover:bg-purple-600 shadow-xl">
                <img className="block h-16 w-auto" src={family} alt="Faculty Logo" />
                <div className="ml-2">
                  <h2 className="text-lg">Faculty Login</h2>
                  <p className="text-sm">I'm a Faculty/Employee.</p>
                </div>
              </div>
            </Link>
          </div>



          <div className="mt-4">
            Here as an Admin?
            <a className="text-decoration-none" href="/home">
              <span className="text-purple-500"> Login here</span>
            </a>
          </div>

          <br />

          <div className="text-xs text-gray-600">
            By signing in you agree to our Privacy Policy, Terms of Use, and Cookie Policy. ©Teacher Tools Private Limited. All Rights Reserved.
          </div>
        </div>
      </section>
    </div>
  );
}

export default Selection;
