// Fills the database with demo data. Run with:  npm run seed
// (Run "npm run initdb" first - it wipes and re-creates the tables.)
import bcrypt from 'bcryptjs';
import { pool, query, queryOne } from './db.js';

const HOTELS = [
  {
    name: 'King David',
    country: 'Israel',
    city: 'Jerusalem',
    number_of_rooms: 237,
    stars: 5,
    rooms: [
      { name: 'Judean Suite', max_guests: 4, price: 890, size: 62 },
      { name: 'Old City View', max_guests: 2, price: 610, size: 34 },
      { name: 'Garden Deluxe', max_guests: 3, price: 540, size: 41 },
      { name: 'Cedar Room', max_guests: 2, price: 430, size: 28 },
      { name: 'Tower Studio', max_guests: 2, price: 380, size: 25 },
      { name: 'Family Wing', max_guests: 6, price: 1120, size: 88 },
    ],
  },
  {
    name: 'Blue Lagoon',
    country: 'Israel',
    city: 'Tel Aviv',
    number_of_rooms: 154,
    stars: 4,
    rooms: [
      { name: 'Green Lagoon', max_guests: 6, price: 175, size: 78 },
      { name: 'Sunset Balcony', max_guests: 2, price: 320, size: 30 },
      { name: 'Beach Front', max_guests: 4, price: 480, size: 52 },
      { name: 'City Standard', max_guests: 2, price: 240, size: 22 },
      { name: 'Rooftop Loft', max_guests: 3, price: 560, size: 47 },
    ],
  },
  {
    name: 'Alpine Rose',
    country: 'Switzerland',
    city: 'Zermatt',
    number_of_rooms: 88,
    stars: 5,
    rooms: [
      { name: 'Matterhorn Suite', max_guests: 4, price: 1250, size: 70 },
      { name: 'Chalet Double', max_guests: 2, price: 720, size: 33 },
      { name: 'Ski Lodge', max_guests: 5, price: 980, size: 64 },
      { name: 'Pine Single', max_guests: 1, price: 410, size: 18 },
      { name: 'Glacier View', max_guests: 2, price: 830, size: 36 },
    ],
  },
  {
    name: 'Casa del Mar',
    country: 'Spain',
    city: 'Barcelona',
    number_of_rooms: 120,
    stars: 4,
    rooms: [
      { name: 'Gaudi Room', max_guests: 2, price: 290, size: 26 },
      { name: 'Rambla Suite', max_guests: 4, price: 520, size: 55 },
      { name: 'Patio Double', max_guests: 2, price: 260, size: 24 },
      { name: 'Marina Deluxe', max_guests: 3, price: 440, size: 38 },
      { name: 'Whale', max_guests: 2, price: 90, size: 36 },
    ],
  },
  {
    name: 'Sakura Garden',
    country: 'Japan',
    city: 'Kyoto',
    number_of_rooms: 64,
    stars: 3,
    rooms: [
      { name: 'Tatami Standard', max_guests: 2, price: 210, size: 20 },
      { name: 'Bamboo Suite', max_guests: 4, price: 470, size: 48 },
      { name: 'Zen Single', max_guests: 1, price: 150, size: 14 },
      { name: 'Temple View', max_guests: 3, price: 360, size: 35 },
      { name: 'Koi Pond Room', max_guests: 2, price: 280, size: 27 },
    ],
  },
];

const USERS = [
  { username: 'dana', password: '123456', full_name: 'Dana Levi', email: 'dana@example.com' },
  { username: 'yael', password: '123456', full_name: 'Yael Cohen', email: 'yael@example.com' },
];

async function seed() {
  // Start from a clean slate but keep the tables themselves.
  await query('TRUNCATE reservations, rooms, hotels, users RESTART IDENTITY CASCADE');

  for (const user of USERS) {
    const hash = await bcrypt.hash(user.password, 10);
    await query(
      'INSERT INTO users (username, password_hash, full_name, email) VALUES ($1,$2,$3,$4)',
      [user.username, hash, user.full_name, user.email]
    );
  }

  let roomCount = 0;
  for (const hotel of HOTELS) {
    const saved = await queryOne(
      `INSERT INTO hotels (name, country, city, number_of_rooms, stars)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [hotel.name, hotel.country, hotel.city, hotel.number_of_rooms, hotel.stars]
    );
    for (const room of hotel.rooms) {
      await query(
        `INSERT INTO rooms (hotel_id, name, max_guests, price, size)
         VALUES ($1,$2,$3,$4,$5)`,
        [saved.id, room.name, room.max_guests, room.price, room.size]
      );
      roomCount += 1;
    }
  }

  console.log(`Seeded ${USERS.length} users, ${HOTELS.length} hotels, ${roomCount} rooms.`);
  console.log('You can log in with   username: dana   password: 123456');
}

try {
  await seed();
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
