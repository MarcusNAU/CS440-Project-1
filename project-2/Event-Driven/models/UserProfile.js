const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    journal: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }]
});

module.exports = mongoose.model('UserProfile', userProfileSchema);