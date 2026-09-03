// ============================================================
// The endpoints the React site uses to browse hotels and rooms.
// Each one requires a logged-in user, because the assignment says a
// visitor who is not registered cannot perform any action on the site.
// ============================================================

import express from 'express';
import { query, queryOne } from '../db.js';
import { requireLogin } from '../middleware/auth.js';
import { hotelToJson, roomToJson } from '../utils/format.js';

const router = express.Router();

/** GET /api/hotels - every hotel in the system. */
router.get('/hotels', requireLogin, async (_req, res, next) => {
  try {
    const rows = await query('SELECT * FROM hotels ORDER BY id');
    res.json(rows.map(hotelToJson));
  } catch (err) {
    next(err);
  }
});

/** GET /api/hotels/:id - hotel details page: the hotel plus all of its rooms. */
router.get('/hotels/:id', requireLogin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ errors: ['Hotel id must be a positive whole number'] });
    }

    const hotel = await queryOne('SELECT * FROM hotels WHERE id = $1', [id]);
    if (!hotel) return res.status(404).json({ errors: ['Hotel not found'] });

    const rooms = await query('SELECT * FROM rooms WHERE hotel_id = $1 ORDER BY id', [id]);
    res.json({ ...hotelToJson(hotel), rooms: rooms.map(roomToJson) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/rooms - every room of every hotel.
 * The booking form needs this: the assignment says the room dropdown may list
 * the rooms of ALL hotels, even ones that do not belong to the chosen hotel.
 */
router.get('/rooms', requireLogin, async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT r.*, h.name AS hotel_name
         FROM rooms r
         JOIN hotels h ON h.id = r.hotel_id
        ORDER BY h.id, r.id`
    );
    res.json(rows.map((row) => ({ ...roomToJson(row), hotel_name: row.hotel_name })));
  } catch (err) {
    next(err);
  }
});

/** GET /api/rooms/:id - room details page. */
router.get('/rooms/:id', requireLogin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ errors: ['Room id must be a positive whole number'] });
    }

    const row = await queryOne(
      `SELECT r.*, h.name AS hotel_name, h.city, h.country, h.stars
         FROM rooms r
         JOIN hotels h ON h.id = r.hotel_id
        WHERE r.id = $1`,
      [id]
    );
    if (!row) return res.status(404).json({ errors: ['Room not found'] });

    res.json({
      ...roomToJson(row),
      hotel_name: row.hotel_name,
      city: row.city,
      country: row.country,
      stars: row.stars,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
