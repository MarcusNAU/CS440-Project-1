const userEvents = require('../events/UserEvents');

userEvents.on('user:login', (user) => {
    console.log(`User ${user.username} logged in at ${new Date().toLocaleString()}`);
});

userEvents.on('user:register', (user) => {
    console.log(`New user registered: ${user.username} at ${new Date().toLocaleString()}`);
});