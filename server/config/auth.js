function ensureAuthenticated(req, res, next) {
  if (req.user || req.session.user) {
    return next();
  }
  res.redirect('/register'); // redirect to register/login if not authenticated
}

module.exports = { ensureAuthenticated };



