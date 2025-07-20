const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Load services and models
const User = require('../models/User');
const { createFolder } = require('../services/videoService');

module.exports = function(passport) {
  // --- Local Strategy for Email/Password ---
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  // --- GitHub Strategy ---
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: 'GitHub email is private. Please make it public.' });
        }

        try {
          let user = await User.findOne({ githubId: profile.id });
          if (user) return done(null, user);

          user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
            user.githubId = profile.id;
            await user.save();
            return done(null, user);
          }

          const folderName = uuidv4();
          const folderId = await createFolder(folderName);

          const newUser = new User({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email: email.toLowerCase(),
            password: await bcrypt.hash(uuidv4(), 10), // Create a random password
            streamtapeFolderId: folderId,
            avatar: profile.photos?.[0]?.value,
          });

          await newUser.save();
          done(null, newUser);
        } catch (err) {
          done(err, false);
        }
      }
    )
  );

  // Serialize user to store in the session (stores user.id)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // --- Deserialize user to retrieve from the session (DEFINITIVE FIX) ---
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};