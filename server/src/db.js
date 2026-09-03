import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL returns NUMERIC columns as strings by default (to avoid losing
// precision). Our prices are small, so we ask node-postgres to hand them back
// as real JS numbers - that way the JSON we send out looks like
// "price": 175  and not  "price": "175.00".
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => parseFloat(value));
// DATE columns should stay plain 'YYYY-MM-DD' strings, not JS Date objects
// (a Date would be shifted by the local timezone when serialized to JSON).
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

export const pool = new pg.Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'booking',
  password: process.env.PGPASSWORD || 'booking',
  database: process.env.PGDATABASE || 'booking',
});

/** Run a query and get the rows back. */
export async function query(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}

/** Run a query that is expected to return a single row (or undefined). */
export async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0];
}
