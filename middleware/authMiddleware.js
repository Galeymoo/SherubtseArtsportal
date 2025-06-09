function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;  // Attach session user to req.user
    return next();
  } else {
    res.redirect('/login'); // or res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { ensureAuth };
