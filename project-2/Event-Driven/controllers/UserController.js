const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const userEvents = require('../events/UserEvents');

// Home Page Route (Protected)
router.get('/', async (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }

    try {
        const userProfile = await UserProfile.findById(req.session.user._id).populate('journal');
        const journalEntries = userProfile.journal;
        res.render('index', { journalEntries });
    } catch (err) {
        console.error('Error retrieving journal entries:', err);
        res.status(500).send('Error retrieving journal entries');
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// Register Page
router.get('/register', (req, res) => {
    res.render('register');
});

// Additional Protected Routes

// Goals Page
router.get('/goals', (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }
    res.render('goals');
});

// Meals Page
router.get('/meals', (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }
    res.render('meals');
});

// Email Page
router.get('/email', (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }
    res.render('email');
});

// To-do list page
router.get('/to-do-list', (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }
    res.render('to-do-list');
});

// Logging in to the website
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userProfile = await UserProfile.findOne({ username });
        if (userProfile && userProfile.password === password) {
            req.session.user = userProfile;
            userEvents.emit('user:login', userProfile);  // Emit login event
            return res.redirect('/');
        } else {
            req.flash('error', 'Invalid username or password.');
            return res.redirect('/login');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
});

// Creating a new account
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await UserProfile.findOne({ username });
        if (existingUser) {
            req.flash('error', 'Username already exists.');
            return res.redirect('/register');
        }

        const newUser = new UserProfile({ username, password });
        await newUser.save();

        req.session.user = newUser;
        userEvents.emit('user:register', newUser);  // Emit register event
        res.redirect('/');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

module.exports = router;