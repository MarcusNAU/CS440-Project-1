// Import required modules
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'express-flash';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 8080;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/journalDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware setup
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(flash());
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: true }));

// Import controllers
import * as authController from './controllers/authController.js';
import * as journalController from './controllers/journalController.js';

// Routes
app.get('/', journalController.getJournal);
app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.get('/register', authController.getRegister);
app.post('/register', authController.postRegister);
app.get('/journal', journalController.getJournal);
app.post('/create-entry', journalController.postCreateEntry);
app.get('/journal/:id', journalController.getJournalEntry);

// New routes for other pages
app.get('/goals', (req, res) => {
    res.render('goals.ejs');
});
app.get('/meals', (req, res) => {
    res.render('meals.ejs');
});
app.get('/to-do-list', (req, res) => {
    res.render('to-do-list.ejs');
});
app.get('/email', (req, res) => {
    res.render('email.ejs');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});