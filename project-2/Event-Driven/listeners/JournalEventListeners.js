const journalEvents = require('../events/JournalEvents');

journalEvents.on('journal:created', (entry) => {
    console.log(`Journal entry created with ID: ${entry._id}`);
});