import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Notice from './Notice.jsx';

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setRoom(null);
    setError('');
    api.room(id).then(setRoom).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <Notice>{error}</Notice>;
  if (!room) return <Notice>Loading room…</Notice>;

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-9">
      <Link to={`/hotels/${room.hotelId}`} className="label mt-10 inline-block text-smoke no-underline hover:text-ink">
        ← {room.hotel.name}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.85] tracking-[-0.06em]">
          {room.name}
        </h1>

        <p className="text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.85] tracking-[-0.06em]">
          <span className="bg-acid px-2">{room.price}</span>
          <span className="label ml-2 align-super text-smoke">ILS / night</span>
        </p>
      </div>

      <p className="label mt-6 text-smoke">
        {room.hotel.name} — {room.hotel.city}, {room.hotel.country}
      </p>

      <dl className="mt-10 grid grid-cols-2 border-t-2 border-ink sm:grid-cols-4">
        <Fact label="Room no." value={String(room.id).padStart(2, '0')} />
        <Fact label="Sleeps up to" value={`${room.maxGuests} guests`} />
        <Fact label="Size" value={`${room.size} m²`} />
        <Fact label="Per night" value={`${room.price} ILS`} />
      </dl>

      <Link
        to={`/book?hotel=${room.hotelId}&room=${room.id}`}
        className="label mt-12 mb-16 inline-block bg-ink px-7 py-4 text-paper no-underline hover:bg-acid hover:text-ink"
      >
        Book this room →
      </Link>
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
