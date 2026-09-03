import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setRoom(null);
    setError('');
    api.room(id).then(setRoom).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="errors">{error}</div>;
  if (!room) return <p className="muted">טוען פרטי חדר…</p>;

  return (
    <>
      <p className="muted">
        <Link to={`/hotels/${room.hotel}`}>← חזרה למלון {room.hotel_name}</Link>
      </p>

      <div className="card">
        <h2>{room.name}</h2>
        <p className="muted">
          {room.hotel_name} — {room.city}, {room.country}
        </p>

        <ul className="detail-list">
          <li>
            <span className="label">שם החדר</span>
            <span className="value">{room.name}</span>
          </li>
          <li>
            <span className="label">מספר סידורי של החדר</span>
            <span className="value">{room.id}</span>
          </li>
          <li>
            <span className="label">מספר מקסימלי של אורחים</span>
            <span className="value">{room.max_guests}</span>
          </li>
          <li>
            <span className="label">מחיר ללילה</span>
            <span className="value">{room.price} ₪</span>
          </li>
          <li>
            <span className="label">גודל החדר</span>
            <span className="value">{room.size} מ״ר</span>
          </li>
        </ul>

        <div className="actions">
          <Link className="btn" to={`/book?hotel=${room.hotel}&room=${room.id}`}>
            הזמן עכשיו
          </Link>
        </div>
      </div>
    </>
  );
}
