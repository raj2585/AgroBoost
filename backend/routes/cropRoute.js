const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');
const { performance } = require('perf_hooks'); // For precise timing

// Setup metrics tracking
const metrics = {
  totalRequests: 0,
  successfulRecommendations: 0,
  failedRecommendations: 0,
  pythonModelInvocations: 0,
  fallbackInvocations: 0,
  responseTime: { sum: 0, count: 0, max: 0, min: Number.MAX_VALUE },
  modelResponseTime: { sum: 0, count: 0, max: 0, min: Number.MAX_VALUE },
  cropDistribution: {}, // Track which crops are being recommended
  errors: {},
  lastReset: new Date().toISOString()
};

// Middleware to track request metrics
router.use((req, res, next) => {
  // Mark the start time
  req.startTime = performance.now();
  metrics.totalRequests++;
  
  // Capture the original send method
  const originalSend = res.send;
  
  // Override the send method to track metrics
  res.send = function(body) {
    const duration = performance.now() - req.startTime;
    
    // Track response time
    metrics.responseTime.sum += duration;
    metrics.responseTime.count++;
    metrics.responseTime.max = Math.max(metrics.responseTime.max, duration);
    metrics.responseTime.min = Math.min(metrics.responseTime.min, duration);
    
    // Track status code
    const statusCode = res.statusCode;
    if (statusCode >= 200 && statusCode < 300) {
      // This was a successful request
      if (req.path.includes('/recommend')) {
        metrics.successfulRecommendations++;
        
        // Parse the response to track which crop was recommended
        if (typeof body === 'string') {
          try {
            const data = JSON.parse(body);
            if (data.topRecommendation) {
              const crop = data.topRecommendation.toLowerCase();
              metrics.cropDistribution[crop] = (metrics.cropDistribution[crop] || 0) + 1;
            }
            
            if (data.source === 'model') {
              metrics.pythonModelInvocations++;
            } else if (data.source === 'fallback') {
              metrics.fallbackInvocations++;
            }
          } catch (e) {
            console.error('Error parsing response:', e);
          }
        }
      }
    } else {
      // This was a failed request
      if (req.path.includes('/recommend')) {
        metrics.failedRecommendations++;
        
        // Track error types
        let errorMsg = 'Unknown Error';
        if (typeof body === 'string') {
          try {
            const data = JSON.parse(body);
            errorMsg = data.error || 'Unknown Error';
          } catch (e) {
            // Unable to parse, use default
          }
        }
        
        metrics.errors[errorMsg] = (metrics.errors[errorMsg] || 0) + 1;
      }
    }
    
    // Call the original send
    return originalSend.call(this, body);
  };
  
  next();
});

// Health check route with metrics
router.get('/health', (req, res) => {
  res.json({ 
    status: 'Crop recommendation service is running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: metrics.totalRequests,
      successRate: `${((metrics.successfulRecommendations / (metrics.successfulRecommendations + metrics.failedRecommendations)) * 100).toFixed(2)}%`,
      avgResponseTime: `${(metrics.responseTime.sum / metrics.responseTime.count).toFixed(2)}ms`,
      modelUsage: `${((metrics.pythonModelInvocations / (metrics.pythonModelInvocations + metrics.fallbackInvocations)) * 100).toFixed(2)}%`,
      fallbackRate: `${((metrics.fallbackInvocations / (metrics.pythonModelInvocations + metrics.fallbackInvocations)) * 100).toFixed(2)}%`
    }
  });
});

// Get a list of all supported crops
router.get('/supported-crops', (req, res) => {
  // This could be dynamically loaded from your model in the future
  const supportedCrops = [
    'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 
    'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 
    'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 
    'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee'
  ];
  
  res.json({ crops: supportedCrops });
});

// Crop recommendation route with enhanced logging and metrics
router.post('/recommend', async (req, res) => {
    const requestStartTime = performance.now();
    
    try {
      // Extract parameters from request body
      const { N, P, K, temperature, humidity, ph, rainfall, location } = req.body;
      
      // Log the request
      console.log(`[${new Date().toISOString()}] CROP REQUEST: ${JSON.stringify({ N, P, K, temperature, humidity, ph, rainfall, location })}`);
      
      // Validation
      if (N === undefined || P === undefined || K === undefined || 
          temperature === undefined || humidity === undefined || 
          ph === undefined || rainfall === undefined) {
        
        console.warn(`[${new Date().toISOString()}] VALIDATION ERROR: Missing parameters in request`);
        
        return res.status(400).json({ 
          error: 'Missing required parameters',
          requiredParams: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        });
      }
      
      // Set up options for PythonShell
      const options = {
        mode: 'json',
        pythonPath: 'python', // Use 'python3' for Linux/Mac
        scriptPath: path.join(__dirname, '../models'),
        args: [JSON.stringify({ N, P, K, temperature, humidity, ph, rainfall })]
      };
      
      console.log(`[${new Date().toISOString()}] INVOKING PYTHON: ${path.join(__dirname, '../models', 'crop_recommender.py')}`);
      
      const modelStartTime = performance.now();
      
      // Call Python script
      PythonShell.run('crop_recommender.py', options)
        .then(results => {
          const modelEndTime = performance.now();
          const modelDuration = modelEndTime - modelStartTime;
          
          // Track model response time
          metrics.modelResponseTime.sum += modelDuration;
          metrics.modelResponseTime.count++;
          metrics.modelResponseTime.max = Math.max(metrics.modelResponseTime.max, modelDuration);
          metrics.modelResponseTime.min = Math.min(metrics.modelResponseTime.min, modelDuration);
          
          console.log(`[${new Date().toISOString()}] MODEL RESPONSE TIME: ${modelDuration.toFixed(2)}ms`);
          
          if (!results || results.length === 0) {
            throw new Error('No results returned from Python script');
          }
          
          const result = results[0];
          console.log(`[${new Date().toISOString()}] PYTHON RESULT: ${JSON.stringify(result)}`);
          
          if (!result.success) {
            console.error(`[${new Date().toISOString()}] MODEL ERROR: ${result.error}`);
            throw new Error(result.error || 'Prediction failed');
          }
          
          // Add additional data that might be useful
          const enrichedRecommendations = result.recommendations.map(crop => {
            // Track which crops are being recommended for analytics
            const cropName = crop.name.toLowerCase();
            metrics.cropDistribution[cropName] = (metrics.cropDistribution[cropName] || 0) + 1;
            
            return {
              ...crop,
              details: getCropDetails(crop.name)
            };
          });
          
          // Return response with recommendations
          res.json({
            success: true,
            location: location || 'Unknown',
            inputParameters: { N, P, K, temperature, humidity, ph, rainfall },
            topRecommendation: result.predictedCrop,
            recommendations: enrichedRecommendations,
            source: result.source || 'model', // Indicates if it's from ML model or rule-based
            processingTime: {
              total: (performance.now() - requestStartTime).toFixed(2) + 'ms',
              model: modelDuration.toFixed(2) + 'ms'
            }
          });
          
          console.log(`[${new Date().toISOString()}] REQUEST COMPLETE: Success, model-based recommendation`);
        })
        .catch(err => {
          console.error(`[${new Date().toISOString()}] PYTHON ERROR: ${err.message}`);
          
          // Track error types
          const errorType = err.message || 'Unknown error';
          metrics.errors[errorType] = (metrics.errors[errorType] || 0) + 1;
          
          // Use hardcoded fallback recommendations as a last resort
          console.log(`[${new Date().toISOString()}] USING FALLBACK RECOMMENDATIONS`);
          const fallbackStartTime = performance.now();
          const fallbackRecommendations = generateFallbackRecommendations(N, P, K, temperature);
          const fallbackDuration = performance.now() - fallbackStartTime;
          
          // Track which crops are being recommended by fallback
          fallbackRecommendations.forEach(crop => {
            const cropName = crop.name.toLowerCase();
            metrics.cropDistribution[cropName] = (metrics.cropDistribution[cropName] || 0) + 1;
          });
          
          res.json({
            success: true,
            location: location || 'Unknown',
            inputParameters: { N, P, K, temperature, humidity, ph, rainfall },
            topRecommendation: fallbackRecommendations[0].name,
            recommendations: fallbackRecommendations.map(crop => ({
              ...crop,
              details: getCropDetails(crop.name)
            })),
            source: 'fallback', // Indicates it's a JS fallback
            warning: 'Using fallback recommendations due to model error: ' + err.message,
            processingTime: {
              total: (performance.now() - requestStartTime).toFixed(2) + 'ms',
              fallback: fallbackDuration.toFixed(2) + 'ms'
            }
          });
          
          console.log(`[${new Date().toISOString()}] REQUEST COMPLETE: Success, fallback-based recommendation`);
        });
    } catch (error) {
      const errorType = error.message || 'Unknown error';
      metrics.errors[errorType] = (metrics.errors[errorType] || 0) + 1;
      
      console.error(`[${new Date().toISOString()}] SERVER ERROR: ${error.message}`);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        processingTime: (performance.now() - requestStartTime).toFixed(2) + 'ms'
      });
      
      console.log(`[${new Date().toISOString()}] REQUEST COMPLETE: Failed with server error`);
    }
});

// Add this helper function for the Node.js fallback
function generateFallbackRecommendations(N, P, K, temperature) {
  console.log(`[${new Date().toISOString()}] FALLBACK LOGIC: Generating recommendations based on temp=${temperature}, N=${N}, P=${P}, K=${K}`);
  
  // Very simple fallback logic based on temperature
  if (temperature > 30) {
    return [
      { name: "rice", confidence: 85, suitability: "Highly Suitable" },
      { name: "cotton", confidence: 80, suitability: "Highly Suitable" },
      { name: "maize", confidence: 75, suitability: "Suitable" },
      { name: "banana", confidence: 70, suitability: "Suitable" },
      { name: "mango", confidence: 65, suitability: "Moderately Suitable" }
    ];
  } else if (temperature > 20) {
    return [
      { name: "wheat", confidence: 85, suitability: "Highly Suitable" },
      { name: "maize", confidence: 80, suitability: "Highly Suitable" },
      { name: "chickpea", confidence: 75, suitability: "Suitable" },
      { name: "lentil", confidence: 70, suitability: "Suitable" },
      { name: "pomegranate", confidence: 65, suitability: "Moderately Suitable" }
    ];
  } else {
    return [
      { name: "apple", confidence: 85, suitability: "Highly Suitable" },
      { name: "orange", confidence: 80, suitability: "Highly Suitable" },
      { name: "peas", confidence: 75, suitability: "Suitable" },
      { name: "potato", confidence: 70, suitability: "Suitable" },
      { name: "grapes", confidence: 65, suitability: "Moderately Suitable" }
    ];
  }
}

// Helper function to get crop details
function getCropDetails(cropName) {
  // This could be loaded from a database or another source
  const cropDetails = {
    'rice': {
      season: 'Monsoon',
      waterRequirement: 'High',
      growthPeriod: '3-6 months',
      soilPreference: 'Clay loam soil',
      nutritionalValue: 'High in carbohydrates, contains some protein'
    },
    'wheat': {
      season: 'Winter',
      waterRequirement: 'Medium',
      growthPeriod: '4-5 months',
      soilPreference: 'Loamy soil',
      nutritionalValue: 'Rich in carbohydrates and proteins'
    },
    'maize': {
      season: 'Summer',
      waterRequirement: 'Medium',
      growthPeriod: '3-4 months',
      soilPreference: 'Well-drained soil',
      nutritionalValue: 'Rich in carbohydrates, proteins and vitamins'
    },
    // Add details for other crops as needed
  };
  
  return cropDetails[cropName.toLowerCase()] || {
    season: 'Information not available',
    waterRequirement: 'Information not available',
    growthPeriod: 'Information not available',
    soilPreference: 'Information not available',
    nutritionalValue: 'Information not available'
  };
}

// Route to get detailed information about a specific crop
router.get('/details/:cropName', (req, res) => {
  const requestStartTime = performance.now();
  const { cropName } = req.params;
  
  console.log(`[${new Date().toISOString()}] CROP DETAILS REQUEST: ${cropName}`);
  
  if (!cropName) {
    console.warn(`[${new Date().toISOString()}] VALIDATION ERROR: Missing crop name`);
    return res.status(400).json({ error: 'Crop name is required' });
  }
  
  const cropDetails = getCropDetails(cropName);
  
  res.json({
    name: cropName,
    details: cropDetails,
    processingTime: (performance.now() - requestStartTime).toFixed(2) + 'ms'
  });
  
  console.log(`[${new Date().toISOString()}] CROP DETAILS COMPLETE: ${cropName}`);
});

// Route to get crop recommendations based on user profile
router.get('/user-recommendations/:userId', async (req, res) => {
  const requestStartTime = performance.now();
  try {
    const { userId } = req.params;
    
    console.log(`[${new Date().toISOString()}] USER RECOMMENDATIONS REQUEST: userId=${userId}`);
    
    // Here you would:
    // 1. Fetch user's location, soil data etc. from database
    // 2. Get local climate data
    // 3. Run the recommendation algorithm
    
    res.json({
      message: 'User-specific recommendations - To be implemented',
      userId,
      processingTime: (performance.now() - requestStartTime).toFixed(2) + 'ms'
    });
    
    console.log(`[${new Date().toISOString()}] USER RECOMMENDATIONS COMPLETE: userId=${userId}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] USER RECOMMENDATIONS ERROR: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to get user recommendations',
      processingTime: (performance.now() - requestStartTime).toFixed(2) + 'ms'
    });
  }
});

// New route to get metrics
router.get('/metrics', (req, res) => {
  const avgResponseTime = metrics.responseTime.count > 0 
    ? (metrics.responseTime.sum / metrics.responseTime.count).toFixed(2)
    : 0;
    
  const avgModelResponseTime = metrics.modelResponseTime.count > 0
    ? (metrics.modelResponseTime.sum / metrics.modelResponseTime.count).toFixed(2)
    : 0;
    
  const successRate = (metrics.successfulRecommendations + metrics.failedRecommendations) > 0
    ? ((metrics.successfulRecommendations / (metrics.successfulRecommendations + metrics.failedRecommendations)) * 100).toFixed(2)
    : 0;
    
  const modelUsageRate = (metrics.pythonModelInvocations + metrics.fallbackInvocations) > 0
    ? ((metrics.pythonModelInvocations / (metrics.pythonModelInvocations + metrics.fallbackInvocations)) * 100).toFixed(2)
    : 0;
  
  res.json({
    timestamp: new Date().toISOString(),
    lastReset: metrics.lastReset,
    requests: {
      total: metrics.totalRequests,
      successful: metrics.successfulRecommendations,
      failed: metrics.failedRecommendations,
      successRate: `${successRate}%`
    },
    performance: {
      averageResponseTime: `${avgResponseTime}ms`,
      maxResponseTime: `${metrics.responseTime.max.toFixed(2)}ms`,
      minResponseTime: metrics.responseTime.count > 0 ? `${metrics.responseTime.min.toFixed(2)}ms` : 'N/A',
      averageModelTime: `${avgModelResponseTime}ms`,
      maxModelTime: `${metrics.modelResponseTime.max.toFixed(2)}ms`,
      minModelTime: metrics.modelResponseTime.count > 0 ? `${metrics.modelResponseTime.min.toFixed(2)}ms` : 'N/A'
    },
    modelUsage: {
      pythonModel: metrics.pythonModelInvocations,
      fallbackSystem: metrics.fallbackInvocations,
      modelUsageRate: `${modelUsageRate}%`,
      fallbackRate: `${(100 - modelUsageRate).toFixed(2)}%`
    },
    cropDistribution: metrics.cropDistribution,
    errors: metrics.errors
  });
});

// Route to reset metrics
router.post('/metrics/reset', (req, res) => {
  // Reset all metrics
  metrics.totalRequests = 0;
  metrics.successfulRecommendations = 0;
  metrics.failedRecommendations = 0;
  metrics.pythonModelInvocations = 0;
  metrics.fallbackInvocations = 0;
  metrics.responseTime = { sum: 0, count: 0, max: 0, min: Number.MAX_VALUE };
  metrics.modelResponseTime = { sum: 0, count: 0, max: 0, min: Number.MAX_VALUE };
  metrics.cropDistribution = {};
  metrics.errors = {};
  metrics.lastReset = new Date().toISOString();
  
  console.log(`[${new Date().toISOString()}] METRICS RESET: All metrics have been reset`);
  
  res.json({
    success: true,
    message: 'Metrics have been reset',
    timestamp: metrics.lastReset
  });
});

module.exports = router;