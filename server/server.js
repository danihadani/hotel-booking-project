import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";

import {
  hashPassword,
  comparePassword,
  auth,
  createToken,
  validateSignup,
} from "./auth.js";

/******************** For Prisma ********************/
import { prisma } from "./prisma.js";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

/******************** General Middleware ********************/
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

/******************** Output Helpers ********************/
// Hotels and rooms go out exactly as Prisma hands them over - the field
// names in the schema are already the ones the API promises.
//
// A reservation is different: it needs its dates turned into plain strings
// and its final price worked out, so it gets a function of its own below.

// Prisma hands dates back as JavaScript Date objects; the API speaks
// plain "YYYY-MM-DD" strings.
function dateToText(date) {
  return date.toISOString().slice(0, 10);
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Final price = (nights x price per night) + 18% VAT, as the assignment says.
const VAT_RATE = 0.18;

function calculatePrice(pricePerNight, nights) {
  const subtotal = round2(pricePerNight * nights);
  const vat = round2(subtotal * VAT_RATE);
  return { subtotal, vat, total: round2(subtotal + vat) };
}

function reservationToJson(reservation) {
  const { subtotal, vat, total } = calculatePrice(reservation.pricePerNight, reservation.nights);
  return {
    id: reservation.id,
    guestName: reservation.guestName,
    startDate: dateToText(reservation.startDate),
    endDate: dateToText(reservation.endDate),
    nights: reservation.nights,
    pricePerNight: reservation.pricePerNight,
    subtotal,
    vatRate: VAT_RATE,
    vat,
    totalPrice: total,
    hotel: reservation.hotel,
    room: reservation.room,
  };
}

/******************** Input Helpers ********************/
// The assignment says every input must be checked. These three tiny functions
// are the checks; the routes below just call them and answer 400 on a failure.

function isText(value) {
  return typeof value === "string" && value.trim() !== "" && value.length <= 120;
}

function isWholeNumber(value, min, max) {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max;
}

function isPositiveNumber(value, max) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 && number <= max;
}

// A real calendar date written as YYYY-MM-DD.
// The round trip through toISOString is what rejects 2026-02-31, which
// JavaScript would otherwise happily roll over into the 3rd of March.
function isValidDate(text) {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

function toDate(text) {
  return new Date(`${text}T00:00:00Z`);
}

function nightsBetween(startText, endText) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((toDate(endText) - toDate(startText)) / MS_PER_DAY);
}

/******************** Auth Routes ********************/
app.post("/api/users/signup", async (req, res) => {
  try {
    const { username, fullName, email, password } = validateSignup(req.body);

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: "This username is already taken" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, fullName, email, password: hashedPassword },
    });

    // Log her straight in, so she does not have to type it all again.
    const token = createToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, username: user.username, full_name: user.fullName },
    });
  } catch (err) {
    if (err.message === "ALL_FIELDS_REQUIRED") {
      return res.status(400).json({ error: "username, full_name, email and password are required" });
    }
    if (err.message === "INVALID_USERNAME") {
      return res.status(400).json({ error: "username must be 3-50 characters: letters, digits, . _ -" });
    }
    if (err.message === "INVALID_EMAIL") {
      return res.status(400).json({ error: "invalid email" });
    }
    if (err.message === "PASSWORD_TOO_SHORT") {
      return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    console.error("POST /api/users/signup", err);
    return res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username: username.trim() } });

    // The same answer for "no such user" and "wrong password", so nobody can
    // use this endpoint to discover which usernames exist.
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = createToken(user);
    return res.status(200).json({
      token,
      user: { id: user.id, username: user.username, full_name: user.fullName },
    });
  } catch (err) {
    console.error("POST /api/users/login", err);
    return res.status(500).json({ error: "Failed to login" });
  }
});

/******************** Hotel Routes ********************/
app.get("/api/hotels", auth, async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({ orderBy: { id: "asc" } });

    return res.status(200).json(hotels);
  } catch (err) {
    console.error("GET /api/hotels", err);
    return res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

app.get("/api/hotels/:id", auth, async (req, res) => {
  const hotelId = Number(req.params.id);

  if (!Number.isInteger(hotelId) || hotelId < 1) {
    return res.status(400).json({ error: "id must be a positive whole number" });
  }

  try {
    // "include" pulls the rooms along with the hotel - no JOIN written by hand.
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { rooms: { orderBy: { id: "asc" } } },
    });

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    return res.status(200).json(hotel);
  } catch (err) {
    console.error("GET /api/hotels/:id", err);
    return res.status(500).json({ error: "Failed to fetch hotel" });
  }
});


// ---- The assignment's REST API: add a new hotel ----
app.post("/api/hotel", async (req, res) => {
  try {
    const { name, country, city, number_of_rooms, stars } = req.body;

    if (!isText(name)) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!isText(country)) {
      return res.status(400).json({ error: "country is required" });
    }
    if (!isText(city)) {
      return res.status(400).json({ error: "city is required" });
    }
    if (!isWholeNumber(number_of_rooms, 1, 100000)) {
      return res.status(400).json({ error: "number_of_rooms must be a whole number greater than 0" });
    }
    if (!isWholeNumber(stars, 1, 5)) {
      return res.status(400).json({ error: "stars must be a whole number between 1 and 5" });
    }

    const hotel = await prisma.hotel.create({
      data: {
        name: name.trim(),
        country: country.trim(),
        city: city.trim(),
        numberOfRooms: Number(number_of_rooms),
        stars: Number(stars),
      },
    });

    return res.status(201).json(hotel);
  } catch (err) {
    console.error("POST /api/hotel", err);
    return res.status(500).json({ error: "Failed to create hotel" });
  }
});

/******************** Room Routes ********************/
// Every room of every hotel. The booking form needs this: the assignment says
// its room dropdown may list rooms that do not belong to the chosen hotel.
app.get("/api/rooms", auth, async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { id: "asc" },
      include: { hotel: true },
    });

    return res.status(200).json(rooms);
  } catch (err) {
    console.error("GET /api/rooms", err);
    return res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

app.get("/api/rooms/:id", auth, async (req, res) => {
  const roomId = Number(req.params.id);

  if (!Number.isInteger(roomId) || roomId < 1) {
    return res.status(400).json({ error: "id must be a positive whole number" });
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.status(200).json(room);
  } catch (err) {
    console.error("GET /api/rooms/:id", err);
    return res.status(500).json({ error: "Failed to fetch room" });
  }
});


// ---- The assignment's REST API: add a new room ----
// "hotel" in the body is the id of an existing hotel in the database.
app.post("/api/room", async (req, res) => {
  try {
    const { hotel, name, max_guests, price, size } = req.body;

    if (!isWholeNumber(hotel, 1, Number.MAX_SAFE_INTEGER)) {
      return res.status(400).json({ error: "hotel must be the id of an existing hotel" });
    }
    if (!isText(name)) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!isWholeNumber(max_guests, 1, 20)) {
      return res.status(400).json({ error: "max_guests must be a whole number between 1 and 20" });
    }
    if (!isPositiveNumber(price, 1000000)) {
      return res.status(400).json({ error: "price must be a number greater than 0" });
    }
    if (!isWholeNumber(size, 1, 10000)) {
      return res.status(400).json({ error: "size must be a whole number greater than 0" });
    }

    // The hotel has to exist before we can hang a room on it.
    const hotelId = Number(hotel);
    const existingHotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { id: true },
    });
    if (!existingHotel) {
      return res.status(400).json({ error: `There is no hotel with id ${hotelId}` });
    }

    const room = await prisma.room.create({
      data: {
        hotelId,
        name: name.trim(),
        maxGuests: Number(max_guests),
        price: Number(price),
        size: Number(size),
      },
    });

    return res.status(201).json(room);
  } catch (err) {
    console.error("POST /api/room", err);
    return res.status(500).json({ error: "Failed to create room" });
  }
});

/******************** Reservation Routes ********************/
// Making a reservation. Three things can go wrong, and each one has its own
// page in the React app, so the error string is the name of that page:
//   invalid_dates     the dates are missing, malformed or in the wrong order
//   invalid_room      the chosen room does not belong to the chosen hotel
//   unavaliable_room  the room is already booked on those dates
app.post("/api/reservations", auth, async (req, res) => {
  try {
    const { guest_name, hotel, room, start_date, end_date } = req.body;

    if (!isText(guest_name)) {
      return res.status(400).json({ error: "guest_name is required" });
    }

    // ---- the dates ----
    if (!isValidDate(start_date) || !isValidDate(end_date) || end_date <= start_date) {
      return res.status(400).json({ error: "invalid_dates" });
    }

    // ---- the hotel and the room have to be real ids ----
    if (!isWholeNumber(hotel, 1, Number.MAX_SAFE_INTEGER) ||
        !isWholeNumber(room, 1, Number.MAX_SAFE_INTEGER)) {
      return res.status(400).json({ error: "invalid_room" });
    }

    const hotelId = Number(hotel);
    const roomId = Number(room);

    // ---- does this room really belong to this hotel? ----
    // Asking for the room AND the hotel id together is the whole check: if the
    // guest picked a room from a different hotel, nothing comes back.
    const chosenRoom = await prisma.room.findFirst({
      where: { id: roomId, hotelId },
      include: { hotel: true },
    });
    if (!chosenRoom) {
      return res.status(400).json({ error: "invalid_room" });
    }

    // ---- is it free on those dates? (the same overlap rule as the search) ----
    const clash = await prisma.reservation.findFirst({
      where: {
        roomId,
        AND: [
          { startDate: { lt: toDate(end_date) } },
          { endDate: { gt: toDate(start_date) } },
        ],
      },
    });
    if (clash) {
      return res.status(409).json({ error: "unavaliable_room" });
    }

    // ---- all good: save it ----
    const nights = nightsBetween(start_date, end_date);
    const { total } = calculatePrice(chosenRoom.price, nights);

    const reservation = await prisma.reservation.create({
      data: {
        userId: req.userId, // put there by the auth middleware
        hotelId,
        roomId,
        guestName: guest_name.trim(),
        startDate: toDate(start_date),
        endDate: toDate(end_date),
        nights,
        pricePerNight: chosenRoom.price, // the price as it is TODAY, kept forever
        totalPrice: total,
      },
      include: { hotel: true, room: true },
    });

    return res.status(201).json(reservationToJson(reservation));
  } catch (err) {
    console.error("POST /api/reservations", err);
    return res.status(500).json({ error: "Failed to create reservation" });
  }
});

// The confirmation page reads the reservation back through this.
app.get("/api/reservations/:id", auth, async (req, res) => {
  const reservationId = Number(req.params.id);

  if (!Number.isInteger(reservationId) || reservationId < 1) {
    return res.status(400).json({ error: "id must be a positive whole number" });
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { hotel: true, room: true },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    return res.status(200).json(reservationToJson(reservation));
  } catch (err) {
    console.error("GET /api/reservations/:id", err);
    return res.status(500).json({ error: "Failed to fetch reservation" });
  }
});

/******************** Availability ********************/
// Which rooms - in any hotel - are free between two dates?
//
// A room is taken when one of its reservations overlaps the requested range:
//       reservation.startDate < requested end
//   AND reservation.endDate   > requested start
// so "none" of those may exist for the room to count as free. Checking out on
// the morning someone else checks in is not an overlap.
app.get("/api/available_rooms", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!isValidDate(start_date)) {
      return res.status(400).json({ error: "start_date must be a real date in YYYY-MM-DD format" });
    }
    if (!isValidDate(end_date)) {
      return res.status(400).json({ error: "end_date must be a real date in YYYY-MM-DD format" });
    }
    if (end_date <= start_date) {
      return res.status(400).json({ error: "end_date must be later than start_date" });
    }

    const rooms = await prisma.room.findMany({
      where: {
        reservations: {
          none: {
            AND: [
              { startDate: { lt: toDate(end_date) } },
              { endDate: { gt: toDate(start_date) } },
            ],
          },
        },
      },
      orderBy: { id: "asc" },
    });

    if (rooms.length === 0) {
      return res.status(200).json("No rooms found on these dates");
    }

    return res.status(200).json(rooms);
  } catch (err) {
    console.error("GET /api/available_rooms", err);
    return res.status(500).json({ error: "Failed to search for available rooms" });
  }
});

/******************** The React App ********************/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_BUILD = path.resolve(__dirname, "../client/dist");

// Anything under /api that we did not define is a 404 in JSON, not in HTML.
app.use("/api", (req, res) => res.status(404).json({ error: "No such API endpoint" }));

if (fs.existsSync(CLIENT_BUILD)) {
  app.use(express.static(CLIENT_BUILD));
  // React Router owns the paths, so every other URL gets index.html.
  app.get("*", (req, res) => res.sendFile(path.join(CLIENT_BUILD, "index.html")));
} else {
  // The API works, but there is no built React app to serve yet. Say so
  // clearly instead of answering with a bare 404.
  app.get("*", (req, res) =>
    res.status(503).send(`<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>צד הלקוח עוד לא נבנה</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 60px auto;
         padding: 0 24px; line-height: 1.7; color: #23303d; }
  code { background: #f1ece7; padding: 2px 6px; border-radius: 5px; }
  pre  { background: #23303d; color: #fff; padding: 14px 18px; border-radius: 10px;
         direction: ltr; text-align: left; overflow-x: auto; }
</style></head><body>
  <h1>השרת רץ — אבל אתר ה‑React עוד לא נבנה</h1>
  <p>חסרה התיקייה <code>client/dist</code>. כדי לבנות אותה:</p>
  <pre>cd client
npm install
npm run build</pre>
  <p>ואז לרענן את העמוד הזה.</p>
  <p>ה‑API עצמו עובד כבר עכשיו — אפשר לבדוק ב־
     <a href="/api/available_rooms/?start_date=2026-03-10&amp;end_date=2026-03-13">
     /api/available_rooms/</a>.</p>
</body></html>`)
  );
}

/******************** Server ********************/
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
