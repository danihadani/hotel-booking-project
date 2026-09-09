// ============================================================
// Who is logged in, kept in the browser's localStorage.
//
// There is no server session: the token IS the proof of login, so the
// browser holds it and sends it back on every request.
// ============================================================

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Called after a successful login or signup. */
export function saveLogin({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
