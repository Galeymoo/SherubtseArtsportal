function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/login'); // or send 401 Unauthorized
  }
}

module.exports = { ensureAuth };
