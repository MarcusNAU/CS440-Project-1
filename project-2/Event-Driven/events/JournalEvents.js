const EventEmitter = require('events');
class JournalEvents extends EventEmitter {}
const journalEvents = new JournalEvents();
module.exports = journalEvents;