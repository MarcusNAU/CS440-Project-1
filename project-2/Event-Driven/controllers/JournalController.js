const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const UserProfile = require('../models/UserProfile');
const journalEvents = require('../events/JournalEvents');

// Journal Page Route (Protected)
router.get('/journal', async (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access the journal.');
        return res.redirect('/login');
    }

    try {
        const userProfile = await UserProfile.findById(req.session.user._id).populate('journal');
        const journalEntries = userProfile.journal;
        res.render('journal', { journalEntries });
    } catch (err) {
        console.error('Error retrieving journal entries:', err);
        res.status(500).send('Error retrieving journal entries');
    }
});

// Create a New Journal Entry (Protected)
router.post('/create-entry', async (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to create journal entries.');
        return res.redirect('/login');
    }

    const { entry } = req.body;
    try {
        const newEntry = new JournalEntry({
            entry: entry,
            date: new Date().toLocaleString()
        });
        const savedEntry = await newEntry.save();

        const userProfile = await UserProfile.findById(req.session.user._id);
        userProfile.journal.push(savedEntry._id);
        await userProfile.save();

        journalEvents.emit('journal:created', savedEntry);  // Emit journal created event
        res.redirect('/journal');
    } catch (err) {
        console.error('Error saving journal entry:', err);
        res.status(500).send('Error saving journal entry');
    }
});

// View a Specific Journal Entry (Protected)
router.get('/journal/:id', async (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to view this entry.');
        return res.redirect('/login');
    }

    const entryId = req.params.id;
    try {
        const entry = await JournalEntry.findById(entryId);
        const userProfile = await UserProfile.findById(req.session.user._id).populate('journal');

        if (!entry || !userProfile.journal.some(j => j._id.equals(entry._id))) {
            return res.status(404).send('Journal entry not found or access denied.');
        }

        const journalEntries = userProfile.journal;
        res.render('journal-view', { entry, journalEntries });
    } catch (err) {
        console.error('Error retrieving journal entry:', err);
        res.status(500).send('Error retrieving journal entry');
    }
});

module.exports = router;