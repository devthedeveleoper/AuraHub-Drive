const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');

// Import User Model and Video Service
const User = require('../models/User');
const { createFolder } = require('../services/videoService');

// Get the frontend URL from environment variables for safe redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// --- GitHub Authentication Routes ---

// 1. Initial request to GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// 2. GitHub callback URL
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    // On successful authentication, redirect to the frontend dashboard.
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);


// --- Classic Authentication Routes ---

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  const lowerCaseEmail = email.toLowerCase();

  if (!name || !email || !password || !password2) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }
  if (password !== password2) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const folderName = uuidv4();
    const folderId = await createFolder(folderName);
    if (!folderId) {
        return res.status(500).json({ msg: 'Could not create user storage.' });
    }

    const newUser = new User({
      name,
      email: lowerCaseEmail,
      password,
      streamtapeFolderId: folderId
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    await newUser.save();
    res.status(201).json({ msg: 'You are now registered and can log in!' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ msg: 'Server error during registration.' });
  }
});

// Login Route
router.post('/login', passport.authenticate('local'), (req, res) => {
  // If this function is called, authentication was successful.
  // Passport automatically handles the session and attaches the full user object to req.user.
  res.status(200).json(req.user);
});

// Logout Route
router.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ msg: 'Failed to destroy session.' });
      }
      res.clearCookie('aurahub.sid');
      return res.status(200).json({ msg: 'Logout successful.' });
    });
  });
});


// --- Session Management Route ---

// "Me" endpoint to get current user data from the session
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ msg: 'Not authenticated' });
  }
});


module.exports = router;