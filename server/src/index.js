// ============================================================
// Mini booking.com - Express server.
//
// It does two jobs at once:
//   1. It is the REST API      ->  /api/...
//   2. It serves the React app ->  everything else
// so the whole site lives on http://127.0.0.1:8000
// ============================================================

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import reservationRoutes from './routes/reservations.js';
import { pool } from './db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_BUILD = path.resolve(__dirname, '../../client/dist');
const PORT = Number(process.env.PORT) || 8000;

const app = express();

// ---------- basics ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// During development the React dev server runs on port 5173 and talks to us
// over http. "credentials" lets the session cookie travel with those requests.
app.use(
  cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true,
  })
);

// ---------- login sessions ----------
app.use(
  session({
    name: 'booking.sid',
    secret: process.env.SESSION_SECRET || 'dev-only-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // one day
    },
  })
);

// ---------- routes ----------
app.use('/api', apiRoutes); //         /api/hotel/, /api/room/, /api/available_rooms/
app.use('/api', authRoutes); //        /api/register, /api/login, /api/logout, /api/me
app.use('/api', catalogRoutes); //     /api/hotels, /api/rooms
app.use('/api', reservationRoutes); // /api/reservations

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch {
    res.status(500).json({ ok: false, database: 'unreachable' });
  }
});

// Anything under /api that we did not define is a 404 in JSON, not HTML.
app.use('/api', (_req, res) => res.status(404).json({ errors: ['No such API endpoint'] }));

// ---------- the React app ----------
if (fs.existsSync(CLIENT_BUILD)) {
  app.use(express.static(CLIENT_BUILD));
  // React Router handles the paths, so every other URL gets index.html.
  app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_BUILD, 'index.html')));
} else {
  app.get('*', (_req, res) =>
    res
      .status(503)
      .send(
        '<h1>The React app has not been built yet</h1>' +
          '<p>Run <code>npm install &amp;&amp; npm run build</code> inside <code>booking/client</code>,' +
          ' or start the dev server with <code>npm run dev</code> and open ' +
          '<a href="http://127.0.0.1:5173">http://127.0.0.1:5173</a>.</p>'
      )
  );
}

// ---------- one place for unexpected errors ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ errors: ['Something went wrong on the server'] });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Booking server listening on http://127.0.0.1:${PORT}`);
});
