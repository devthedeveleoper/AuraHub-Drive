const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo'); // <-- Import connect-mongo
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

// Express Session Middleware with MongoStore
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    name: 'aurahub.sid', // Explicitly name the cookie
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Must be 'lax' for localhost development
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
  })
);

// Passport Middleware (must be after session)
app.use(passport.initialize());
app.use(passport.session());


// --- Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AuraHub main API! 🚀' });
});

app.use('/api/auth', require('./routes/auth'));

app.use('/api/videos', require('./routes/videos'));


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});