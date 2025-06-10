const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache-busting middleware
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Disable express static middleware completely and handle everything manually

// Specific routes first
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve specific static files manually
app.get('/admin.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.css'));
});

app.get('/admin.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.js'));
});

app.get('/supabase-config.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'supabase-config.js'));
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

// Serve image directories
app.use('/1', express.static(path.join(__dirname, '1')));
app.use('/2', express.static(path.join(__dirname, '2')));
app.use('/3', express.static(path.join(__dirname, '3')));
app.use('/4', express.static(path.join(__dirname, '4')));
app.use('/5', express.static(path.join(__dirname, '5')));
app.use('/6', express.static(path.join(__dirname, '6')));
app.use('/7', express.static(path.join(__dirname, '7')));
app.use('/8', express.static(path.join(__dirname, '8')));
app.use('/9', express.static(path.join(__dirname, '9')));

// Serve other static files
app.get('/DONE.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'DONE.png'));
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch all - redirect to home
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});