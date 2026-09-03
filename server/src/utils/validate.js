// ============================================================
// Input validation helpers.
// Every function returns { ok: true, value } or { ok: false, errors: [...] }
// so the routes can answer with HTTP 400 and a clear message.
// ============================================================

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A non-empty, reasonably short string. */
function readString(source, field, errors, { max = 120 } = {}) {
  const raw = source[field];
  if (typeof raw !== 'string' || raw.trim() === '') {
    errors.push(`"${field}" is required and must be a non-empty string`);
    return null;
  }
  const value = raw.trim();
  if (value.length > max) {
    errors.push(`"${field}" must be at most ${max} characters`);
    return null;
  }
  return value;
}

/** A whole number inside [min, max]. Accepts "5" as well as 5. */
function readInt(source, field, errors, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = source[field];
  if (raw === undefined || raw === null || raw === '') {
    errors.push(`"${field}" is required`);
    return null;
  }
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    errors.push(`"${field}" must be a whole number`);
    return null;
  }
  if (value < min || value > max) {
    errors.push(`"${field}" must be between ${min} and ${max}`);
    return null;
  }
  return value;
}

/** A number (may have decimals) inside [min, max]. */
function readNumber(source, field, errors, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = source[field];
  if (raw === undefined || raw === null || raw === '') {
    errors.push(`"${field}" is required`);
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    errors.push(`"${field}" must be a number`);
    return null;
  }
  if (value <= min || value > max) {
    errors.push(`"${field}" must be greater than ${min}`);
    return null;
  }
  return value;
}

// ------------------------------------------------------------
// Domain validators
// ------------------------------------------------------------

/** POST /api/hotel/  body */
export function validateHotel(body) {
  const errors = [];
  const value = {
    name: readString(body, 'name', errors),
    country: readString(body, 'country', errors, { max: 60 }),
    city: readString(body, 'city', errors, { max: 60 }),
    number_of_rooms: readInt(body, 'number_of_rooms', errors, { min: 1, max: 100000 }),
    stars: readInt(body, 'stars', errors, { min: 1, max: 5 }),
  };
  return errors.length ? { ok: false, errors } : { ok: true, value };
}

/** POST /api/room/  body. "hotel" holds the id of the hotel in the database. */
export function validateRoom(body) {
  const errors = [];
  const value = {
    hotel: readInt(body, 'hotel', errors, { min: 1 }),
    name: readString(body, 'name', errors),
    max_guests: readInt(body, 'max_guests', errors, { min: 1, max: 20 }),
    price: readNumber(body, 'price', errors, { min: 0, max: 1000000 }),
    size: readInt(body, 'size', errors, { min: 1, max: 10000 }),
  };
  return errors.length ? { ok: false, errors } : { ok: true, value };
}

/** Registration form body. */
export function validateRegistration(body) {
  const errors = [];
  const username = readString(body, 'username', errors, { max: 50 });
  const full_name = readString(body, 'full_name', errors, { max: 100 });
  const email = readString(body, 'email', errors, { max: 120 });
  const password = typeof body.password === 'string' ? body.password : '';

  if (username && !/^[A-Za-z0-9_.-]{3,50}$/.test(username)) {
    errors.push('"username" must be 3-50 characters: letters, digits, . _ -');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('"email" is not a valid email address');
  }
  if (password.length < 6) {
    errors.push('"password" must be at least 6 characters');
  }
  if (body.password_confirm !== undefined && body.password_confirm !== password) {
    errors.push('The two passwords do not match');
  }
  return errors.length
    ? { ok: false, errors }
    : { ok: true, value: { username, full_name, email, password } };
}

// ------------------------------------------------------------
// Dates
// ------------------------------------------------------------

/** True when the string is a real calendar date written as YYYY-MM-DD. */
export function isValidDate(text) {
  if (typeof text !== 'string' || !DATE_RE.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  // Rejects things like 2024-02-31, which Date would silently roll over.
  return date.toISOString().slice(0, 10) === text;
}

/**
 * Validates a check-in / check-out pair.
 * Both must be real dates, and the check-out must come after the check-in.
 */
export function validateDateRange(startDate, endDate) {
  const errors = [];
  if (!isValidDate(startDate)) errors.push('"start_date" must be a real date in YYYY-MM-DD format');
  if (!isValidDate(endDate)) errors.push('"end_date" must be a real date in YYYY-MM-DD format');
  if (errors.length) return { ok: false, errors };

  if (endDate <= startDate) {
    errors.push('"end_date" must be later than "start_date"');
    return { ok: false, errors };
  }
  return { ok: true, value: { startDate, endDate, nights: nightsBetween(startDate, endDate) } };
}

/** Number of nights between two YYYY-MM-DD dates. */
export function nightsBetween(startDate, endDate) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  return Math.round((end - start) / MS_PER_DAY);
}
