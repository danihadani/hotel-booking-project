import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Stars from './Stars.jsx';

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setHotel(null);
    setError('');
    api.hotel(id).then(setHotel).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="errors">{error}</div>;
  if (!hotel) return <p className="muted">טוען פרטי מלון…</p>;

  return (
    <>
      <p className="muted">
        <Link to="/hotels">← חזרה לרשימת המלונות</Link>
      </p>

      <div className="card">
        <h2>{hotel.name}</h2>
        <Stars count={hotel.stars} />

        <ul className="detail-list">
          <li>
            <span className="label">מספר סידורי של המלון</span>
            <span className="value">{hotel.id}</span>
          </li>
          <li>
            <span className="label">דירוג</span>
            <span className="value">{hotel.stars} כוכבים</span>
          </li>
          <li>
            <span className="label">ארץ</span>
            <span className="value">{hotel.country}</span>
          </li>
          <li>
            <span className="label">עיר</span>
            <span className="value">{hotel.city}</span>
          </li>
          <li>
            <span className="label">מספר חדרים במלון</span>
            <span className="value">{hotel.number_of_rooms}</span>
          </li>
        </ul>
      </div>

      <div className="card">
        <h3>החדרים במלון ({hotel.rooms.length} מוצגים)</h3>
        <ul className="room-links">
          {hotel.rooms.map((room) => (
            <li key={room.id}>
              <Link to={`/rooms/${room.id}`}>{room.name}</Link>
              <span className="muted">
                עד {room.max_guests} אורחים · {room.price} ₪ ללילה
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
