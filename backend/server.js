const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');
require('dotenv').config();

// Passport Config
require('./config/passport')(passport);

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middlewares ---
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Middleware
app.use(
  session({
    secret: 'a secret key for aurahub', // Replace with a real secret from your .env file
    resave: true,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


// --- Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AuraHub main API! 🚀' });
});

// Use the auth routes
app.use('/api/auth', require('./routes/auth'));


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});