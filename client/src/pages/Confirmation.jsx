import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function Confirmation() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.reservation(id).then(setReservation).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="errors">{error}</div>;
  if (!reservation) return <p className="muted">טוען אישור הזמנה…</p>;

  const money = (amount) => `${amount.toFixed(2)} ₪`;

  return (
    <>
      <div className="confirm-banner">
        ההזמנה אושרה! מספר ההזמנה שלך הוא {reservation.id}
      </div>

      <div className="card">
        <h2>אישור הזמנה</h2>

        <ul className="detail-list">
          <li>
            <span className="label">מספר הזמנה</span>
            <span className="value">{reservation.id}</span>
          </li>
          <li>
            <span className="label">שם המזמין</span>
            <span className="value">{reservation.guest_name}</span>
          </li>
          <li>
            <span className="label">תאריך כניסה</span>
            <span className="value">{reservation.start_date}</span>
          </li>
          <li>
            <span className="label">תאריך עזיבה</span>
            <span className="value">{reservation.end_date}</span>
          </li>
          <li>
            <span className="label">מלון מבוקש</span>
            <span className="value">
              {reservation.hotel.name} — {reservation.hotel.city}
            </span>
          </li>
          <li>
            <span className="label">חדר מבוקש</span>
            <span className="value">{reservation.room.name}</span>
          </li>
        </ul>

        <div className="price-box">
          <div className="price-row">
            <span>
              {reservation.nights} לילות × {reservation.price_per_night} ₪
            </span>
            <span>{money(reservation.subtotal)}</span>
          </div>
          <div className="price-row">
            <span>מע״מ ({Math.round(reservation.vat_rate * 100)}%)</span>
            <span>{money(reservation.vat)}</span>
          </div>
          <div className="price-row total">
            <span>מחיר סופי</span>
            <span>{money(reservation.total_price)}</span>
          </div>
        </div>

        <div className="actions">
          <Link className="btn secondary" to="/hotels">
            להזמנה נוספת
          </Link>
        </div>
      </div>
    </>
  );
}
