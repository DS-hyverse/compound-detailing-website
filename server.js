const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug route to test if Express routing works
app.get('/debug', (req, res) => {
    res.send(`
        <h1>🚀 EXPRESS SERVER IS WORKING!</h1>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Port:</strong> ${PORT}</p>
        <p><strong>URL:</strong> ${req.url}</p>
        <hr>
        <h3>Test Links:</h3>
        <a href="/admin">Try /admin</a><br>
        <a href="/login">Try /login</a><br>
        <a href="/">Go Home</a>
    `);
});

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