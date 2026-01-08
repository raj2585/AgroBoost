const axios = require('axios');
const NodeCache = require('node-cache');

// Cache setup (TTL in seconds)
// 30 minutes for location data, 1 hour for weather data
const weatherCache = new NodeCache({ 
  stdTTL: 3600, // 1 hour default TTL
  checkperiod: 600 // Check for expired keys every 10 minutes
});

const metrics = {
  apiCalls: { total: 0, successful: 0, failed: 0 },
  cacheHits: 0,
  cacheMisses: 0,
  responseTime: { sum: 0, count: 0, max: 0, min: Number.MAX_VALUE },
  endpoints: {},
  errors: {}
};

const logMetrics = (operation, startTime, isSuccess, endpoint, errorType = null) => {
  const duration = performance.now() - startTime;
  
  // Update global metrics
  metrics.apiCalls.total++;
  isSuccess ? metrics.apiCalls.successful++ : metrics.apiCalls.failed++;
  
  // Update timing metrics
  metrics.responseTime.sum += duration;
  metrics.responseTime.count++;
  metrics.responseTime.max = Math.max(metrics.responseTime.max, duration);
  metrics.responseTime.min = Math.min(metrics.responseTime.min, duration);
  
  // Track by endpoint
  if (!metrics.endpoints[endpoint]) {
    metrics.endpoints[endpoint] = { calls: 0, successes: 0, failures: 0, totalTime: 0 };
  }
  metrics.endpoints[endpoint].calls++;
  metrics.endpoints[endpoint].totalTime += duration;
  isSuccess ? metrics.endpoints[endpoint].successes++ : metrics.endpoints[endpoint].failures++;
  
  // Track errors by type
  if (errorType) {
    if (!metrics.errors[errorType]) metrics.errors[errorType] = 0;
    metrics.errors[errorType]++;
  }
  
  console.log({
    timestamp: new Date().toISOString(),
    operation,
    endpoint,
    durationMs: duration.toFixed(2),
    success: isSuccess,
    error: errorType,
    cacheStats: {
      hits: metrics.cacheHits,
      misses: metrics.cacheMisses,
      hitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0
    },
    avgResponseTime: (metrics.responseTime.sum / metrics.responseTime.count).toFixed(2)
  });
};

// AccuWeather API configuration
const API_KEY = 'zXh2eI4QkXMEgw2CyfdNMmzKReZfgLQ4';
const BASE_URL = 'http://dataservice.accuweather.com';

/**
 * Get location key from coordinates or text
 * @param {Object} params - Search parameters
 * @param {string} params.query - City name or postal code
 * @param {number} params.lat - Latitude
 * @param {number} params.lon - Longitude
 */
async function getLocationKey(params) {
  const startTime = performance.now();
  const endpoint = 'locations/search';
  try {
    const cacheKey = params.query 
      ? `location_${params.query}` 
      : `location_${params.lat}_${params.lon}`;
    
    // Check cache first
    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      console.log('Location data from cache');
      logMetrics('getLocationKey', startTime, true, endpoint);
      return cachedData;
    }

    metrics.cacheMisses++;
    console.log(`CACHE MISS: Location data for ${cacheKey}`);
    
    
    let url;
    if (params.query) {
      // Search by text (city name or postal code)
      url = `${BASE_URL}/locations/v1/cities/search`;
      params = { q: params.query, apikey: API_KEY };
    } else if (params.lat && params.lon) {
      // Search by coordinates
      url = `${BASE_URL}/locations/v1/cities/geoposition/search`;
      params = { q: `${params.lat},${params.lon}`, apikey: API_KEY };
    } else {
      throw new Error('Invalid location parameters');
    }
    
    console.log(`API REQUEST: ${url} with params: ${JSON.stringify(params)}`);
    const apiStartTime = performance.now();
    const response = await axios.get(url, { params });
    const apiDuration = performance.now() - apiStartTime;
    console.log(`API RESPONSE TIME: ${apiDuration.toFixed(2)}ms for ${url}`);
    
    
    if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
      throw new Error('Location not found');
    }
    
    // Extract location data
    const locationData = Array.isArray(response.data) ? response.data[0] : response.data;
    
    const result = {
      key: locationData.Key,
      city: locationData.LocalizedName,
      state: locationData.AdministrativeArea?.LocalizedName || '',
      country: locationData.Country?.LocalizedName || '',
      timezone: locationData.TimeZone?.Name || '',
    };
    
    // Cache the result with a TTL of 30 days
    weatherCache.set(cacheKey, result, 2592000); // 30 days in seconds
    logMetrics('getLocationKey', startTime, true, endpoint);
    return result;
  } catch (error) {
    const errorType = error.message || 'Unknown error';
    console.error('Error fetching location key:', error);
    logMetrics('getLocationKey', startTime, false, endpoint, errorType);
    throw error;
  }
}

/**
 * Get current weather conditions
 * @param {string} locationKey - AccuWeather location key
 */
async function getCurrentConditions(locationKey) {
  const startTime = performance.now();
  const endpoint = 'currentconditions';
  try {
    const cacheKey = `current_${locationKey}`;
    
    // Check cache first
    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      metrics.cacheHits++;
      console.log(`CACHE HIT: Current conditions for ${locationKey}`);
      logMetrics('getCurrentConditions', startTime, true, endpoint);
      return cachedData;
    }

    metrics.cacheMisses++;
    console.log(`CACHE MISS: Current conditions for ${locationKey}`);
    
    const url = `${BASE_URL}/currentconditions/v1/${locationKey}`;
    const params = { apikey: API_KEY, details: true };
    
    console.log(`API REQUEST: ${url}`);
    const apiStartTime = performance.now();
    const response = await axios.get(url, { params });
    const apiDuration = performance.now() - apiStartTime;
    console.log(`API RESPONSE TIME: ${apiDuration.toFixed(2)}ms for ${url}`);
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Current conditions not available');
    }
    
    const currentData = response.data[0];
    
    const result = {
      temperature: {
        metric: currentData.Temperature.Metric.Value,
        imperial: currentData.Temperature.Imperial.Value
      },
      weatherText: currentData.WeatherText,
      weatherIcon: currentData.WeatherIcon,
      isDayTime: currentData.IsDayTime,
      relativeHumidity: currentData.RelativeHumidity,
      wind: {
        speed: {
          metric: currentData.Wind.Speed.Metric.Value,
          imperial: currentData.Wind.Speed.Imperial.Value
        },
        direction: currentData.Wind.Direction.Degrees
      },
      precipitation: currentData.HasPrecipitation,
      precipitationType: currentData.PrecipitationType || null,
      observationTime: currentData.LocalObservationDateTime
    };
    
    // Cache the result for 1 hour
    weatherCache.set(cacheKey, result, 3600); // 1 hour in seconds
    logMetrics('getCurrentConditions', startTime, true, endpoint);
    return result;
  } catch (error) {
    const errorType = error.message || 'Unknown error';
    console.error('Error fetching current conditions:', error);
    logMetrics('getCurrentConditions', startTime, false, endpoint, errorType);
    throw error;
  }
}

/**
 * Get 5-day forecast
 * @param {string} locationKey - AccuWeather location key
 */
async function getForecast(locationKey) {
  try {
    const cacheKey = `forecast_${locationKey}`;
    
    // Check cache first
    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      console.log('Forecast from cache');
      return cachedData;
    }
    
    const url = `${BASE_URL}/forecasts/v1/daily/5day/${locationKey}`;
    const params = { apikey: API_KEY, metric: true };
    
    const response = await axios.get(url, { params });
    
    if (!response.data || !response.data.DailyForecasts) {
      throw new Error('Forecast not available');
    }
    
    const forecastData = response.data.DailyForecasts;
    
    const result = forecastData.map(day => ({
      date: day.Date,
      temperature: {
        min: day.Temperature.Minimum.Value,
        max: day.Temperature.Maximum.Value
      },
      day: {
        icon: day.Day.Icon,
        iconPhrase: day.Day.IconPhrase,
        hasPrecipitation: day.Day.HasPrecipitation,
        precipitationType: day.Day.PrecipitationType || null,
        precipitationIntensity: day.Day.PrecipitationIntensity || null
      },
      night: {
        icon: day.Night.Icon,
        iconPhrase: day.Night.IconPhrase,
        hasPrecipitation: day.Night.HasPrecipitation,
        precipitationType: day.Night.PrecipitationType || null,
        precipitationIntensity: day.Night.PrecipitationIntensity || null
      }
    }));
    
    // Cache the result for 3 hours
    weatherCache.set(cacheKey, result, 10800); // 3 hours in seconds
    
    return result;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

/**
 * Get weather alerts for a location
 * @param {string} locationKey - AccuWeather location key
 */
async function getAlerts(locationKey) {
  const startTime = performance.now();
  const endpoint = 'alerts';
  
  try {
    const cacheKey = `alerts_${locationKey}`;
    // Check cache first (shorter TTL for alerts as they are time-sensitive)
    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      metrics.cacheHits++;
      console.log(`CACHE HIT: Alerts for ${locationKey}`);
      logMetrics('getAlerts', startTime, true, endpoint);
      return cachedData;
    }
    
    metrics.cacheMisses++;
    console.log(`CACHE MISS: Alerts for ${locationKey}`);
    
    const url = `${BASE_URL}/alerts/v1/${locationKey}`;
    const params = { apikey: API_KEY, language: 'en-us', details: true };
    
    console.log(`API REQUEST: ${url}`);
    const apiStartTime = performance.now();
    const response = await axios.get(url, { params });
    const apiDuration = performance.now() - apiStartTime;
    console.log(`API RESPONSE TIME: ${apiDuration.toFixed(2)}ms for ${url}`);
    
    // If no alerts, return empty array
    if (!response.data) {
      return [];
    }
    //Process alerts data
    const alerts = Array.isArray(response.data) ? response.data : [response.data];

    const result = alerts.map(alert => ({
      alertID: alert.AlertID || '',
      alertType: alert.AlertType || '',
      severity: alert.Severity || 0,
      headline: alert.Headline || '',
      description: alert.Description || '',
      area: alert.Area?.Name || '',
      source: alert.Source || '',
      startTime: alert.StartTime || null,
      endTime: alert.EndTime || null,
      category: alert.Category || ''
    }));
    
    // Cache alerts for 30 minutes (alerts are time-sensitive)
    weatherCache.set(cacheKey, result, 1800); // 30 minutes in seconds
    
    logMetrics('getAlerts', startTime, true, endpoint);
    return result;
  } catch (error) {
    const errorType = error.message || 'Unknown error';
    console.error('Error fetching alerts:', error);
    logMetrics('getAlerts', startTime, false, endpoint, errorType);
    return [];
  }
}

/**
 * Get consolidated weather data (current + forecast + alerts)
 * @param {Object} params - Search parameters
 */
async function getWeatherData(params) {
  try {
    // First get the location key
    const location = await getLocationKey(params);
    
    // Then get current conditions, forecast, and alerts in parallel
    const [current, forecast, alerts] = await Promise.all([
      getCurrentConditions(location.key),
      getForecast(location.key)
    ]);
    
    return {
      location,
      current,
      forecast,
      alerts
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

function getMetrics() {
  return {
    ...metrics,
    timestamp: new Date().toISOString(),
    averageResponseTime: metrics.responseTime.count > 0 
      ? (metrics.responseTime.sum / metrics.responseTime.count).toFixed(2) + 'ms'
      : '0ms',
    cacheEfficiency: {
      hits: metrics.cacheHits,
      misses: metrics.cacheMisses,
      total: metrics.cacheHits + metrics.cacheMisses,
      hitRate: ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2) + '%'
    },
    successRate: ((metrics.apiCalls.successful / metrics.apiCalls.total) * 100).toFixed(2) + '%'
  };
}


// Reset metrics (e.g., for time-windowed reporting)
function resetMetrics() {
  metrics.apiCalls = { total: 0, successful: 0, failed: 0 };
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
  metrics.responseTime = { sum: 0, count: 0, max: 0, min: Number.MAX_VALUE };
  metrics.endpoints = {};
  metrics.errors = {};
  console.log('Metrics have been reset');
}

function getCacheStats() {
  return {
    keys: weatherCache.keys(),
    stats: weatherCache.getStats(),
    hitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0
  };
}

module.exports = {
  getLocationKey,
  getCurrentConditions,
  getForecast,
  getAlerts,
  getWeatherData
};
