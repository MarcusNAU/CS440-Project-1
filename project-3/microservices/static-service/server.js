const express = require('express');
const path = require('path');

const app = express();
const port = 3003;

// Middleware
app.use('/static', express.static(path.join(__dirname, 'static')));

// Serve Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Example Route
app.get('/', (req, res) => {
  res.render('index');
});

// Start server
app.listen(port, () => console.log(`Static Service running on port ${port}`));