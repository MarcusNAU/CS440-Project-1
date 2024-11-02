import JournalEntry from '../models/journalEntry.js';
import UserProfile from '../models/userProfile.js';

export const getJournal = async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to access the journal.');
        return res.redirect('/login');
    }
    try {
        const userProfile = await UserProfile.findById(user._id).populate('journal');
        res.render('journal.ejs', { journalEntries: userProfile.journal });
    } catch (err) {
        console.error('Error retrieving journal entries:', err);
        res.status(500).send('Error retrieving journal entries');
    }
};

export const postCreateEntry = async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to create journal entries.');
        return res.redirect('/login');
    }
    try {
        const newEntry = new JournalEntry({
            entry: req.body.entry,
            date: new Date().toLocaleString()
        });
        const savedEntry = await newEntry.save();
        const userProfile = await UserProfile.findById(user._id);
        userProfile.journal.push(savedEntry._id);
        await userProfile.save();
        res.redirect('/journal');
    } catch (err) {
        console.error('Error saving journal entry:', err);
        res.status(500).send('Error saving journal entry');
    }
};

// New function to handle individual journal entry view
export const getJournalEntry = async (req, res) => {
    const user = req.session.user;
    const entryId = req.params.id;

    if (!user) {
        req.flash('error', 'You must be logged in to view journal entries.');
        return res.redirect('/login');
    }

    try {
        const entry = await JournalEntry.findById(entryId);
        if (!entry) {
            return res.status(404).send('Journal entry not found');
        }

        // Check if the entry belongs to the user
        const userProfile = await UserProfile.findById(user._id).populate('journal');
        const entryBelongsToUser = userProfile.journal.some(
            (userJournalEntry) => userJournalEntry._id.toString() === entryId
        );

        if (!entryBelongsToUser) {
            return res.status(403).send('You do not have permission to view this journal entry.');
        }

        // Pass the journal entries along with the selected entry to the view
        const journalEntries = userProfile.journal;
        res.render('journal-view.ejs', { entry, journalEntries });
    } catch (err) {
        console.error('Error retrieving journal entry:', err);
        res.status(500).send('Error retrieving journal entry');
    }
};
