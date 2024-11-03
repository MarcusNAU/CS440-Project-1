const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');

// Controllers
const UserController = require('./controllers/UserController');
const JournalController = require('./controllers/JournalController');

// Initialize app
const app = express();
const port = 8080;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/journalDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.set('view engine', 'ejs');
app.use('/static', express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', UserController);
app.use('/', JournalController);

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}.`));

// Initialize event listeners
require('./listeners/UserEventListeners');
require('./listeners/JournalEventListeners');