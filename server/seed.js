// Fills the database with demo data.   Run with:  npm run seed
import bcrypt from "bcrypt";
import { prisma } from "./prisma.js";

const hotels = [
  {
    name: "King David", country: "Israel", city: "Jerusalem",
    numberOfRooms: 237, stars: 5,
    rooms: [
      { name: "Judean Suite",   maxGuests: 4, price: 890,  size: 62 },
      { name: "Old City View",  maxGuests: 2, price: 610,  size: 34 },
      { name: "Garden Deluxe",  maxGuests: 3, price: 540,  size: 41 },
      { name: "Cedar Room",     maxGuests: 2, price: 430,  size: 28 },
      { name: "Tower Studio",   maxGuests: 2, price: 380,  size: 25 },
      { name: "Family Wing",    maxGuests: 6, price: 1120, size: 88 },
    ],
  },
  {
    name: "Blue Lagoon", country: "Israel", city: "Tel Aviv",
    numberOfRooms: 154, stars: 4,
    rooms: [
      { name: "Green Lagoon",   maxGuests: 6, price: 175, size: 78 },
      { name: "Sunset Balcony", maxGuests: 2, price: 320, size: 30 },
      { name: "Beach Front",    maxGuests: 4, price: 480, size: 52 },
      { name: "City Standard",  maxGuests: 2, price: 240, size: 22 },
      { name: "Rooftop Loft",   maxGuests: 3, price: 560, size: 47 },
    ],
  },
  {
    name: "Alpine Rose", country: "Switzerland", city: "Zermatt",
    numberOfRooms: 88, stars: 5,
    rooms: [
      { name: "Matterhorn Suite", maxGuests: 4, price: 1250, size: 70 },
      { name: "Chalet Double",    maxGuests: 2, price: 720,  size: 33 },
      { name: "Ski Lodge",        maxGuests: 5, price: 980,  size: 64 },
      { name: "Pine Single",      maxGuests: 1, price: 410,  size: 18 },
      { name: "Glacier View",     maxGuests: 2, price: 830,  size: 36 },
    ],
  },
  {
    name: "Casa del Mar", country: "Spain", city: "Barcelona",
    numberOfRooms: 120, stars: 4,
    rooms: [
      { name: "Gaudi Room",    maxGuests: 2, price: 290, size: 26 },
      { name: "Rambla Suite",  maxGuests: 4, price: 520, size: 55 },
      { name: "Patio Double",  maxGuests: 2, price: 260, size: 24 },
      { name: "Marina Deluxe", maxGuests: 3, price: 440, size: 38 },
      { name: "Whale",         maxGuests: 2, price: 90,  size: 36 },
    ],
  },
  {
    name: "Sakura Garden", country: "Japan", city: "Kyoto",
    numberOfRooms: 64, stars: 3,
    rooms: [
      { name: "Tatami Standard", maxGuests: 2, price: 210, size: 20 },
      { name: "Bamboo Suite",    maxGuests: 4, price: 470, size: 48 },
      { name: "Zen Single",      maxGuests: 1, price: 150, size: 14 },
      { name: "Temple View",     maxGuests: 3, price: 360, size: 35 },
      { name: "Koi Pond Room",   maxGuests: 2, price: 280, size: 27 },
    ],
  },
];

const users = [
  { username: "dana", password: "123456", fullName: "Dana Levi",  email: "dana@example.com" },
  { username: "yael", password: "123456", fullName: "Yael Cohen", email: "yael@example.com" },
];

async function seed() {
  // Start from a clean slate. Order matters: a reservation points at a room,
  // so the reservations have to go first.
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({ data: { ...user, password: hashedPassword } });
  }

  let roomCount = 0;
  for (const { rooms, ...hotel } of hotels) {
    // A "nested create": Prisma writes the hotel, then writes its rooms and
    // fills in each room's hotelId by itself.
    await prisma.hotel.create({
      data: { ...hotel, rooms: { create: rooms } },
    });
    roomCount += rooms.length;
  }

  console.log(`Seeded ${users.length} users, ${hotels.length} hotels, ${roomCount} rooms.`);
  console.log("You can log in with   username: dana   password: 123456");
}

seed()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
