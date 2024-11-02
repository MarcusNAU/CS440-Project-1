import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    journal: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }]
});

export default mongoose.model('UserProfile', userProfileSchema);
