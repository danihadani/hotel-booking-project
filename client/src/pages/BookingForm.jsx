import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function BookingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  // "הזמן עכשיו" from a room page arrives as /book?hotel=2&room=7 and pre-fills
  // the two dropdowns.
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
      .catch((err) => setErrors(err.errors));
  }, []);

  useEffect(() => {
    if (user) setForm((current) => ({ ...current, guest_name: current.guest_name || user.full_name }));
  }, [user]);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const chosenRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(form.room)),
    [rooms, form.room]
  );

  async function submit(event) {
    event.preventDefault();
    setErrors([]);

    // ---- checks in the browser ----
    const found = [];
    if (!form.guest_name.trim()) found.push('יש להזין שם מזמין');
    if (!form.hotel) found.push('יש לבחור מלון');
    if (!form.room) found.push('יש לבחור חדר');
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
      if (err.reason === 'invalid_dates') navigate('/invalid_dates');
      else if (err.reason === 'invalid_room') navigate('/invalid_room');
      else if (err.reason === 'unavaliable_room') navigate('/unavaliable_room');
      else setErrors(err.errors);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>טופס הזמנה</h2>
      <p className="muted">
        אפשר לבחור כל חדר מכל מלון. אם החדר אינו שייך למלון שנבחר — תתקבל הודעת שגיאה.
      </p>

      {errors.length > 0 && (
        <div className="errors">
          <ul>{errors.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      )}

      <form className="stack wide" onSubmit={submit}>
        <label>
          שם המזמין
          <input name="guest_name" value={form.guest_name} onChange={change} required />
        </label>

        <label>
          תאריך כניסה
          <input type="date" name="start_date" value={form.start_date} onChange={change} required />
        </label>

        <label>
          תאריך עזיבה
          <input type="date" name="end_date" value={form.end_date} onChange={change} required />
        </label>

        <label>
          מלון מבוקש
          <select name="hotel" value={form.hotel} onChange={change} required>
            <option value="">— בחרי מלון —</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name} — {hotel.city} ({hotel.stars}★)
              </option>
            ))}
          </select>
        </label>

        <label>
          חדר מבוקש
          <select name="room" value={form.room} onChange={change} required>
            <option value="">— בחרי חדר —</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.hotel_name} / {room.name} — {room.price} ₪ ללילה
              </option>
            ))}
          </select>
          <span className="field-hint">הרשימה כוללת את כל החדרים בכל המלונות</span>
        </label>

        {chosenRoom && (
          <p className="muted">
            נבחר: <strong>{chosenRoom.name}</strong> במלון {chosenRoom.hotel_name} · עד{' '}
            {chosenRoom.max_guests} אורחים · {chosenRoom.size} מ״ר · {chosenRoom.price} ₪ ללילה
          </p>
        )}

        <div className="actions">
          <button className="btn" disabled={busy}>
            {busy ? 'שולח…' : 'שלח הזמנה'}
          </button>
        </div>
      </form>
    </div>
  );
}
