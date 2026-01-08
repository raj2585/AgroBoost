import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios'; // Import axios for API calls

export default function Forum() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  // State for API calls
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newPost, setNewPost] = useState({
    title: '',
    body: '',
    category: 'crop-planning'
  });

  const [newAnswer, setNewAnswer] = useState('');

  // API base URL - replace with your actual API URL
  const API_BASE_URL = 'http://localhost:3000/api';

  // Fetch questions from API
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/questions`);
      setQuestions(response.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions. Please try again later.");
      
      // Fallback to sample data if in development
      if (process.env.NODE_ENV === 'development') {
        setQuestions([
          {
            id: 1,
            title: "What's the best way to deal with aphids on tomato plants?",
            body: "I've noticed aphids on my tomato plants and want to control them without harming pollinators. Any organic solutions?",
            author: "Ramesh Kumar",
            location: "Sikar, Rajasthan",
            date: "2 days ago",
            category: "pest-control",
            upvotes: 24,
            answers: [
              {
                id: 101,
                body: "I've had success with neem oil spray. Mix 2 tsp neem oil with 1 tsp mild liquid soap and 1 liter water. Spray in the evening when bees aren't active.",
                author: "Vijay Prakash",
                location: "West Godavari, AP",
                date: "1 day ago",
                upvotes: 12
              },
              {
                id: 102,
                body: "Ladybugs are natural predators of aphids. You can buy them or attract them to your garden with plants like dill, fennel, and marigold.",
                author: "Lakshmi Devi",
                location: "Nashik, Maharashtra",
                date: "1 day ago",
                upvotes: 8
              }
            ]
          },
          {
            id: 2,
            title: "When is the best time to sow wheat in North India?",
            body: "I'm planning to sow wheat this season. What's the ideal time considering the changing climate patterns?",
            author: "Balwinder Singh",
            location: "Ludhiana, Punjab",
            date: "1 week ago",
            category: "crop-planning",
            upvotes: 32,
            answers: [
              {
                id: 201,
                body: "For North India, mid-November is optimal. Late October if you're using zero tillage. Don't go beyond first week of December or yields will drop.",
                author: "Dr. Sarbjit Kaur",
                location: "PAU Ludhiana",
                date: "6 days ago",
                upvotes: 20
              }
            ]
          },
          {
            id: 3,
            title: "Best subsidy schemes available for solar pumps?",
            body: "I want to install a solar pump on my farm. Are there government subsidies available? What's the application process?",
            author: "Meena Kumari",
            location: "Jaipur, Rajasthan",
            date: "3 days ago",
            category: "subsidies",
            upvotes: 18,
            answers: []
          },
          {
            id: 4,
            title: "How to identify nutrient deficiency in rice plants?",
            body: "My rice crop is showing yellow leaves and stunted growth. How can I determine which nutrients are deficient?",
            author: "Rahul Mahto",
            location: "Ranchi, Jharkhand",
            date: "5 days ago",
            category: "soil-health",
            upvotes: 15,
            answers: [
              {
                id: 401,
                body: "Yellow leaves from bottom to top often indicate nitrogen deficiency. If newer leaves are yellow with green veins, it's likely iron deficiency. For stunted growth, check phosphorus levels.",
                author: "Ramamurthy K",
                location: "Thanjavur, TN",
                date: "3 days ago",
                upvotes: 10
              }
            ]
          },
          {
            id: 5,
            title: "Which crop rotation works best after sugarcane?",
            body: "I've harvested sugarcane and want to know which crop to plant next for best soil health and profits.",
            author: "Pramod Patil",
            location: "Kolhapur, Maharashtra",
            date: "1 week ago",
            category: "crop-planning",
            upvotes: 22,
            answers: [
              {
                id: 501,
                body: "Legumes like moong or soybean are excellent after sugarcane. They fix nitrogen and improve soil fertility. Short duration crops let you prepare for next season on time.",
                author: "Manoj Deshmukh",
                location: "Sangli, Maharashtra",
                date: "5 days ago",
                upvotes: 14
              }
            ]
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get profile data directly from location state first
      let authorName = '';
      let authorLocation = '';
      
      if (location.state && location.state.profileData) {
        authorName = location.state.profileData.name || '';
        authorLocation = location.state.profileData.city || '';
        
        // Update the local state with this info if it's not already set
        if (!userName) setUserName(authorName);
        if (!userLocation) setUserLocation(authorLocation);
      }
      
      // If still empty, show an alert
      
      
      const questionData = {
        title: newPost.title,
        body: newPost.body,
        category: newPost.category,
        author: authorName,
        location: authorLocation
      };
      
      console.log("Sending question data:", questionData);
      
      const response = await axios.post(`${API_BASE_URL}/questions`, questionData);
      
      // Add the new question to the state with the response from the API
      setQuestions([response.data, ...questions]);
      
      // Close modal and reset form
      setShowNewPostModal(false);
      setNewPost({ title: '', body: '', category: 'crop-planning' });
      
    } catch (err) {
      console.error("Error posting question:", err);
      alert("Failed to post your question: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnswerSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get profile data directly from location state first
      let authorName = '';
      let authorLocation = '';
      
      if (location.state && location.state.profileData) {
        authorName = location.state.profileData.name || '';
        authorLocation = location.state.profileData.city || '';
        
        // Update the local state with this info if it's not already set
        if (!userName) setUserName(authorName);
        if (!userLocation) setUserLocation(authorLocation);
      }
      
      // If still empty, show an alert
      
      
      const answerData = {
        body: newAnswer,
        author: authorName,
        location: authorLocation,
        questionId: selectedQuestion.id
      };
      
      console.log("Sending answer data:", answerData);
      
      const response = await axios.post(`${API_BASE_URL}/questions/${selectedQuestion.id}/answers`, answerData);
      
      // Update the questions state with the new answer
      setQuestions(prevQuestions => 
        prevQuestions.map(q => {
          if (q.id === selectedQuestion.id) {
            return { 
              ...q, 
              answers: [...q.answers, response.data]
            };
          }
          return q;
        })
      );
      
      // Close modal and reset form
      setShowAnswerModal(false);
      setNewAnswer('');
      
    } catch (err) {
      console.error("Error posting answer:", err);
      alert("Failed to post your answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfile = () => {
    navigate('/profile', { state: { profileData: location.state.profileData } });
  };

  // Update user data from location state
  useEffect(() => {
    if (location.state && location.state.profileData) {
      setUserName(location.state.profileData.name || '');
      setUserLocation(location.state.profileData.city || '');
      
      console.log("Profile data loaded:", {
        name: location.state.profileData.name,
        location: location.state.profileData.city
      });
    } else {
      console.warn("No profile data found in location state");
    }
    
    // Fetch questions when component mounts
    fetchQuestions();
  }, [location.state, navigate]);

  // Filter questions based on search and category
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || question.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpvote = async (questionId, answerId = null) => {
    try {
      if (answerId) {
        // Upvote an answer
        await axios.post(`${API_BASE_URL}/answers/${answerId}/upvote`);
        
        // Update local state
        setQuestions(prevQuestions => 
          prevQuestions.map(q => {
            if (q.id === questionId) {
              return {
                ...q,
                answers: q.answers.map(a => 
                  a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
                )
              };
            }
            return q;
          })
        );
      } else {
        // Upvote a question
        await axios.post(`${API_BASE_URL}/questions/${questionId}/upvote`);
        
        // Update local state
        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
          )
        );
      }
    } catch (err) {
      console.error("Error upvoting:", err);
      alert("Failed to register your vote. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as other pages */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard', { state: { profileData: location.state.profileData } })}>AgroBoost</h1>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="font-medium">{userName}</p>
              <p className="text-sm text-green-100">{userLocation}</p>
            </div>
            <div 
              className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center cursor-pointer"
              onClick={handleProfile}
            >
              <span className="text-xl">{userName.charAt(0)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Forum Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Farmer Community Forum</h2>
              <p className="text-gray-600">Ask questions, share knowledge, and connect with fellow farmers</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold"
              onClick={() => setShowNewPostModal(true)}
            >
              Ask a Question
            </motion.button>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="block w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="crop-planning">Crop Planning</option>
                <option value="pest-control">Pest Control</option>
                <option value="soil-health">Soil Health</option>
                <option value="weather">Weather</option>
                <option value="irrigation">Irrigation</option>
                <option value="subsidies">Subsidies & Schemes</option>
                <option value="market-prices">Market Prices</option>
                <option value="equipment">Farm Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'crop-planning', 'pest-control', 'soil-health', 'subsidies', 'irrigation'].map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category === 'all' ? 'All' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Questions List */}
        {!loading && filteredQuestions.length > 0 ? (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <motion.div
                key={question.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Upvote column */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => handleUpvote(question.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="font-bold text-lg">{question.upvotes}</span>
                      <span className="text-xs text-gray-500">votes</span>
                    </div>
                    
                    {/* Question content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{question.title}</h3>
                      <p className="text-gray-600 mb-4">{question.body}</p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                            {question.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            Asked {question.date} by {question.author} from {question.location}
                          </span>
                        </div>
                        
                        <button
                          className="text-green-700 font-medium hover:text-green-800 text-sm flex items-center"
                          onClick={() => {
                            setSelectedQuestion(question);
                            setShowAnswerModal(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Answer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Show answers if there are any */}
                {question.answers.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
                      </h4>
                      
                      <div className="space-y-4">
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="flex gap-4">
                            {/* Upvote column for answer */}
                            <div className="flex flex-col items-center min-w-[60px]">
                              <button 
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                onClick={() => handleUpvote(question.id, answer.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <span className="font-bold text-md">{answer.upvotes}</span>
                            </div>
                            
                            {/* Answer content */}
                            <div className="flex-1">
                              <p className="text-gray-700">{answer.body}</p>
                              <div className="mt-2 text-sm text-gray-500">
                                Answered {answer.date} by {answer.author} from {answer.location}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term or category' : 'Be the first to ask a question!'}
            </p>
            <button
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold"
              onClick={() => setShowNewPostModal(true)}
            >
              Ask a Question
            </button>
          </div>
        ) : null}
      </main>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Ask a Question</h3>
                <button 
                  onClick={() => setShowNewPostModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleNewPostSubmit}>
                <div className="mb-4">
                  <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Question Title
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., What's the best way to deal with aphids?"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="post-body" className="block text-sm font-medium text-gray-700 mb-1">
                    Details
                  </label>
                  <textarea
                    id="post-body"
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Explain your question in detail..."
                    value={newPost.body}
                    onChange={(e) => setNewPost({...newPost, body: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="post-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="post-category"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    required
                  >
                    <option value="crop-planning">Crop Planning</option>
                    <option value="pest-control">Pest Control</option>
                    <option value="soil-health">Soil Health</option>
                    <option value="weather">Weather</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="subsidies">Subsidies & Schemes</option>
                    <option value="market-prices">Market Prices</option>
                    <option value="equipment">Farm Equipment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => setShowNewPostModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Posting...
                      </>
                    ) : 'Post Question'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Answer Modal */}
      {showAnswerModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Answer This Question</h3>
                <button 
                  onClick={() => setShowAnswerModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800">{selectedQuestion.title}</h4>
                <p className="text-gray-600 mt-1">{selectedQuestion.body}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Asked by {selectedQuestion.author} from {selectedQuestion.location}
                </div>
              </div>
              
              <form onSubmit={handleNewAnswerSubmit}>
                <div className="mb-6">
                  <label htmlFor="answer-body" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Answer
                  </label>
                  <textarea
                    id="answer-body"
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Share your knowledge and experience..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    required
                    disabled={loading}
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => setShowAnswerModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Posting...
                      </>
                    ) : 'Post Answer'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
