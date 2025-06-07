const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Route imports
const authRoutes = require('./routes/authRoutes');
const artworkRoutes = require('./routes/artworkRoutes');

// Multer config for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// View engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false
}));

// Make session user available in views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Landing page
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/feed');
    }
    res.render('landing');
});


// Register routes
app.use('/', authRoutes);
app.use('/', artworkRoutes(upload)); // ✅ Pass the multer middleware to artwork routes

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
