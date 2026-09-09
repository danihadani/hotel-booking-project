import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";

/******************** For Prisma ********************/
import { prisma } from "./prisma.js";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

/******************** General Middleware ********************/
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

/******************** Output Helpers ********************/
// Prisma speaks camelCase (numberOfRooms), the assignment's API speaks
// snake_case (number_of_rooms). These two functions are the translation,
// and they are the ONLY place the shape of a response is decided.

function hotelToJson(hotel) {
  return {
    id: hotel.id,
    name: hotel.name,
    country: hotel.country,
    city: hotel.city,
    number_of_rooms: hotel.numberOfRooms,
    stars: hotel.stars,
  };
}

function roomToJson(room) {
  return {
    id: room.id,
    name: room.name,
    max_guests: room.maxGuests,
    price: room.price,
    size: room.size,
    hotel: room.hotelId, // the assignment calls the foreign key "hotel"
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

/******************** Hotel Routes ********************/
app.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({ orderBy: { id: "asc" } });

    return res.status(200).json(hotels.map(hotelToJson));
  } catch (err) {
    console.error("GET /api/hotels", err);
    return res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

app.get("/api/hotels/:id", async (req, res) => {
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

    return res.status(200).json({
      ...hotelToJson(hotel),
      rooms: hotel.rooms.map(roomToJson),
    });
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

    return res.status(201).json(hotelToJson(hotel));
  } catch (err) {
    console.error("POST /api/hotel", err);
    return res.status(500).json({ error: "Failed to create hotel" });
  }
});

/******************** Room Routes ********************/
// Every room of every hotel. The booking form needs this: the assignment says
// its room dropdown may list rooms that do not belong to the chosen hotel.
app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { id: "asc" },
      include: { hotel: true },
    });

    return res.status(200).json(
      rooms.map((room) => ({ ...roomToJson(room), hotel_name: room.hotel.name })),
    );
  } catch (err) {
    console.error("GET /api/rooms", err);
    return res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

app.get("/api/rooms/:id", async (req, res) => {
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

    return res.status(200).json({
      ...roomToJson(room),
      hotel_name: room.hotel.name,
      city: room.hotel.city,
      country: room.hotel.country,
      stars: room.hotel.stars,
    });
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

    return res.status(201).json(roomToJson(room));
  } catch (err) {
    console.error("POST /api/room", err);
    return res.status(500).json({ error: "Failed to create room" });
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

    return res.status(200).json(rooms.map(roomToJson));
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
}

/******************** Server ********************/
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
