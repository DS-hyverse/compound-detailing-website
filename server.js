const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple test route
app.get('/test', (req, res) => {
    res.send(`
        <h1>EXPRESS SERVER WORKING</h1>
        <p>Server is running on port ${PORT}</p>
        <a href="/login">Go to Login</a><br>
        <a href="/admin">Go to Admin</a><br>
        <a href="/login.html">Go to Login.html</a><br>
        <a href="/admin.html">Go to Admin.html</a>
    `);
});

// Clean routes (without .html)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// .html routes
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/test.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});

// Serve static files
app.use(express.static('.', {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache');
    }
}));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch all other routes
app.get('*', (req, res) => {
    res.send(`
        <h1>404 - Route not found</h1>
        <p>Requested: ${req.url}</p>
        <a href="/">Go Home</a><br>
        <a href="/test">Test Page</a><br>
        <a href="/login">Login</a>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});