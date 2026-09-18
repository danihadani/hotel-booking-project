import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Stars from './Stars.jsx';
import Notice from './Notice.jsx';

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setHotel(null);
    setError('');
    api.hotel(id).then(setHotel).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <Notice>{error}</Notice>;
  if (!hotel) return <Notice>Loading hotel…</Notice>;

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-9">
      <Link to="/hotels" className="label mt-10 inline-block text-smoke no-underline hover:text-ink">
        ← All hotels
      </Link>

      <h1 className="mt-6 text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.85] tracking-[-0.06em]">
        {hotel.name}
      </h1>

      <dl className="mt-10 grid grid-cols-2 border-t-2 border-ink sm:grid-cols-4">
        <Fact label="Hotel no." value={String(hotel.id).padStart(2, '0')} />
        <Fact label="Rating" value={<Stars count={hotel.stars} />} />
        <Fact label="Country" value={hotel.country} />
        <Fact label="City" value={hotel.city} />
      </dl>

      <div className="mt-14 flex items-end justify-between border-b-2 border-ink pb-3">
        <h2 className="text-2xl font-extrabold tracking-[-0.04em]">Rooms</h2>
        <p className="label text-smoke">
          {hotel.rooms.length} listed / {hotel.numberOfRooms} in the hotel
        </p>
      </div>

      {hotel.rooms.map((room) => (
        <Link
          key={room.id}
          to={`/rooms/${room.id}`}
          className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-5 border-b border-hairline py-5 no-underline text-ink hover:border-ink"
        >
          <span className="label text-smoke">{String(room.id).padStart(2, '0')}</span>
          <span className="text-xl font-bold tracking-[-0.03em]">
            <span className="box-decoration-clone px-1 -mx-1 group-hover:bg-acid">{room.name}</span>
          </span>
          <span className="flex items-baseline gap-4">
            <span className="label text-smoke">{room.maxGuests} guests</span>
            <span className="text-xl font-extrabold tracking-[-0.04em]">
              {room.price}
              <span className="label ml-1 align-super text-smoke">ILS</span>
            </span>
          </span>
        </Link>
      ))}

      <div className="h-16" />
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="border-b border-hairline py-5 pr-6">
      <dt className="label mb-2 text-smoke">{label}</dt>
      <dd className="text-lg font-bold tracking-[-0.02em]">{value}</dd>
    </div>
  );
}
