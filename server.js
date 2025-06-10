const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Login route - MUST come before static middleware
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Admin route - MUST come before static middleware
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files - AFTER specific routes
app.use(express.static('.'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});