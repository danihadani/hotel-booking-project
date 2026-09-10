// ============================================================
// Everything to do with passwords and login tokens.
// ============================================================
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Refuse to start without a secret rather than quietly falling back to one
// written in the code: this file is on GitHub, so a fallback secret would be
// public, and anyone could forge a token with it.
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing. Copy server/.env.example to server/.env and set it.",
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

// How long a login lasts. This is a decision about how the app behaves, the
// same on every machine, so it belongs in the code and not in .env.
const TOKEN_LIFETIME = "1d";

/******************** Passwords ********************/
// A hash is one-way: we can check a password against it, but nobody -
// including us - can turn it back into the original password.
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/******************** Tokens ********************/
// The token is a signed note that says "this is user 3". The client keeps it
// and sends it back on every request. Because it is signed with JWT_SECRET,
// nobody can forge one or change the id inside it.
export function createToken(user) {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_LIFETIME,
  });
}

/******************** The login guard ********************/
// Put this in front of a route and only a logged-in user gets through.
// The assignment: "a visitor who is not registered cannot perform any action".
export function auth(req, res, next) {
  const header = req.headers.authorization || "";

  // The header looks like:  Authorization: Bearer <token>
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "You must be logged in to do that" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId; // every guarded route can now use req.userId
    req.username = payload.username;
    return next();
  } catch {
    return res.status(401).json({ error: "Your login has expired, please log in again" });
  }
}

/******************** Signup validation ********************/
// Throws a named error so the route can turn it into the right 400 message.
export function validateSignup(body) {
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !fullName || !email || !password) throw new Error("ALL_FIELDS_REQUIRED");
  if (!/^[A-Za-z0-9_.-]{3,50}$/.test(username)) throw new Error("INVALID_USERNAME");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("INVALID_EMAIL");
  if (password.length < 6) throw new Error("PASSWORD_TOO_SHORT");

  return { username, fullName, email, password };
}
