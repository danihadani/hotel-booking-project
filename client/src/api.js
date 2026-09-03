// ============================================================
// One small helper for every call to the Express server.
// "credentials: include" makes the browser send the login cookie.
// ============================================================

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error((data && data.errors && data.errors[0]) || 'Request failed');
    error.status = response.status;
    error.reason = data && data.error; // invalid_dates / invalid_room / unavaliable_room
    error.errors = (data && data.errors) || [error.message];
    throw error;
  }
  return data;
}

export const api = {
  me: () => request('/api/me'),
  login: (body) => request('/api/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/logout', { method: 'POST' }),

  hotels: () => request('/api/hotels'),
  hotel: (id) => request(`/api/hotels/${id}`),
  rooms: () => request('/api/rooms'),
  room: (id) => request(`/api/rooms/${id}`),

  createReservation: (body) =>
    request('/api/reservations', { method: 'POST', body: JSON.stringify(body) }),
  reservation: (id) => request(`/api/reservations/${id}`),
  myReservations: () => request('/api/my-reservations'),
};
