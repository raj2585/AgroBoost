const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

// Get weather by city name
router.get('/city/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;
    const weatherData = await weatherService.getWeatherData({ query: cityName });
    res.json(weatherData);
  } catch (error) {
    console.error('Error in /weather/city route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

// Get weather by coordinates
router.get('/coordinates', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const weatherData = await weatherService.getWeatherData({ 
      lat: parseFloat(lat), 
      lon: parseFloat(lon) 
    });
    
    res.json(weatherData);
  } catch (error) {
    console.error('Error in /weather/coordinates route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

// Format weather data for the dashboard
router.get('/dashboard', async (req, res) => {
  try {
    let params = {};
    
    // Determine search method
    if (req.query.city) {
      params.query = req.query.city;
    } else if (req.query.lat && req.query.lon) {
      params.lat = parseFloat(req.query.lat);
      params.lon = parseFloat(req.query.lon);
    } else {
      return res.status(400).json({ error: 'City name required' });
    }
    
    // Get complete weather data
    const weatherData = await weatherService.getWeatherData(params);
    
    // Format for dashboard
    const dashboardData = {
      location: {
        city: weatherData.location.city,
        state: weatherData.location.state,
        country: weatherData.location.country
      },
      current: {
        temperature: Math.round(weatherData.current.temperature.metric),
        condition: weatherData.current.weatherText,
        icon: weatherData.current.weatherIcon,
        isDayTime: weatherData.current.isDayTime,
        humidity: weatherData.current.relativeHumidity,
        wind: {
          speed: Math.round(weatherData.current.wind.speed.metric),
          direction: weatherData.current.wind.direction
        },
        precipitation: weatherData.current.precipitation
      },
      forecast: weatherData.forecast.map((day, index) => {
        const date = new Date(day.date);
        let dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // For the first day, use "Today" instead of the day name
        if (index === 0) {
          dayName = 'Today';
        } else if (index === 1) {
          dayName = 'Tomorrow';
        }
        
        return {
          day: dayName,
          temp: Math.round((day.temperature.min + day.temperature.max) / 2),
          condition: day.day.iconPhrase,
          icon: day.day.icon
        };
      })
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error in /weather/dashboard route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

router.get('/metrics', (req, res) => {
  res.json(weatherService.getMetrics());
});

router.get('/cache', (req, res) => {
  res.json(weatherService.getCacheStats());
});

router.post('/metrics/reset', (req, res) => {
  weatherService.resetMetrics();
  res.json({ message: 'Metrics reset successful' });
});

// Add a dedicated route for alerts
router.get('/alerts', async (req, res) => {
  try {
    let params = {};
    
    // Determine search method
    if (req.query.city) {
      params.query = req.query.city;
    } else if (req.query.lat && req.query.lon) {
      params.lat = parseFloat(req.query.lat);
      params.lon = parseFloat(req.query.lon);
    } else {
      return res.status(400).json({ error: 'City name or coordinates are required' });
    }
    
    // Get the location key first
    const location = await weatherService.getLocationKey(params);
    
    // Then get alerts
    //const alerts = await weatherService.getAlerts(location.key);
    const alerts = [];
    
    res.json({
      location: {
        city: location.city,
        state: location.state,
        country: location.country
      },
      alerts
    });
  } catch (error) {
    console.error('Error in /weather/alerts route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather alerts',
      message: error.message
    });
  }
});

module.exports = router;
