// Express.js file for handling all script actions for the website

// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');

const app = express();
const port = 8080;

// Connect to the Mongo Database
mongoose.connect('mongodb://localhost:27017/journalDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));


// Schema journal entries
const journalEntrySchema = new mongoose.Schema(
{
    entry: String,
    date: String
});

// Schema for each user's profile
const userProfileSchema = new mongoose.Schema(
{
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    journal: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }]
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// Middleware setup
app.use(session(
{
    secret: 'your_secret_key', // Replace with a secure key
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.set('view engine', 'ejs');
app.use('/static', express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));

// Home page, only accesible if user is logged in
app.get('/', async (req, res) => 
{
    const user = req.session.user;

    // if the user is not in the database
    if (!user) 
        {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }

    // check for user in the database
    try 
    {
        const userProfile = await UserProfile.findById(user._id).populate('journal');
        const journalEntries = userProfile.journal;
        res.render('index.ejs', { journalEntries });
    } 
    // Error accessing journal entries
    catch (err) 
    {
        console.error('Error retrieving journal entries:', err);
        res.status(500).send('Error retrieving journal entries');
    }
});

// Route to the Login In page
app.get('/login', (req, res) => 
{
    res.render('login.ejs');
});

// Logging in to the website 
app.post('/login', async (req, res) => 
{
    const { username, password } = req.body;

    // Try logging into account
    try 
    {
        const userProfile = await UserProfile.findOne({ username });
        if (userProfile && userProfile.password === password) 
        {
            // Log into account
            req.session.user = userProfile;
            return res.redirect('/');
        } 
        // Wrong username OR password
        else 
        {
            req.flash('error', 'Invalid username or password.');
            return res.redirect('/login');
        }
    } 
    // Error logging into account
    catch (err) 
    {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
});

// Route to the create an account page
app.get('/register', (req, res) => 
{
    res.render('register.ejs');
});

// Creating a new account
app.post('/register', async (req, res) => 
{
    const { username, password } = req.body;

    // Try creating a new account
    try 
    {
        const existingUser = await UserProfile.findOne({ username });

        // check if the the username is already in the database
        if (existingUser) 
        {
            req.flash('error', 'Username already exists.');
            return res.redirect('/register');
        }

        // Create a new account
        const newUser = new UserProfile({ username, password });
        await newUser.save();
        
        // Automatically log in the user after registration
        req.session.user = newUser;
        res.redirect('/');
    } 
    // Error creating a new account
    catch (err) 
    {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

// Route to the journal page
app.get('/journal', async (req, res) => 
{
    const user = req.session.user;

    // User must be logged in to view journal entries
    if (!user) 
    {
        req.flash('error', 'You must be logged in to access the journal.');
        return res.redirect('/login');
    }

    // Try accessing the journal page
    try 
    {
        const userProfile = await UserProfile.findById(user._id).populate('journal');
        const journalEntries = userProfile.journal;
        res.render('journal.ejs', { journalEntries });
    } 

    // Error accessing journal page
    catch (err) 
    {
        console.error('Error retrieving journal entries:', err);
        res.status(500).send('Error retrieving journal entries');
    }
});

// Add a new journal entry to the database
app.post('/create-entry', async (req, res) => 
{
    const { entry } = req.body; // Retrieve the submitted journal entry content
    const user = req.session.user;

    if (!user) 
    {
        req.flash('error', 'You must be logged in to create journal entries.');
        return res.redirect('/login');
    }

    try 
    {
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
    } 

    // Error saving journal entry
    catch (err) 
    {
        console.error('Error saving journal entry:', err);
        res.status(500).send('Error saving journal entry');
    }
});

// Route to view a previous journal entry
app.get('/journal/:id', async (req, res) => 
{
    const user = req.session.user;

    // User must be logged in to view past journal entries
    if (!user) 
    {
        req.flash('error', 'You must be logged in to view journal entries.');
        return res.redirect('/login');
    }

    const entryId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(entryId)) 
    {
        return res.status(400).send('Invalid journal entry ID');
    }

    try 
    {
        const entry = await JournalEntry.findById(entryId);
        const userProfile = await UserProfile.findById(user._id).populate('journal');

        // If trying to access a journal entry that doesn't exist
        if (!entry) 
        {
            return res.status(404).send('Journal entry not found');
        }

        // Check if the journal entry belongs to the current user
        if (!userProfile.journal.some(j => j._id.toString() === entry._id.toString())) 
        {
            return res.status(403).send('You do not have permission to view this journal entry.');
        }

        // Pass all the journal entries to the view so that the sidebar is consistent
        const journalEntries = userProfile.journal;
        
        // Render the specific journal entry in journal-view.ejs
        res.render('journal-view.ejs', { entry, journalEntries });
    } 

    // Error accessing journal entry
    catch (err) 
    {
        console.error('Error retrieving journal entry:', err);
        res.status(500).send('Error retrieving journal entry');
    }
});

// Route to render other pages
// Currently only shows the blank pages with the CSS format
// Will be implemented further in the semester
app.get('/to-do-list', (req, res) => 
{
    res.render('to-do-list.ejs');
});
app.get('/goals', (req, res) => 
{
    res.render('goals.ejs');
});
app.get('/meals', (req, res) => 
{
    res.render('meals.ejs');
});
app.get('/email', (req, res) => 
{
    res.render('email.ejs');
});

// Start the server
app.listen(port, () => 
{
    console.log(`Server is running on port ${port}.`);
});
