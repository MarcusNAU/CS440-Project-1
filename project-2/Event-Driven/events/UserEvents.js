const EventEmitter = require('events');
class UserEvents extends EventEmitter {}
const userEvents = new UserEvents();
module.exports = userEvents;