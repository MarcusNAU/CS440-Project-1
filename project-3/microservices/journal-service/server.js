const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const journalRoutes = require('./routes/journal');

const app = express();
const port = 3002;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/journalDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Journal Service connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/journal', journalRoutes);

// Start server
app.listen(port, () => console.log(`Journal Service running on port ${port}`));