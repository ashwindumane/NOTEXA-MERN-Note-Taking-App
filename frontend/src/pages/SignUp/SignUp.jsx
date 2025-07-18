import React, { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar';
import { validateEmail } from '../utils/helper';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const SignUp=()=> {
   const [name, setName]=useState("");
   const [email, setEmail]=useState("");
   const [password, setPassword]=useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [error,setError]=useState(null);
   const [successMessage, setSuccessMessage] = useState(null);

    const navigate = useNavigate()

  const handleSignUp = async(e)=>{
    e.preventDefault();

     if(!name) {
      setError("Please enter your name");
      return;
     }
     if(!validateEmail(email)){
      setError("Please enter a email address");
      return;
     }

     if(!password){
      setError("please enter the password");     
       return;
     }

     setError("");

    try{
      const response = await axiosInstance.post("/create-account", {
        fullName: name,
        email: email,
        password: password,
      });
        
       if(response.data && response.data.error) {
          setError(response.data.message)
          return
       }
        
         if(response.data && response.data.accessToken){
           localStorage.setItem("token", response.data.accessToken)
           setSuccessMessage("Account created successfully");
           setTimeout(() => {
             navigate("/dashboard")
           }, 1500);
         }

    }catch(error){
      if(error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }else{
        setError("An unexpected error occurred. please try again");
      }
    }
  };

  return (
    <>
      <Navbar/>
      <div className="min-h-[90vh] flex items-center justify-center bg-gray-100 px-4 py-6">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Create an Account</h2>
        {successMessage && (
          <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-md text-sm">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSignUp} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder='Name'
              value={name}
              onChange={(e)=>setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder='Email'
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-7 text-xs text-blue-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className='text-red-500 text-xs'>{error}</p>}          

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
          >
            Sign Up
          </button>
        </form>
        <p className="text-xs text-center text-gray-600 mt-3">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in</a>
        </p>
      </div>
    </div>
    </>
  )
}
export default SignUp;