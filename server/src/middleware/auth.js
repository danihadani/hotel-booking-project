// ============================================================
// Login guard.
// The assignment states: a visitor who is not registered/logged in
// cannot perform any action on the site.
// ============================================================

export function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'You must be logged in to do that' });
  }
  next();
}

/** Adds req.currentUser (or null) for routes that only *optionally* care. */
export function attachUser(req, _res, next) {
  req.currentUser = (req.session && req.session.user) || null;
  next();
}
