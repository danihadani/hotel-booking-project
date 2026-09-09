// ============================================================
// Every call to the Express server goes through here.
//
// The login token lives in localStorage, and this file attaches it to
// every request as   Authorization: Bearer <token>   - the same way the
// library project does it.
// ============================================================
import { getToken } from './auth.js';

async function request(url, options = {}) {
  const headers = {};
  if (options.body) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    // The server answers with { error: "..." }. For a reservation that error
    // is the name of the page to show: invalid_dates / invalid_room /
    // unavaliable_room. Everything else is a message for the user.
    const error = new Error((data && data.error) || 'Request failed');
    error.status = response.status;
    error.reason = data && data.error;
    throw error;
  }
  return data;
}

export const api = {
  signup: (body) => request('/api/users/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/users/login', { method: 'POST', body: JSON.stringify(body) }),

  hotels: () => request('/api/hotels'),
  hotel: (id) => request(`/api/hotels/${id}`),
  rooms: () => request('/api/rooms'),
  room: (id) => request(`/api/rooms/${id}`),

  createReservation: (body) =>
    request('/api/reservations', { method: 'POST', body: JSON.stringify(body) }),
  reservation: (id) => request(`/api/reservations/${id}`),
};
