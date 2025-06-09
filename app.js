const express = require('express');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const sequelize = require('./config/db'); // Make sure this exists and exports your sequelize instance

// Load environment variables
dotenv.config();

const app = express();

// =========================
// ✅ Session Store Setup
// =========================
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "Session",
  checkExpirationInterval: 15 * 60 * 1000, // Clean expired sessions every 15 minutes
  expiration: 24 * 60 * 60 * 1000, // Session expires in 1 day
});

// Production setting
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy (for secure cookies behind proxies like Render)
}

// =========================
// ✅ View Engine and Static Files
// =========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// =========================
// ✅ Multer Config (for uploads)
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// =========================
// ✅ Middleware
// =========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Make session user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// =========================
// ✅ Route Imports and Registration
// =========================
const authRoutes = require('./routes/authRoutes');
const artworkRoutes = require('./routes/artworkRoutes');

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/feed');
  }
  res.render('landing');
});

app.use('/', authRoutes);
app.use('/', artworkRoutes(upload)); // Pass multer upload config to routes

// =========================
// ✅ Sync DB & Start Server
// =========================
sessionStore.sync()
  .then(() => sequelize.sync({ force: false }))
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error syncing the database or session store:", error);
  });
