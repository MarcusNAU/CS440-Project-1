const express = require('express');
const Journal = require('../models/journal');

const router = express.Router();

// Create Journal Entry
router.post('/create', async (req, res) => {
  const { userId, entry } = req.body;
  try {
    const newJournal = new Journal({ userId, entry });
    await newJournal.save();
    res.status(201).send('Journal entry created successfully');
  } catch (err) {
    res.status(400).send('Error creating journal entry');
  }
});

// Get User's Journal Entries
router.get('/:userId', async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.params.userId });
    res.status(200).json(journals);
  } catch (err) {
    res.status(500).send('Error fetching journal entries');
  }
});

module.exports = router;