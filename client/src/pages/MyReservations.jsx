import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function MyReservations() {
  const [reservations, setReservations] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myReservations().then(setReservations).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="errors">{error}</div>;
  if (!reservations) return <p className="muted">טוען…</p>;

  if (reservations.length === 0) {
    return (
      <div className="card">
        <h2>ההזמנות שלי</h2>
        <p className="muted">עדיין לא ביצעת הזמנות.</p>
        <div className="actions">
          <Link className="btn" to="/hotels">
            למלונות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2>ההזמנות שלי</h2>
      <div className="card-grid">
        {reservations.map((reservation) => (
          <div className="card" key={reservation.id}>
            <h3>
              <Link to={`/reservation/${reservation.id}`}>הזמנה #{reservation.id}</Link>
            </h3>
            <p className="muted">
              {reservation.hotel.name} · {reservation.room.name}
              <br />
              {reservation.start_date} → {reservation.end_date} ({reservation.nights} לילות)
              <br />
              סה״כ {reservation.total_price.toFixed(2)} ₪
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
