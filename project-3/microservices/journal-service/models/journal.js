const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  entry: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Journal', journalSchema);