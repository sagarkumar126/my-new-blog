const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async function (accessToken, refreshToken, profile, done) {
    try {
      const email = profile.emails[0].value.toLowerCase();

      if (!email.endsWith('@gmail.com')) {
        return done(null, false, { message: 'Only @gmail.com accounts are allowed.' });
      }

      let user = await User.findOne({ username: email });

      if (!user) {
        user = await User.create({
          username: email,
          password: 'google-oauth-' + profile.id,
          googleId: profile.id
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;










