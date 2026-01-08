const mongoose = require('mongoose');

// Answer Schema
const AnswerSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true
  },
  author: {
    type: String,
 
  },
  location: {
    type: String,

  },
  date: {
    type: Date,
    default: Date.now
  },
  upvotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Question Schema
const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: String,
  },
  location: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: true,
    enum: ['crop-planning', 'pest-control', 'soil-health', 'weather', 'irrigation', 'subsidies', 'market-prices', 'equipment', 'other']
  },
  upvotes: {
    type: Number,
    default: 0
  },
  answers: [AnswerSchema]
}, {
  timestamps: true
});

// Helper method to format the date for frontend display
QuestionSchema.methods.getFormattedDate = function() {
  const now = new Date();
  const diff = now - this.date;
  
  // Convert milliseconds to days/hours/minutes
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'Just now';
  }
};

// Apply the same date formatting for answers
AnswerSchema.methods.getFormattedDate = QuestionSchema.methods.getFormattedDate;

// Create model with explicit collection name 'Chat'
module.exports = mongoose.model('Question', QuestionSchema, 'Chat');
