import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { getUser } from '../auth.js';
import Field, { Select, Errors, Submit, FormShell } from './Field.jsx';

const PAGE_ERRORS = ['invalid_dates', 'invalid_room', 'unavaliable_room'];

export default function BookingForm() {
  const user = getUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  // "Book this room" arrives as /book?hotel=2&room=7 and fills the dropdowns.
  const [form, setForm] = useState({
    guest_name: '',
    start_date: '',
    end_date: '',
    hotel: params.get('hotel') || '',
    room: params.get('room') || '',
  });

  useEffect(() => {
    Promise.all([api.hotels(), api.rooms()])
      .then(([hotelList, roomList]) => {
        setHotels(hotelList);
        setRooms(roomList);
      })
      .catch((err) => setErrors([err.message]));
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, guest_name: f.guest_name || user.full_name }));
  }, [user]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const chosenRoom = useMemo(
    () => rooms.find((r) => String(r.id) === String(form.room)),
    [rooms, form.room],
  );

  async function submit(event) {
    event.preventDefault();
    setErrors([]);

    // ---- checks in the browser ----
    const found = [];
    if (!form.guest_name.trim()) found.push('Please enter a guest name');
    if (!form.hotel) found.push('Please choose a hotel');
    if (!form.room) found.push('Please choose a room');
    if (found.length) return setErrors(found);

    if (!form.start_date || !form.end_date || form.end_date <= form.start_date) {
      return navigate('/invalid_dates');
    }

    // ---- and again on the server, which has the last word ----
    setBusy(true);
    try {
      const reservation = await api.createReservation(form);
      navigate(`/reservation/${reservation.id}`, { replace: true });
    } catch (err) {
      // The server answers with the name of the page to show.
      if (PAGE_ERRORS.includes(err.reason)) navigate(`/${err.reason}`);
      else setErrors([err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell eyebrow="Step 03 — your dates" title="BOOK A ROOM">
      <form onSubmit={submit} className="grid gap-6">
        <Errors items={errors} />

        <Field label="Guest name" name="guest_name" value={form.guest_name} onChange={change} required />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Check in" type="date" name="start_date" value={form.start_date} onChange={change} required />
          <Field label="Check out" type="date" name="end_date" value={form.end_date} onChange={change} required />
        </div>

        <Select label="Hotel" name="hotel" value={form.hotel} onChange={change} required>
          <option value="">— choose a hotel —</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {String(h.id).padStart(2, '0')} · {h.name} — {h.city} ({h.stars}★)
            </option>
          ))}
        </Select>

        <Select
          label="Room"
          name="room"
          value={form.room}
          onChange={change}
          required
          hint="This list holds every room in every hotel"
        >
          <option value="">— choose a room —</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {String(r.id).padStart(2, '0')} · {r.hotel.name} / {r.name} — {r.price} ILS
            </option>
          ))}
        </Select>

        {chosenRoom && (
          <p className="border-2 border-ink px-4 py-3 font-mono text-[12px] leading-[1.9]">
            <b className="font-bold">{chosenRoom.name}</b> at {chosenRoom.hotel.name}
            <br />
            Up to {chosenRoom.maxGuests} guests · {chosenRoom.size} m² ·{' '}
            <span className="bg-acid px-1">{chosenRoom.price} ILS / night</span>
          </p>
        )}

        <div><Submit busy={busy}>Send reservation →</Submit></div>
      </form>
    </FormShell>
  );
}
