// ============================================================
// The three REST endpoints the assignment asks for, tested with
// Thunder Client. They are deliberately open (no login required),
// exactly like in the assignment screenshots.
//
//   POST /api/hotel/            - add a hotel
//   POST /api/room/             - add a room to a hotel
//   GET  /api/available_rooms/  - free rooms between two dates
// ============================================================

import express from 'express';
import { query, queryOne } from '../db.js';
import { validateHotel, validateRoom, validateDateRange } from '../utils/validate.js';
import { hotelToJson, roomToJson } from '../utils/format.js';

const router = express.Router();

// ------------------------------------------------------------
// 1. Add a new hotel
// ------------------------------------------------------------
router.post('/hotel', async (req, res, next) => {
  try {
    const check = validateHotel(req.body);
    if (!check.ok) return res.status(400).json({ errors: check.errors });

    const { name, country, city, number_of_rooms, stars } = check.value;
    const row = await queryOne(
      `INSERT INTO hotels (name, country, city, number_of_rooms, stars)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, country, city, number_of_rooms, stars]
    );
    res.status(201).json(hotelToJson(row));
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------
// 2. Add a new room. "hotel" in the body is the id of an existing hotel.
// ------------------------------------------------------------
router.post('/room', async (req, res, next) => {
  try {
    const check = validateRoom(req.body);
    if (!check.ok) return res.status(400).json({ errors: check.errors });

    const { hotel, name, max_guests, price, size } = check.value;

    const hotelRow = await queryOne('SELECT id FROM hotels WHERE id = $1', [hotel]);
    if (!hotelRow) {
      return res.status(400).json({ errors: [`There is no hotel with id ${hotel}`] });
    }

    const row = await queryOne(
      `INSERT INTO rooms (hotel_id, name, max_guests, price, size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [hotel, name, max_guests, price, size]
    );
    res.status(201).json(roomToJson(row));
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------
// 3. Which rooms - in any hotel - are free between two dates?
//
// A room is taken when an existing reservation overlaps the requested
// range. Two ranges overlap when:
//       existing.start_date < requested.end_date
//   AND existing.end_date   > requested.start_date
// (Checking out on the same day someone checks in is fine.)
// ------------------------------------------------------------
router.get('/available_rooms', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const check = validateDateRange(start_date, end_date);
    if (!check.ok) return res.status(400).json({ errors: check.errors });

    const rooms = await query(
      `SELECT r.*
         FROM rooms r
        WHERE NOT EXISTS (
              SELECT 1
                FROM reservations res
               WHERE res.room_id = r.id
                 AND res.start_date < $2
                 AND res.end_date   > $1
        )
        ORDER BY r.id`,
      [check.value.startDate, check.value.endDate]
    );

    if (rooms.length === 0) {
      return res.json('No rooms found on these dates');
    }
    res.json(rooms.map(roomToJson));
  } catch (err) {
    next(err);
  }
});

export default router;
