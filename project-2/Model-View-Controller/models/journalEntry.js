import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
    entry: String,
    date: String
});

export default mongoose.model('JournalEntry', journalEntrySchema);
