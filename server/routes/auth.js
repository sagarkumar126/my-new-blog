const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Start Google login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/admin?error=google' }),
  (req, res) => {
    // Create JWT token for the user
    const token = jwt.sign(
      { userId: req.user._id, username: req.user.username },
      process.env.JWT_SECRET
    );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  }
);

module.exports = router;



