const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');

const app = express();
const port = 8080;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/journalDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Define schema for user profiles and journal entries
const journalEntrySchema = new mongoose.Schema({
    entry: String,
    date: String
});

const userProfileSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    journal: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }]
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// Middleware setup
app.use(session({
    secret: 'your_secret_key', // Replace with a secure key
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.set('view engine', 'ejs');
app.use('/static', express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));

// HOMEPAGE - Only accessible if the user is logged in
app.get('/', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }

    try {
        const userProfile = await UserProfile.findById(user._id).populate('journal');
        const journalEntries = userProfile.journal;
        res.render('index.ejs', { journalEntries });
    } catch (err) {
        console.error('Error retrieving journal entries:', err);
        res.status(500).send('Error retrieving journal entries');
    }
});

// LOGIN ROUTE
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userProfile = await UserProfile.findOne({ username });
        if (userProfile && userProfile.password === password) {
            req.session.user = userProfile;
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

// REGISTER ROUTE - Serve the registration form
app.get('/register', (req, res) => {
    res.render('register.ejs');
});

// REGISTER ROUTE - Handle new user registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await UserProfile.findOne({ username });
        if (existingUser) {
            req.flash('error', 'Username already exists.');
            return res.redirect('/register');
        }

        const newUser = new UserProfile({ username, password });
        await newUser.save();
        
        // Automatically log in the user after registration
        req.session.user = newUser;
        res.redirect('/');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

// Render the profile page (must be logged in)
app.get('/profile', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to view your profile.');
        return res.redirect('/login');
    }

    try {
        const userProfile = await UserProfile.findById(user._id).populate('journal');
        res.render('profile', { userProfile });
    } catch (err) {
        console.error('Error retrieving profile:', err);
        res.status(500).send('Error retrieving profile');
    }
});

// Route to render journal.ejs with previous journal entries
app.get('/journal', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to access the journal.');
        return res.redirect('/login');
    }

    try {
        const userProfile = await UserProfile.findById(user._id).populate('journal');
        const journalEntries = userProfile.journal;
        res.render('journal.ejs', { journalEntries });
    } catch (err) {
        console.error('Error retrieving journal entries:', err);
        res.status(500).send('Error retrieving journal entries');
    }
});

// POST /create-entry - Add a new journal entry to the database
app.post('/create-entry', async (req, res) => {
    const { entry } = req.body; // Retrieve the submitted journal entry content
    const user = req.session.user;

    if (!user) {
        req.flash('error', 'You must be logged in to create journal entries.');
        return res.redirect('/login');
    }

    try {
        // Create a new journal entry
        const newEntry = new JournalEntry({
            entry: entry,
            date: new Date().toLocaleString()
        });

        // Save the new journal entry to the database
        const savedEntry = await newEntry.save();

        // Add the new journal entry to the user's profile
        const userProfile = await UserProfile.findById(user._id);
        userProfile.journal.push(savedEntry._id);
        await userProfile.save();

        // Redirect back to the journal page with the updated list of entries
        res.redirect('/journal');
    } catch (err) {
        console.error('Error saving journal entry:', err);
        res.status(500).send('Error saving journal entry');
    }
});

// Route to display a specific journal entry based on its ID
app.get('/journal/:id', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to view journal entries.');
        return res.redirect('/login');
    }

    const entryId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
        return res.status(400).send('Invalid journal entry ID');
    }

    try {
        const entry = await JournalEntry.findById(entryId);
        const userProfile = await UserProfile.findById(user._id).populate('journal');

        if (!entry) {
            return res.status(404).send('Journal entry not found');
        }

        // Check if the journal entry belongs to the current user
        if (!userProfile.journal.some(j => j._id.toString() === entry._id.toString())) {
            return res.status(403).send('You do not have permission to view this journal entry.');
        }

        // Pass all the journal entries to the view so that the sidebar is consistent
        const journalEntries = userProfile.journal;
        
        // Render the specific journal entry in journal-view.ejs
        res.render('journal-view.ejs', { entry, journalEntries });
    } catch (err) {
        console.error('Error retrieving journal entry:', err);
        res.status(500).send('Error retrieving journal entry');
    }
});

// Route to render other views like To-Do List, Goals, Meals, and Email (optional based on your requirements)
app.get('/to-do-list', (req, res) => {
    res.render('to-do-list.ejs');
});
app.get('/goals', (req, res) => {
    res.render('goals.ejs');
});
app.get('/meals', (req, res) => {
    res.render('meals.ejs');
});
app.get('/email', (req, res) => {
    res.render('email.ejs');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});