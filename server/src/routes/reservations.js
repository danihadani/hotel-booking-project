// ============================================================
// Making a reservation.
//
// Three things can go wrong, and each one has its own error page
// in the React app:
//   invalid_dates     -> the dates are missing / malformed / out of order
//   invalid_room      -> the chosen room does not belong to the chosen hotel
//   unavaliable_room  -> the room is already booked on those dates
// The server answers with { error: "<reason>" } and the client shows
// the matching page.
// ============================================================

import express from 'express';
import { query, queryOne } from '../db.js';
import { requireLogin } from '../middleware/auth.js';
import { validateDateRange } from '../utils/validate.js';
import { calculatePrice, reservationToJson } from '../utils/format.js';

const router = express.Router();

/** POST /api/reservations */
router.post('/reservations', requireLogin, async (req, res, next) => {
  try {
    const { guest_name, hotel, room, start_date, end_date } = req.body || {};

    // --- the guest name ---
    if (typeof guest_name !== 'string' || guest_name.trim() === '' || guest_name.length > 120) {
      return res.status(400).json({ error: 'invalid_input', errors: ['A guest name is required'] });
    }

    // --- the dates ---
    const dates = validateDateRange(start_date, end_date);
    if (!dates.ok) {
      return res.status(400).json({ error: 'invalid_dates', errors: dates.errors });
    }
    const { startDate, endDate, nights } = dates.value;

    // --- the hotel and the room must be real ids ---
    const hotelId = Number(hotel);
    const roomId = Number(room);
    if (!Number.isInteger(hotelId) || hotelId < 1 || !Number.isInteger(roomId) || roomId < 1) {
      return res
        .status(400)
        .json({ error: 'invalid_room', errors: ['A hotel and a room must be chosen'] });
    }

    // --- does this room really belong to this hotel? ---
    const roomRow = await queryOne(
      `SELECT r.*, h.name AS hotel_name, h.city, h.country
         FROM rooms r
         JOIN hotels h ON h.id = r.hotel_id
        WHERE r.id = $1 AND r.hotel_id = $2`,
      [roomId, hotelId]
    );
    if (!roomRow) {
      return res
        .status(400)
        .json({ error: 'invalid_room', errors: ['The room does not exist in the hotel'] });
    }

    // --- is it free on those dates? (same overlap rule as /available_rooms) ---
    const clash = await queryOne(
      `SELECT id FROM reservations
        WHERE room_id = $1
          AND start_date < $3
          AND end_date   > $2
        LIMIT 1`,
      [roomId, startDate, endDate]
    );
    if (clash) {
      return res.status(409).json({
        error: 'unavaliable_room',
        errors: ['The room is not avaliable at the dates requested'],
      });
    }

    // --- all good: save it ---
    const { total } = calculatePrice(roomRow.price, nights);
    const saved = await queryOne(
      `INSERT INTO reservations
         (user_id, hotel_id, room_id, guest_name, start_date, end_date,
          nights, price_per_night, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        req.session.user.id,
        hotelId,
        roomId,
        guest_name.trim(),
        startDate,
        endDate,
        nights,
        roomRow.price,
        total,
      ]
    );

    res.status(201).json(await loadReservation(saved.id));
  } catch (err) {
    next(err);
  }
});

/** GET /api/reservations/:id - the confirmation page. */
router.get('/reservations/:id', requireLogin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ errors: ['Reservation id must be a positive whole number'] });
    }
    const reservation = await loadReservation(id);
    if (!reservation) return res.status(404).json({ errors: ['Reservation not found'] });
    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

/** GET /api/my-reservations - everything the logged-in user has booked. */
router.get('/my-reservations', requireLogin, async (req, res, next) => {
  try {
    const rows = await query(
      `${RESERVATION_SELECT} WHERE res.user_id = $1 ORDER BY res.id DESC`,
      [req.session.user.id]
    );
    res.json(rows.map(reservationToJson));
  } catch (err) {
    next(err);
  }
});

const RESERVATION_SELECT = `
  SELECT res.*,
         h.name AS hotel_name, h.city, h.country,
         r.name AS room_name, r.max_guests, r.size
    FROM reservations res
    JOIN hotels h ON h.id = res.hotel_id
    JOIN rooms  r ON r.id = res.room_id`;

async function loadReservation(id) {
  const row = await queryOne(`${RESERVATION_SELECT} WHERE res.id = $1`, [id]);
  return row ? reservationToJson(row) : null;
}

export default router;
