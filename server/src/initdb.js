// Creates (or re-creates) all the tables. Run with:  npm run initdb
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

try {
  await pool.query(sql);
  console.log('Tables created: users, hotels, rooms, reservations');
} catch (err) {
  console.error('Could not create the tables:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
