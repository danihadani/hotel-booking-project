import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Stars from './Stars.jsx';

export default function Hotels() {
  const [hotels, setHotels] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.hotels().then(setHotels).catch((err) => setError(err.message));
  }, []);

  if (error) return <Notice>{error}</Notice>;
  if (!hotels) return <Notice>Loading hotels…</Notice>;

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-9">
      <div className="flex flex-wrap items-end gap-4 pb-8 pt-12">
        <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.85] tracking-[-0.06em]">
          HOTELS
        </h1>
        <p className="label mb-2 text-smoke">{String(hotels.length).padStart(2, '0')} properties</p>
      </div>

      <div className="border-t-2 border-ink">
        {hotels.map((hotel) => (
          <Link
            key={hotel.id}
            to={`/hotels/${hotel.id}`}
            className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-5 gap-y-2 border-b border-ink py-6 no-underline text-ink sm:grid-cols-[3.5rem_1fr_12rem_7rem]"
          >
            <span className="label text-smoke">{String(hotel.id).padStart(2, '0')}</span>

            <span className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold leading-none tracking-[-0.045em]">
              <span className="box-decoration-clone px-1 -mx-1 group-hover:bg-acid">{hotel.name}</span>
            </span>

            <span className="label col-start-2 text-smoke sm:col-start-3">
              {hotel.city} / {hotel.country}
            </span>

            <span className="col-start-2 flex items-baseline gap-3 sm:col-start-4 sm:justify-end">
              <Stars count={hotel.stars} />
              <span className="label text-smoke">{hotel.numberOfRooms} rm</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Notice({ children }) {
  return <p className="label mx-auto max-w-6xl px-6 py-16 text-smoke sm:px-9">{children}</p>;
}
