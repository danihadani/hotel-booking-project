import express from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../db.js';
import { validateRegistration } from '../utils/validate.js';

const router = express.Router();

/** POST /api/register - create a new user and log her in straight away. */
router.post('/register', async (req, res, next) => {
  try {
    const check = validateRegistration(req.body);
    if (!check.ok) return res.status(400).json({ errors: check.errors });

    const { username, full_name, email, password } = check.value;

    const taken = await queryOne('SELECT id FROM users WHERE lower(username) = lower($1)', [username]);
    if (taken) return res.status(400).json({ errors: ['This username is already taken'] });

    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await query(
      `INSERT INTO users (username, password_hash, full_name, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, full_name, email`,
      [username, password_hash, full_name, email]
    );

    req.session.user = user;
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

/** POST /api/login */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return res.status(400).json({ errors: ['Username and password are required'] });
    }

    const user = await queryOne(
      'SELECT id, username, full_name, email, password_hash FROM users WHERE lower(username) = lower($1)',
      [username]
    );
    // Same message for "no such user" and "wrong password" - we do not want to
    // tell an attacker which usernames exist.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ errors: ['Wrong username or password'] });
    }

    delete user.password_hash;
    req.session.user = user;
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/** POST /api/logout */
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

/** GET /api/me - who is logged in right now? Used by the React app on load. */
router.get('/me', (req, res) => {
  res.json({ user: (req.session && req.session.user) || null });
});

export default router;
