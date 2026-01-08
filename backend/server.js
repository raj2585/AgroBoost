const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const weatherRoutes = require('./routes/weather');
const userRoutes = require('./routes/userRoute');
const cropRoutes = require('./routes/cropRoute'); 
const forumRoutes = require('./routes/forumRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agroboost';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit with failure
});

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/user', userRoutes);
app.use('/api', forumRoutes);

app.use('/api/crops', cropRoutes);
app.get('/', (req, res) => {
    res.send('AgroBoost API is running');
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server only after DB connection is established
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});