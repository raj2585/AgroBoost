const Question = require('../models/forum');

// Format question/answer for frontend
const formatQuestion = (question) => {
    return {
        id: question._id,
        title: question.title,
        body: question.body,
        author: question.author,
        location: question.location,
        date: question.getFormattedDate(),
        category: question.category,
        upvotes: question.upvotes,
        answers: question.answers.map(answer => ({
            id: answer._id,
            body: answer.body,
            author: answer.author,
            location: answer.location,
            date: answer.getFormattedDate ? answer.getFormattedDate() : 'Just now',
            upvotes: answer.upvotes
        }))
    };
};

// Check MongoDB connection
const checkMongoConnection = () => {
    if (Question.db.readyState !== 1) {
        throw new Error('MongoDB connection not established');
    }
};

// Get all questions
exports.getAllQuestions = async () => {
    try {
        checkMongoConnection();
        
        // Use populate to ensure answers are fully loaded
        const questions = await Question.find().sort({ createdAt: -1 });
        return questions.map(question => formatQuestion(question));
    } catch (error) {
        console.error('Error in getAllQuestions:', error);
        throw error;
    }
};

// Get question by ID
exports.getQuestionById = async (id) => {
    try {
        checkMongoConnection();
        
        // Ensure answers are populated
        const question = await Question.findById(id);
        if (!question) return null;
        return formatQuestion(question);
    } catch (error) {
        console.error('Error in getQuestionById:', error);
        throw error;
    }
};

// Create a new question
exports.createQuestion = async (questionData) => {
    try {
        checkMongoConnection();
        
        const { title, body, category, author, location } = questionData;
        
        console.log("Received question data:", questionData); // Log incoming data for debugging
        
        // Improved validation with better error messages
        // if (!title) throw new Error('Question title is required');
        // if (!body) throw new Error('Question body is required');
        // if (!category) throw new Error('Question category is required');
        // if (!author) throw new Error('Author name is required');
        // if (!location) throw new Error('Location is required');
        
        const newQuestion = new Question({
            title,
            body,
            category,
            author,
            location,
            date: new Date(),
            upvotes: 0,
            answers: []
        });
        
        const savedQuestion = await newQuestion.save();
        return formatQuestion(savedQuestion);
    } catch (error) {
        console.error('Error in createQuestion:', error);
        throw error;
    }
};

// Add an answer to a question
exports.addAnswer = async (questionId, answerData) => {
    try {
        checkMongoConnection();
        
        const { body, author, location } = answerData;
        
        
        const question = await Question.findById(questionId);
        
        if (!question) {
            throw new Error('Question not found');
        }
        
        const newAnswer = {
            body,
            author,
            location,
            date: new Date(),
            upvotes: 0
        };
        
        question.answers.push(newAnswer);
        await question.save();
        
        // Return the newly created answer
        const createdAnswer = question.answers[question.answers.length - 1];
        
        return {
            id: createdAnswer._id,
            body: createdAnswer.body,
            author: createdAnswer.author,
            location: createdAnswer.location,
            date: 'Just now',
            upvotes: createdAnswer.upvotes
        };
    } catch (error) {
        console.error('Error in addAnswer:', error);
        throw error;
    }
};

// Upvote a question
exports.upvoteQuestion = async (questionId) => {
    try {
        checkMongoConnection();
        
        const question = await Question.findById(questionId);
        
        if (!question) {
            throw new Error('Question not found');
        }
        
        question.upvotes += 1;
        await question.save();
        
        return { upvotes: question.upvotes };
    } catch (error) {
        console.error('Error in upvoteQuestion:', error);
        throw error;
    }
};

// Upvote an answer
exports.upvoteAnswer = async (questionId, answerId) => {
    try {
        checkMongoConnection();
        
        const question = await Question.findOne({ 'answers._id': answerId });
        
        if (!question) {
            throw new Error('Answer not found');
        }
        
        const answer = question.answers.id(answerId);
        
        if (!answer) {
            throw new Error('Answer not found');
        }
        
        answer.upvotes += 1;
        await question.save();
        
        return { upvotes: answer.upvotes };
    } catch (error) {
        console.error('Error in upvoteAnswer:', error);
        throw error;
    }
};
