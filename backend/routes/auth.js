const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid'); // For generating unique folder names

// Bring in User Model and Video Service
const User = require('../models/User');
const { createFolder } = require('../services/videoService');

// --- Register Route ---
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  const lowerCaseEmail = email.toLowerCase();

  // 1. Basic Validation
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
    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    // 3. Create user folder on Streamtape
    const folderName = uuidv4(); // Generate a unique ID for the folder
    const folderId = await createFolder(folderName);
    if (!folderId) {
        // This will trigger if createFolder throws an error
        return res.status(500).json({ msg: 'Could not create user storage. Please try again later.' });
    }

    // 4. Create new user object
    const newUser = new User({
      name,
      email: lowerCaseEmail,
      password,
      streamtapeFolderId: folderId // Save the returned folder ID
    });

    // 5. Hash Password and Save User
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password, salt);
    newUser.password = hash;

    await newUser.save();
    res.status(201).json({ msg: 'You are now registered and can log in!', userId: newUser.id });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ msg: 'Server error during registration.' });
  }
});


// --- Login Route ---
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
        return res.status(400).json({ msg: info.message || 'Login failed.' });
    }
    req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({
            msg: 'Successfully authenticated',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
  })(req, res, next);
});


// --- Logout Route ---
router.post('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.json({ msg: 'Successfully logged out' });
  });
});


module.exports = router;