/* eslint-disable no-unused-vars */
import React, { use, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LanguageSelector from '../components/LanguageSelector';
import LanguageDropdown from '../components/LanguageDropdown';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profileData, setprofileData] = useState(() => {
    const initialData = location.state?.profileData || {
      name: '',
      aadhaarNumber: '',
      phone: '',
      email: '',
      location: '',
      farmSize: '',
      crops: [],
      soilType: '',
      joinDate: '',
      state: '',
      age: '',
      gender: '',
      organicFarming: '',
      caste: '',
      annualIncome: '',
      city: '',
      soilAnalysis: {
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        phLevel: '',
        organicMatter: '',
        moisture: ''
      }
    };
    return initialData;
  });
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...profileData});

  useEffect(() => {
    if(!location.state || !location.state.profileData){
      navigate('/login', {replace:true});
    } 
    let userName = location.state.profileData.name; 
    let userState = location.state.profileData.state;
    let userCity = location.state.profileData.city;
    let userID = location.state.profileData.aadhaarNumber;
    setprofileData({
      name: userName,
      aadhaarNumber: userID,
      phone: '',
      email: '',
      farmSize: '',
      crops: [],
      soilType: '',
      joinDate: 'June 15, 2023',
      state: userState,
      age: '',
      gender: '',
      organicFarming: '',
      caste: '',
      annualIncome: '',
      city: userCity,
      soilAnalysis: {
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        phLevel: '',
        organicMatter: '',
        moisture: ''
      }
    })
  }, [location.state, navigate]);

  console.log("profileData", profileData);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedFormData = { ...prevFormData, [name]: value };
      console.log("Updated formData:", updatedFormData); // Log the updated value immediately
      return updatedFormData;
    });
  };

  const handleSoilAnalysisChange = (fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      soilAnalysis: {
        ...prevFormData.soilAnalysis,
        [fieldName]: value,
      },
    }));
  };
  
  const handleSave = () => {
    setprofileData({...formData});
    
    console.log("current form data", formData);
    setIsEditing(false);
    navigate('/dashboard', {state: {profileData: {...formData}}});
  };
  
  const handleCancel = () => {
    setFormData({...profileData});
    setIsEditing(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as dashboard for consistency */}
      <header className="bg-green-700 text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard', {state: {profileData: {...formData}}})}>AgroBoost</h1>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <div className="hidden md:block text-right">
              <p className="font-medium">{profileData.name}</p>
              <p className="text-sm text-green-100">{profileData.location}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-xl">{profileData.name.charAt(0)}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="h-24 w-24 rounded-full bg-green-600 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <span className="text-4xl text-white">{profileData.name.charAt(0)}</span>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
              <p className="text-gray-600">{profileData.location}</p>
              <p className="text-sm text-gray-500">Member since {profileData.joinDate}</p>
            </div>
            <div className="flex-grow"></div>
            <div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-4 md:mt-0"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b">
            <TabButton 
              label="Personal Information" 
              active={activeTab === 'personal'} 
              onClick={() => setActiveTab('personal')} 
            />
            <TabButton 
              label="Farm Details" 
              active={activeTab === 'farm'} 
              onClick={() => setActiveTab('farm')} 
            />
            <TabButton 
              label="Account Settings" 
              active={activeTab === 'account'} 
              onClick={() => setActiveTab('account')} 
            />
            <TabButton 
              label="Preferences" 
              active={activeTab === 'preferences'} 
              onClick={() => setActiveTab('preferences')} 
            />
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Full Name" 
                    name="name" 
                    value={profileData.name} 
                    onChange={handleInputChange} 
                    isEditing={isEditing} 
                  />
                  <FormField 
                    label="Phone Number" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    isEditing={isEditing} 
                  />
                  <FormField 
                    label="Email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    isEditing={isEditing} 
                  />
                  <FormField
                    label="Age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="select"
                    options={[
                      { value: '', label: 'Select Age' },
                      { value: '18-25', label: '18-25' },
                      { value: '26-35', label: '26-35' },
                      { value: '36-45', label: '36-45' },
                      { value: '46-60', label: '46-60' },
                      { value: '60+', label: '60+' },
                    ]}
                    requiredForSubsidy={false}
                  />
                  <FormField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="select"
                    options={[
                      { value: '', label: 'Select Gender' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                    requiredForSubsidy={false}
                  />
                  <FormField
                    label="Caste"
                    name="caste"
                    value={formData.caste}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="select"
                    options={[
                      { value: '', label: 'Select Caste' },
                      { value: 'general', label: 'General' },
                      { value: 'obc', label: 'OBC' },
                      { value: 'sc', label: 'SC' },
                      { value: 'st', label: 'ST' },
                    ]}
                    requiredForSubsidy={false}
                  />
                  <FormField
                    label="Annual Income"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="select"
                    options={[
                      { value: '', label: 'Select Income' },
                      { value: 'below_1_lakh', label: 'Below ₹1 Lakh' },
                      { value: '1_to_5_lakh', label: '₹1 Lakh - ₹5 Lakh' },
                      { value: '5_to_10_lakh', label: '₹5 Lakh - ₹10 Lakh' },
                      { value: 'above_10_lakh', label: 'Above ₹10 Lakh' },
                    ]}
                    requiredForSubsidy={false}
                  />
                  <FormField
                    label="Organic Farming"
                    name="organicFarming"
                    value={formData.organicFarming}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="select"
                    options={[
                      { value: '', label: 'Select Option' },
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                    ]}
                    requiredForSubsidy={false}
                  />
                  <FormField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="select"
                    options={[
                      { value: '', label: 'Select State' },
                      { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
                      { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
                      { value: 'Assam', label: 'Assam' },
                      { value: 'Bihar', label: 'Bihar' },
                      { value: 'Chhattisgarh', label: 'Chhattisgarh' },
                      { value: 'Goa', label: 'Goa' },
                      { value: 'Gujarat', label: 'Gujarat' },
                      { value: 'Haryana', label: 'Haryana' },
                      { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
                      { value: 'Jharkhand', label: 'Jharkhand' },
                      { value: 'Karnataka', label: 'Karnataka' },
                      { value: 'Kerala', label: 'Kerala' },
                      { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
                      { value: 'Maharashtra', label: 'Maharashtra' },
                      { value: 'Manipur', label: 'Manipur' },
                      { value: 'Meghalaya', label: 'Meghalaya' },
                      { value: 'Mizoram', label: 'Mizoram' },
                      { value: 'Nagaland', label: 'Nagaland' },
                      { value: 'Odisha', label: 'Odisha' },
                      { value: 'Punjab', label: 'Punjab' },
                      { value: 'Rajasthan', label: 'Rajasthan' },
                      { value: 'Sikkim', label: 'Sikkim' },
                      { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                      { value: 'Telangana', label: 'Telangana' },
                      { value: 'Tripura', label: 'Tripura' },
                      { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                      { value: 'Uttarakhand', label: 'Uttarakhand' },
                      { value: 'West Bengal', label: 'West Bengal' },
                      { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
                      { value: 'Chandigarh', label: 'Chandigarh' },
                      { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
                      { value: 'Delhi', label: 'Delhi' },
                      { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
                      { value: 'Ladakh', label: 'Ladakh' },
                      { value: 'Lakshadweep', label: 'Lakshadweep' },
                      { value: 'Puducherry', label: 'Puducherry' },
                    ]}
                    requiredForSubsidy={false}
                  />
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                    </div>
                    <p className="text-gray-800 p-2 bg-gray-100 rounded-lg">
                      {profileData.aadhaarNumber}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Aadhaar number cannot be edited</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Farm Details Tab */}
            {activeTab === 'farm' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Farm Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Farm Size" 
                    name="farmSize" 
                    value={formData.farmSize} 
                    onChange={handleInputChange} 
                    isEditing={isEditing} 
                    requiredForSubsidy={false}
                  />
                  <FormField 
                    label="Soil Type" 
                    name="soilType" 
                    value={formData.soilType} 
                    onChange={handleInputChange} 
                    isEditing={isEditing} 
                  />
                  
                  <FormField
                    label="Crops"
                    name="crops"
                    value={Array.isArray(formData.crops) ? formData.crops.join(', ') : formData.crops}
                    onChange={(e) =>
                      setFormData({ ...formData, crops: e.target.value.split(', ') })
                    }
                    isEditing={isEditing}
                    requiredForSubsidy={false}
                  />
                  
                  <div className="md:col-span-2">
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-800 mb-3">Soil Analysis Results</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {isEditing || (formData.soilAnalysis && Object.values(formData.soilAnalysis).some(val => val)) ? (
                          <div className="grid grid-cols-3 gap-4">
                            <SoilField 
                              name="Nitrogen" 
                              fieldName="nitrogen"
                              value={formData.soilAnalysis?.nitrogen || ''} 
                              onChange={(value) => handleSoilAnalysisChange('nitrogen', value)}
                              isEditing={isEditing}
                            />
                            <SoilField 
                              name="Phosphorus" 
                              fieldName="phosphorus"
                              value={formData.soilAnalysis?.phosphorus || ''} 
                              onChange={(value) => handleSoilAnalysisChange('phosphorus', value)}
                              isEditing={isEditing}
                            />
                            <SoilField 
                              name="Potassium" 
                              fieldName="potassium"
                              value={formData.soilAnalysis?.potassium || ''} 
                              onChange={(value) => handleSoilAnalysisChange('potassium', value)}
                              isEditing={isEditing}
                            />
                            <SoilField 
                              name="pH Level" 
                              fieldName="phLevel"
                              value={formData.soilAnalysis?.phLevel || ''} 
                              onChange={(value) => handleSoilAnalysisChange('phLevel', value)}
                              isEditing={isEditing}
                            />
                            <SoilField 
                              name="Organic Matter" 
                              fieldName="organicMatter"
                              value={formData.soilAnalysis?.organicMatter || ''} 
                              onChange={(value) => handleSoilAnalysisChange('organicMatter', value)}
                              isEditing={isEditing}
                            />
                            <SoilField 
                              name="Moisture" 
                              fieldName="moisture"
                              value={formData.soilAnalysis?.moisture || ''} 
                              onChange={(value) => handleSoilAnalysisChange('moisture', value)}
                              isEditing={isEditing}
                            />
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No soil analysis data available yet</p>
                            <button 
                              onClick={() => setIsEditing(true)} 
                              className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Add Soil Analysis Data
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Account Settings</h3>
                
                <div className="border-b pb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border-b pb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Linked Accounts</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">📱</span>
                        <div>
                          <p className="font-medium">Mobile Number</p>
                          <p className="text-sm text-gray-600">{profileData.phone}</p>
                        </div>
                      </div>
                      <span className="text-green-700 text-sm">Verified</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">📧</span>
                        <div>
                          <p className="font-medium">Email Address</p>
                          <p className="text-sm text-gray-600">{profileData.email}</p>
                        </div>
                      </div>
                      <button className="text-green-700 text-sm font-medium hover:underline">Verify</button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">Account Management</h4>
                  <div className="flex justify-between items-center">
                    <button className="text-red-600 hover:text-red-700 font-medium">
                      Delete Account
                    </button>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Preferences</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Notifications</h4>
                    <div className="space-y-3">
                      <ToggleSetting 
                        label="Weather Alerts" 
                        description="Get notified about important weather changes" 
                        defaultChecked={true} 
                      />
                      <ToggleSetting 
                        label="Market Price Updates" 
                        description="Receive updates when crop prices change significantly" 
                        defaultChecked={true} 
                      />
                      <ToggleSetting 
                        label="Government Scheme Alerts" 
                        description="Get notified about new schemes and deadlines" 
                        defaultChecked={true} 
                      />
                      <ToggleSetting 
                        label="Community Messages" 
                        description="Receive messages from other farmers in your area" 
                        defaultChecked={false} 
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-3">Language Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Language
                        </label>
                        <LanguageDropdown />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-3">Unit Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperature Unit
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input type="radio" name="temperature" checked className="mr-2" />
                            <span>Celsius (°C)</span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="temperature" className="mr-2" />
                            <span>Fahrenheit (°F)</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Area Unit
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input type="radio" name="area" checked className="mr-2" />
                            <span>Acres</span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="area" className="mr-2" />
                            <span>Hectares</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const TabButton = ({ label, active, onClick }) => (
  <button 
    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
      active 
        ? 'border-green-600 text-green-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const FormField = ({ label, name, value, onChange, isEditing, type = 'text', options = [], requiredForSubsidy = false }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
    </div>
    {isEditing ? (
      type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      )
    ) : (
      <p className="text-gray-800 p-2 bg-gray-100 rounded-lg">{value}</p>
    )}
    {requiredForSubsidy && (
      <p className="text-xs text-red-600 mt-1">* This field is required for government subsidies</p>
    )}
  </div>
);

const SoilField = ({ name, fieldName, value, onChange, isEditing }) => (
  <div className="text-center">
    <p className="text-sm text-gray-600 mb-1">{name}</p>
    {isEditing ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        <option value="">Select {name} Level</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        {name === "pH Level" && (
          <>
            <option value="6.0">6.0</option>
            <option value="6.5">6.5</option>
            <option value="7.0">7.0</option>
            <option value="7.5">7.5</option>
            <option value="8.0">8.0</option>
          </>
        )}
        {name === "Moisture" && (
          <>
            <option value="Dry">Dry</option>
            <option value="Adequate">Adequate</option>
            <option value="Wet">Wet</option>
          </>
        )}
      </select>
    ) : (
      <p className={`font-medium py-1 px-2 rounded ${
        value === "Low" ? "bg-red-100 text-red-800" : 
        value === "Medium" ? "bg-yellow-100 text-yellow-800" : 
        value === "High" ? "bg-green-100 text-green-800" : 
        "bg-gray-100 text-gray-800"
      }`}>
        {value || 'N/A'}
      </p>
    )}
  </div>
);

const ToggleSetting = ({ label, description, defaultChecked }) => {
  const [isEnabled, setIsEnabled] = useState(defaultChecked);
  
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="relative inline-block w-12 h-6 flex-shrink-0">
        <input 
          type="checkbox" 
          className="opacity-0 w-0 h-0"
          checked={isEnabled}
          onChange={() => setIsEnabled(!isEnabled)}
          id={`toggle-${label}`}
        />
        <label 
          htmlFor={`toggle-${label}`}
          className={`block absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
            isEnabled ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span 
            className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform ${
              isEnabled ? 'transform translate-x-6' : ''
            }`}
          ></span>
        </label>
      </div>
    </div>
  );
};

export default Profile;