import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 12) {
      setAadhaarNumber(value);
      setError('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAadhaarImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate based on auth mode
    if (isLogin && aadhaarNumber.length !== 12) {
      setError('Aadhaar number must be 12 digits');
      return;
    }
    
    // For signup, validate the image
    if (!isLogin && !aadhaarImage) {
      setError('Please upload your Aadhaar card photo');
      return;
    }
    
    setLoading(true);
    
    try {
      // Backend API integration
      if (isLogin) {
        //TODO: Fetch from db and return user data, store the token in local storage
        
        const response = await fetch(`http://localhost:3000/api/user/login/?number=${aadhaarNumber}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error('Login failed');
        }
        const data = await response.json();
        console.log("Data from /user/login route:", data);
        
        navigate('/dashboard', { state: { profileData: data } });
        // Store authentication token if needed
        // localStorage.setItem('authToken', data.token);
      } 
      
      else {
        // Signup API endpoint
        const formData = new FormData();
        formData.append('aadhaarImage', aadhaarImage);

        // Replace with your actual API endpoint
        const response = await fetch('http://localhost:5000/api/signup', {
          method: 'POST',
          body: formData, 
        });
        
        if (!response.ok) {
          throw new Error('Signup failed');
        }
        
        try {
          console.log("Response from Aadhaar API:", response);
          const rawData = await response.json();
          console.log("Raw data from Aadhaar API:", rawData);
          
          const cleanedString = rawData.replace(/^\[|\]$/g, '').trim();

          // Manual object creation
          const userData = {
              name: '',
              aadharID: '',
              dob: '',
              location: ''
          };

          // Extract values manually
          const extractValue = (str, key) => {
              const regex = new RegExp(`"${key}":\\s*"([^"]*)"`, 'i');
              const match = str.match(regex);
              return match ? match[1] : '';
          };

          // Populate the object
          userData.name = extractValue(cleanedString, 'name');
          userData.aadharID = extractValue(cleanedString, 'aadharID');
          userData.dob = extractValue(cleanedString, 'dob');
          userData.location = extractValue(cleanedString, 'location');

          // Create a string representation
          const jsonString = `{
              "name": "${userData.name}",
              "aadharID": "${userData.aadharID}",
              "dob": "${userData.dob}",
              "location": "${userData.location}"
          }`;

          // Output results
          console.log('Parsed User Data:', userData);
          console.log('JSON String:', jsonString);

          // Parse the date of birth from the JSON object
          const dobParts = userData.dob.split('/');
          const dob = new Date(dobParts[2], dobParts[1] - 1, dobParts[0]); // Year, Month (0-indexed), Day

          // Get current date
          const currentDate = new Date();

          // Calculate age
          let age = currentDate.getFullYear() - dob.getFullYear();

          // Check if birthday hasn't occurred this year
          const monthDiff = currentDate.getMonth() - dob.getMonth();
          const dayDiff = currentDate.getDate() - dob.getDate();

          // Adjust age if birthday hasn't happened yet this year
          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
          }

          // Detailed age calculation
          
          // Direct JSON parsing since response is already in JSON format
          if (userData) {
            // Transform the data to match your expected format
            const profileData = {
              name: userData.name,
              aadhaarNumber: userData.aadharID,
              city: userData.location,
              state: "",
              phone: "",
              email: "",
              farmSize: "",
              crops: [],
              soilType: "",
              joinDate: "June 15, 2023", // Default join date
              age: age,
              gender: "",
              organicFarming: "",
              caste: "",
              annualIncome: "",
            };
        
            console.log("Successfully parsed Aadhaar data:", profileData);
            
            const response = await fetch('http://localhost:3000/api/user/signup', {
              method: 'POST',
              body: JSON.stringify(profileData),
              headers: {
                'Content-Type': 'application/json'
              }
            });
            if(response.ok){
            // Navigate to dashboard with the parsed data
            navigate('/dashboard', { state: { profileData: profileData } });
            }else{
              console.error("Error in /user/signup route:", error);
              setError("Failed to create user");
            }
          } else {
            console.error("Invalid response format:", rawData);
            setError("Received invalid response format");
          }
        } catch (error) {
          console.error("Error parsing JSON from response:", error);
          setError("Failed to parse Aadhaar details");
        }
      }
    } 
    catch (error) {
      setError('Authentication failed. Please try again.');
      console.error("Authentication failed:", error);
    } 
    finally {
      setLoading(false);
    }
  };

  // Format Aadhaar number for display (XXXX XXXX XXXX)
  const formattedAadhaar = () => {
    return aadhaarNumber
      .split('')
      .map((char, index) => (index > 0 && index % 4 === 0 ? ` ${char}` : char))
      .join('');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    // Clear image when switching to login mode
    if (isLogin) {
      setAadhaarImage(null);
      setImagePreview(null);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center p-0 bg-gradient-to-br from-green-400 to-green-700">
      {/* Add language selector to the top right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      
      <div className="flex w-[90%] max-w-6xl min-h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
        <div 
          className="flex flex-col justify-center items-center flex-1 p-8 text-center text-white bg-cover bg-center" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(75, 138, 108, 0.85), rgba(75, 138, 108, 0.85)), 
                              url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFybXxlbnwwfHwwfHw%3D&w=1000&q=80')`
          }}
        >
          <div className="banner-content">
            <h1 className="text-5xl mb-4 font-bold drop-shadow-md">AgroBoost</h1>
            <p className="text-xl max-w-[80%] mx-auto">Empowering farmers with technology</p>
          </div>
        </div>
        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-4 text-green-700 font-semibold">{isLogin ? 'Login' : 'Sign Up'}</h2>
            <p className="text-gray-600">
              {isLogin 
                ? "Please enter your Aadhaar card number to continue" 
                : "Please upload a photo of your Aadhaar card to create an account"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Show Aadhaar number input only for login */}
            {isLogin && (
              <div className="mb-6">
                <label htmlFor="aadhaar-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number
                </label>
                <div className="relative">
                  <input
                    id="aadhaar-number"
                    type="text"
                    value={formattedAadhaar()}
                    onChange={handleAadhaarChange}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14} // 12 digits + 2 spaces
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">Your 12-digit Aadhaar identification number</p>
              </div>
            )}

            {/* Show image upload only for signup */}
            {!isLogin && (
              <div className="mb-6">
                <label htmlFor="aadhaar-upload" className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Card Photo
                </label>
                <div 
                  className="flex border-2 border-dashed border-gray-300 rounded-lg h-[200px] cursor-pointer justify-center items-center overflow-hidden hover:border-green-600 transition-colors"
                >
                  <label htmlFor="aadhaar-upload" className="w-full h-full flex justify-center items-center cursor-pointer">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aadhaar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <span className="text-5xl mb-2">📷</span>
                        <span>Upload Aadhaar Card Photo</span>
                      </div>
                    )}
                  </label>
                  <input
                    id="aadhaar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Upload a clear photo of your Aadhaar card</p>
              </div>
            )}

            {error && <p className="mt-2 text-sm text-red-600 mb-4">{error}</p>}

            <button 
              type="submit" 
              disabled={
                (isLogin && aadhaarNumber.length !== 12) || 
                (!isLogin && !aadhaarImage) || 
                loading
              }
              className={`w-full py-4 px-4 rounded-lg text-lg font-semibold text-white mt-4 transition-colors ${
                (isLogin && aadhaarNumber.length !== 12) || (!isLogin && !aadhaarImage) || loading
                  ? 'bg-green-300 cursor-not-allowed' 
                  : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-600">
            <p>
              {isLogin 
                ? "Don't have an account? " 
                : "Already have an account? "}
              <button 
                type="button"
                onClick={toggleAuthMode}
                className="text-green-700 font-bold hover:underline focus:outline-none"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Add a style tag to override any conflicting styles */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: transparent;
          width: 100%;
          min-height: 100vh;
          display: block;
        }
        #root {
          width: 100%;
          height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default Login;