/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { use, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LanguageSelector from '../components/LanguageSelector';

const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Add refs for scrolling to sections
  const weatherWidgetRef = useRef(null);
  const weatherAlertsRef = useRef(null);
  const cropRecommendationsRef = useRef(null);
  const marketPricesRef = useRef(null);

  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [userID, setUserID] = useState('');
  const [userState, setUserState] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [govtSchemes, setGovtSchemes] = useState([]);
  const [reqMet, setReqmet] = useState(false); //hook to check if all required fields are present
  
  const [alertData, setAlertData] = useState(null);
  const [alertLoading, setAlertLoading] = useState(true);
  const [alertError, setAlertError] = useState(null);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  const [selectedCrop, setSelectedCrop] = useState(null);

  
  const [cropRecommendations, setCropRecommendations] = useState([]);

  // Function to check if soil analysis data exists and has values
  const hasSoilAnalysisData = () => {
    if (!profileData || !profileData.soilAnalysis) return false;
    return Object.values(profileData.soilAnalysis).some(val => val);
  };

  let profileData = location.state?.profileData;

  const fetchSchemes = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Use any available profile data to enhance scheme recommendations
      // but don't block the request if data is missing
      const params = {
        state: profileData?.state || '',
        gender: profileData?.gender || '',
        income: profileData?.annualIncome || ''
      };
      
      // Fetch schemes from API
      const response = await axios.get('http://localhost:5000/api/schemes', { params });
      
      if (response.data && response.data.schemes) {
        console.log('Fetched schemes:', response.data.schemes);
        setGovtSchemes(response.data.schemes);
      } else {
        // Fallback if API returns unexpected format
        setGovtSchemes([
          {
            name: "PM Kisan Samman Nidhi",
            description: "Income support of ₹6,000 per year in three equal installments to all land holding farmer families.",
            deadline: "Ongoing",
            category: "farmer support",
            eligibility: { states: ["All States"] }
          },
          {
            name: "PM Fasal Bima Yojana",
            description: "Crop insurance scheme providing financial support to farmers suffering crop loss or damage due to unforeseen events.",
            deadline: "Seasonal",
            category: "insurance",
            eligibility: { states: ["All States"] }
          },
          {
            name: "Kisan Credit Card",
            description: "Provides farmers with affordable credit for their agricultural needs.",
            deadline: "Ongoing",
            category: "finance",
            eligibility: { states: ["All States"] }
          }
        ]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      setError('Failed to fetch government schemes.');
      
      // Set default schemes even if API fails
      setGovtSchemes([
        {
          name: "PM Kisan Samman Nidhi",
          description: "Income support of ₹6,000 per year in three equal installments to all land holding farmer families.",
          deadline: "Ongoing",
          category: "farmer support"
        },
        {
          name: "PM Fasal Bima Yojana",
          description: "Crop insurance scheme providing financial support to farmers suffering crop loss or damage due to unforeseen events.",
          deadline: "Seasonal",
          category: "insurance"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [profileData]);

// Update the useEffect to call fetchSchemes without requiring profileData validation
useEffect(() => {
  if (!location.state || !location.state.profileData) {
    navigate('/login', { replace: true });
    return;
  }
  
  const updatedProfileData = location.state.profileData;
  setUserName(updatedProfileData.name || '');
  setUserLocation(updatedProfileData.city || '');
  setUserID(updatedProfileData.aadhaarNumber || '');
  
  // Fetch data without validation checks
  fetchWeatherData(updatedProfileData.city);
  fetchAlert(updatedProfileData.city);
  profileData = updatedProfileData;
  
  // Fetch schemes unconditionally
  fetchSchemes();
  
  if (updatedProfileData.soilAnalysis && 
    Object.values(updatedProfileData.soilAnalysis).some(val => val)) {
    // Wait a short time to ensure weather data is fetched
    setTimeout(() => {
      fetchCropRecommendations(updatedProfileData.soilAnalysis);
    }, 1000);
  }
}, [location.state, navigate, fetchSchemes]);

  const fetchWeatherData = async (cityName) => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);
        
        const response = await axios.get(`http://localhost:3000/api/weather/dashboard?city=${encodeURIComponent(cityName)}`);
        setWeatherData(response.data);
        console.log(response.data);
        // Update location from weather data
        setUserLocation(response.data.location.city);
        setUserState(response.data.location.state);
        setWeatherLoading(false);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setWeatherError('Failed to load weather data. Please try again later.');
        setWeatherLoading(false);
      }
    };

  const fetchAlert = async (cityName) => {
    try {
      setAlertLoading(true);
      setAlertError(null);

      const response = await axios.get(`http://localhost:3000/api/weather/alerts?city=${encodeURIComponent(cityName)}`);
      setAlertData(response.data);
      setAlertLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlertError('Failed to load alerts. Please try again later.');
      setAlertLoading(false);
    }
  };

  // Add this function after your other fetch functions
  const fetchCropRecommendations = async (soilData) => {
    try {
      // Check if we have the necessary soil data
      if (!soilData || !soilData.nitrogen || !soilData.phosphorus || !soilData.potassium) {
        console.log('Insufficient soil data for crop recommendations');
        return;
      }
      
      // Convert soil analysis values to numerical values if needed
      const getNutrientValue = (level) => {
        if (!isNaN(parseFloat(level))) return parseFloat(level);
        
        switch(level) {
          case 'Low': return 30;
          case 'Medium': return 60;
          case 'High': return 90;
          default: return 50; // Default fallback
        }
      };
      
      const getMoistureValue = (level) => {
        switch(level) {
          case 'Dry': return 30;
          case 'Adequate': return 60;
          case 'Wet': return 90;
          default: return 60; // Default fallback
        }
      };
      
      // Use weather data for temperature and humidity if available
      const temperature = weatherData?.current?.temperature || 25;
      const humidity = weatherData?.current?.humidity || 65;
      
      // Extract pH value or default
      const phValue = parseFloat(soilData.phLevel) || 6.5;
      
      // Get average rainfall from weather data or use a default
      const rainfall = weatherData?.forecast?.reduce((acc, day) => acc + (day.rainChance || 0), 0) / 5 || 80;

      // Prepare the payload for the crop recommendation API
      const payload = {
        N: getNutrientValue(soilData.nitrogen),
        P: getNutrientValue(soilData.phosphorus),
        K: getNutrientValue(soilData.potassium),
        temperature: temperature,
        humidity: humidity,
        ph: phValue,
        rainfall: rainfall,
        location: userLocation
      };
      
      console.log('Requesting crop recommendations with data:', payload);
      
      // Call the API
      const response = await fetch('http://localhost:3000/api/crops/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get crop recommendations');
      }
      
      console.log('Received crop recommendations:', data);
      
      // Update state with recommendations
      setCropRecommendations(data.recommendations);
      
    } catch (error) {
      console.error('Error fetching crop recommendations:', error);
      // Keep the default recommendations in case of error
    }
  };


  useEffect(() => {
    if(!location.state || !location.state.profileData){
      navigate('/login', {replace:true});
    }
    const updatedProfileData = location.state.profileData;
    setUserName(updatedProfileData.name || '');
    setUserLocation(updatedProfileData.city || '');
    setUserID(updatedProfileData.aadhaarNumber || '');
    fetchWeatherData(updatedProfileData.city);
    fetchAlert(updatedProfileData.city);
    profileData = updatedProfileData;
    fetchSchemes(profileData);

    if (updatedProfileData.soilAnalysis && 
      Object.values(updatedProfileData.soilAnalysis).some(val => val)) {
    // Wait a short time to ensure weather data is fetched
    setTimeout(() => {
      fetchCropRecommendations(updatedProfileData.soilAnalysis);
    }, 1000);
  }
  }, [location.state, navigate, fetchSchemes]);

  const handleProfileClick = () => {
    navigate('/profile', { state: { profileData: profileData } });
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      // Sunny
      1: "☀️",
      2: "☀️",
      3: "🌤️",
      4: "🌤️",
      5: "🌤️",
      // Partly cloudy
      6: "⛅",
      7: "⛅",
      8: "⛅",
      // Cloudy
      11: "☁️",
      12: "☁️",
      // Rain
      13: "🌧️",
      14: "🌧️",
      15: "⛈️",
      16: "⛈️",
      17: "⛈️",
      18: "🌧️",
      // Default
      default: "🌈"
    };
    
    return iconMap[iconCode] || iconMap.default;
  };

  // Add state for alert details modal
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  // Function to get severity class
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 1: return 'bg-yellow-100 border-yellow-400 text-yellow-800'; // Advisory
      case 2: return 'bg-orange-100 border-orange-400 text-orange-800'; // Watch
      case 3: return 'bg-red-100 border-red-400 text-red-800'; // Warning
      case 4: return 'bg-purple-100 border-purple-400 text-purple-800'; // Emergency
      default: return 'bg-blue-100 border-blue-400 text-blue-800'; // Unknown
    }
  };

  // Function to get alert icon
  const getAlertIcon = (type) => {
    const typeLC = (type || '').toLowerCase();
    if (typeLC.includes('rain') || typeLC.includes('flood')) return '🌧️';
    if (typeLC.includes('thunder') || typeLC.includes('storm')) return '⛈️';
    if (typeLC.includes('snow') || typeLC.includes('blizzard')) return '❄️';
    if (typeLC.includes('wind')) return '💨';
    if (typeLC.includes('heat')) return '🔥';
    if (typeLC.includes('cold') || typeLC.includes('frost')) return '🥶';
    if (typeLC.includes('fog')) return '🌫️';
    return '⚠️'; // Default
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
    <style>{customScrollbarStyle}</style>
      {/* Header */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AgroBoost</h1>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <div className="hidden md:block text-right">
              <p className="font-medium">{userName}</p>
              <p className="text-sm text-green-100">{userLocation}</p>
            </div>
            <div 
              className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center cursor-pointer hover:bg-green-500 transition-colors"
              onClick={handleProfileClick}
            >
              <span className="text-xl">{userName.charAt(0)}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {userName.split(' ')[0]}!</h2>
          <p className="text-gray-600">Here's your farming insights for today</p>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Weather Widget */}
          <motion.div 
            ref={weatherWidgetRef}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm col-span-1"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Weather Forecast</h3>
              <span className="text-sm text-green-700">5-day forecast</span>
            </div>
            
            {weatherLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : weatherError ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <p className="text-red-500 mb-2">⚠️ {weatherError}</p>
                <button 
                  onClick={() => fetchWeatherData(userLocation)} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : weatherData ? (
              <>
                <div className="flex items-center mb-6">
                  <div className="text-5xl font-bold text-gray-800 mr-4">
                    {weatherData.current.temperature}°C
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-3xl mr-2">{getWeatherIcon(weatherData.current.icon)}</span>
                      <p className="text-gray-600">{weatherData.current.condition}</p>
                    </div>
                    <p className="text-sm text-gray-500">{useLocation}</p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm font-medium">{day.day}</p>
                      <p className="text-2xl my-1">{getWeatherIcon(day.icon)}</p>
                      <p className="text-lg font-semibold">{day.temp}°</p>
                      <p className="text-xs text-gray-500">{day.condition}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </motion.div>

          {/* Weather Alerts Widget - New Widget*/}
          <motion.div 
            ref={weatherAlertsRef}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm col-span-1"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Weather Alerts</h3>
              {!alertLoading && alertData?.alerts && alertData.alerts.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {alertData.alerts.length} Active
                </span>
              )}
            </div>
            
            {alertLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : alertError ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <p className="text-red-500 mb-2">⚠️ {alertError}</p>
                <button 
                  onClick={() => fetchAlert(userLocation)} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : alertData?.alerts && alertData.alerts.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {alertData.alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border-l-4 rounded cursor-pointer ${getSeverityClass(alert.severity)}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-2">{getAlertIcon(alert.type)}</span>
                      <div>
                        <p className="font-medium">{alert.headline}</p>
                        <p className="text-xs mt-1">
                          Valid: {formatDate(alert.startTime)} to {formatDate(alert.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <span className="text-4xl mb-3">👍</span>
                <p className="text-gray-600">No weather alerts in your area</p>
                <p className="text-sm text-gray-500 mt-2">Check back for updates</p>
              </div>
            )}
          </motion.div>

          {/* Crop Recommendations */}
          <motion.div 
            ref={cropRecommendationsRef}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm col-span-1"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Recommended Crops</h3>
              <span className="text-sm text-green-700">Based on your soil</span>
            </div>
            
            {hasSoilAnalysisData() ? (
              cropRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {cropRecommendations.map((crop, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{crop.name}</span>
                        <span className="text-sm">{crop.confidence}% match</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            crop.confidence > 80 ? 'bg-green-600' :
                            crop.confidence > 60 ? 'bg-green-500' :
                            crop.confidence > 40 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${crop.confidence}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">{crop.suitability}</p>
                        {crop.details && (
                          <p className="text-xs text-gray-500">
                            {crop.details.season || 'Any season'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  <p className="mt-4 text-gray-500">Analyzing your soil data...</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <span className="text-4xl mb-3">🌱</span>
                <p className="text-gray-700 font-medium mb-2">No crop recommendations available</p>
                <p className="text-sm text-gray-600 mb-4">
                  Please update your soil analysis data to get personalized crop recommendations.
                </p>
                <button
                  onClick={() => navigate('/profile', { 
                    state: { profileData: profileData, activeTab: 'farm' },
                  })}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update Soil Analysis
                </button>
              </div>
            )}
          </motion.div>
          
          {/* Market Prices */}
          <motion.div 
            ref={marketPricesRef}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm col-span-1"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Market Prices</h3>
              <span className="text-sm text-green-700">Today's rates</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Wheat</p>
                  <p className="text-sm text-gray-600">₹2,350 / quintal</p>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="text-lg mr-1">↑</span>
                  <span>4.2%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Rice</p>
                  <p className="text-sm text-gray-600">₹3,120 / quintal</p>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="text-lg mr-1">↑</span>
                  <span>1.8%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Cotton</p>
                  <p className="text-sm text-gray-600">₹6,850 / quintal</p>
                </div>
                <div className="flex items-center text-red-600">
                  <span className="text-lg mr-1">↓</span>
                  <span>2.5%</span>
                </div>
              </div>
              
              <button className="w-full px-4 py-2 text-sm text-green-700 border border-green-300 rounded-lg hover:bg-green-50">
                View All Commodities
              </button>
            </div>
          </motion.div>

          {/* Government Schemes */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm md:col-span-2 lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Government Schemes</h3>
              <span className="text-sm text-green-700">
                {govtSchemes.length > 0 ? `${govtSchemes.length} Available` : 'Loading...'}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => fetchSchemes()}
                  className="mt-2 text-sm text-green-700 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : govtSchemes.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">🌾</span>
                <p className="text-gray-600">No schemes available at the moment</p>
              </div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {govtSchemes.slice(0, 6).map((scheme, index) => ( // Limit to 6 schemes for better display
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start mb-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-green-700">
                            {scheme.category === 'farmer support' ? '🧑‍🌾' : 
                            scheme.category === 'insurance' ? '🛡️' : 
                            scheme.category === 'infrastructure' ? '🏗️' : 
                            scheme.category === 'irrigation' ? '💧' : '📋'}
                          </span>
                        </div>
                        <h4 className="font-medium text-green-700 line-clamp-2">{scheme.name || 'Government Scheme'}</h4>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {scheme.description || 'Details not available'}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {scheme.deadline || 'Ongoing'}
                        </span>
                        <button 
                          onClick={() => window.open('https://pmkisan.gov.in/', '_blank')}
                          className="text-green-700 text-sm font-medium hover:underline"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {govtSchemes.length > 6 && (
                  <div className="text-center mt-4">
                    <button 
                      className="px-4 py-2 text-sm text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
                      onClick={() => navigate('/schemes', { state: { schemes: govtSchemes } })}
                    >
                      View All {govtSchemes.length} Schemes
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <ActionButton 
              icon="🌱" 
              label="Crop Guide" 
              onClick={() => {
                cropRecommendationsRef.current?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            />
            <ActionButton 
              icon="🌦️" 
              label="Weather" 
              onClick={() => {
                weatherWidgetRef.current?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            />
            <ActionButton 
              icon="📊" 
              label="Market Prices" 
              onClick={() => {
                marketPricesRef.current?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            />
            <ActionButton 
              icon="👨‍🌾" 
              label="Community" 
              onClick={() => {
                navigate('/forum');
              }}
            />
          </div>
        </div>
      </main>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`p-4 ${getSeverityClass(selectedAlert.severity)} rounded-t-xl`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{getAlertIcon(selectedAlert.type)}</span>
                  <h3 className="text-xl font-bold">{selectedAlert.headline}</h3>
                </div>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Valid Period</p>
                <p className="font-medium">
                  {formatDate(selectedAlert.startTime)} to {formatDate(selectedAlert.endTime)}
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Area</p>
                <p className="font-medium">{selectedAlert.area || 'Your region'}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="whitespace-pre-line">{selectedAlert.description}</p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setSelectedAlert(null)} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-green-50 border-b border-green-100 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🌱</span>
                  <h3 className="text-xl font-bold">{selectedCrop.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedCrop(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Suitability</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className={`h-2.5 rounded-full ${
                        selectedCrop.confidence > 80 ? 'bg-green-600' :
                        selectedCrop.confidence > 60 ? 'bg-green-500' :
                        selectedCrop.confidence > 40 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${selectedCrop.confidence}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{selectedCrop.confidence}%</span>
                </div>
                <p className="mt-1 text-sm">{selectedCrop.suitability}</p>
              </div>
              
              {selectedCrop.details && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Season</p>
                      <p className="font-medium">{selectedCrop.details.season || 'Year-round'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Water Requirement</p>
                      <p className="font-medium">{selectedCrop.details.waterRequirement || 'Medium'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Growth Period</p>
                      <p className="font-medium">{selectedCrop.details.growthPeriod || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Soil Preference</p>
                      <p className="font-medium">{selectedCrop.details.soilPreference || 'Various'}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Nutritional Value</p>
                    <p className="text-sm">{selectedCrop.details.nutritionalValue || 'Information not available'}</p>
                  </div>
                </>
              )}
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setSelectedCrop(null)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for action buttons
const ActionButton = ({ icon, label, onClick }) => (
  <motion.button 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <span className="text-2xl mb-2">{icon}</span>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </motion.button>
);

export default Dashboard;