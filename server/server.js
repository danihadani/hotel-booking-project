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
