const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

router.post('/signup', async (req, res) => {
    try{
        const user = await userService.addUser(req.body);
        res.json(user);
    }catch(error){
        console.error('Error in /user/signup route:', error);
        res.status(500).json({
            error: 'Failed to create user',
            message: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try{
        const {number} = req.params;
        console.log('Number:', number);
        const user = await userService.getUser(number);
        res.json(user);
    }catch(error){
        console.error('Error in /user/login route:', error);
        res.status(500).json({
            error: 'Failed to login',
            message: error.message
        });
    }
});

router.post('/add-data', async (req, res) => {
    try{
        const {number} = req.params;
        console.log('Number:', number);
        const user = await userService.getUser(number);
        res.json(user);
    }catch(error){
        console.error('Error in /user/add-data route:', error);
        res.status(500).json({
            error: 'Failed to add data',
            message: error.message
        });
    }
}
); 

module.exports = router;