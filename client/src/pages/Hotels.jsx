import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Stars from '../components/Stars.jsx';

export default function Hotels() {
  const [hotels, setHotels] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.hotels().then(setHotels).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="errors">{error}</div>;
  if (!hotels) return <p className="muted">טוען מלונות…</p>;

  return (
    <>
      <h2>המלונות שלנו</h2>
      <p className="muted">סה״כ {hotels.length} מלונות. לחצי על מלון כדי לראות את החדרים שבו.</p>

      <div className="card-grid">
        {hotels.map((hotel) => (
          <div className="card" key={hotel.id}>
            <h3>
              <Link to={`/hotels/${hotel.id}`}>{hotel.name}</Link>
            </h3>
            <Stars count={hotel.stars} />
            <p className="muted">
              {hotel.city}, {hotel.country}
              <br />
              {hotel.number_of_rooms} חדרים · מספר סידורי {hotel.id}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
