import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../utils/helper';
import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

export default function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState(null);
   const [successMessage, setSuccessMessage] = useState(null);
   const navigate = useNavigate();

   const handleLogin = async(e) => {
      e.preventDefault();
      if(!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if(!password) {
        setError("Please enter the password");
        return;
      }
      setError("");
      try {
        const response = await axiosInstance.post("/login", { email, password });
        if(response.data?.accessToken) {
          localStorage.setItem("token", response.data.accessToken);
          setSuccessMessage("Login successful! Redirecting...");
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      } catch(error) {
        setError(error.response?.data?.message || "An unexpected error occurred");
      }
   };

  return (
    <>
      <Navbar/>
      <div className="flex items-center justify-center bg-gray-100 h-[calc(100vh-64px)]"> {/* Adjusted height calculation */}
        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md mx-4"> {/* Reduced padding and added horizontal margin */}
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4"> {/* Reduced text size and margin */}
            Login to Your Account
          </h2>
          {successMessage && (
            <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm"> {/* Reduced padding and text size */}
              {successMessage}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-3"> {/* Reduced spacing */}
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm mb-1"> {/* Smaller text */}
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /* Smaller rounded corners and padding */
                placeholder="you@example.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-gray-700 text-sm mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" /* Smaller right padding */
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-8 text-xs text-blue-600" /* Adjusted position and size */
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {error && <p className='text-red-500 text-xs'>{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition" /* Smaller rounded corners */
            >
              Sign In
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-gray-500"> {/* Smaller text and margin */}
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  )
}