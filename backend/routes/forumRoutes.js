const express = require('express');
const router = express.Router();
const forumService = require('../services/forumService');

// Question routes
router.get('/questions', async (req, res) => {
    try {
        const questions = await forumService.getAllQuestions();
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch questions', 
            message: error.message 
        });
    }
});

router.get('/questions/:id', async (req, res) => {
    try {
        const question = await forumService.getQuestionById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ 
            error: 'Failed to fetch question', 
            message: error.message 
        });
    }
});

router.post('/questions', async (req, res) => {
    try {
        const newQuestion = await forumService.createQuestion(req.body);
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ 
            error: 'Failed to create question', 
            message: error.message 
        });
    }
});

router.post('/questions/:id/answers', async (req, res) => {
    try {
        const newAnswer = await forumService.addAnswer(req.params.id, req.body);
        res.status(201).json(newAnswer);
    } catch (error) {
        console.error('Error adding answer:', error);
        res.status(500).json({ 
            error: 'Failed to add answer', 
            message: error.message 
        });
    }
});

router.post('/questions/:id/upvote', async (req, res) => {
    try {
        const result = await forumService.upvoteQuestion(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error upvoting question:', error);
        res.status(500).json({ 
            error: 'Failed to upvote question', 
            message: error.message 
        });
    }
});

router.post('/answers/:id/upvote', async (req, res) => {
    try {
        const result = await forumService.upvoteAnswer(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error upvoting answer:', error);
        res.status(500).json({ 
            error: 'Failed to upvote answer', 
            message: error.message 
        });
    }
});

module.exports = router;
