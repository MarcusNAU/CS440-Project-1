const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
    entry: String,
    date: String
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);