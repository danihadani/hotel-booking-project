import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Notice } from './Hotels.jsx';

export default function Confirmation() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.reservation(id).then(setReservation).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <Notice>{error}</Notice>;
  if (!reservation) return <Notice>Loading your confirmation…</Notice>;

  const money = (n) => n.toFixed(2);

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-9">
      <p className="label mt-12 text-smoke">Confirmed</p>

      <h1 className="mt-4 text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.85] tracking-[-0.06em]">
        RESERVATION <span className="bg-acid px-2">#{String(reservation.id).padStart(4, '0')}</span>
      </h1>

      <dl className="mt-12 grid grid-cols-2 border-t-2 border-ink sm:grid-cols-3">
        <Fact label="Guest" value={reservation.guestName} />
        <Fact label="Hotel" value={`${reservation.hotel.name} — ${reservation.hotel.city}`} />
        <Fact label="Room" value={reservation.room.name} />
        <Fact label="Check in" value={reservation.startDate} />
        <Fact label="Check out" value={reservation.endDate} />
        <Fact label="Nights" value={reservation.nights} />
      </dl>

      <div className="mt-14 max-w-md border-t-2 border-ink pt-6">
        <Line
          left={`${reservation.nights} nights × ${reservation.pricePerNight} ILS`}
          right={money(reservation.subtotal)}
        />
        <Line left={`VAT ${Math.round(reservation.vatRate * 100)}%`} right={money(reservation.vat)} />

        <div className="mt-3 flex items-baseline justify-between border-t-2 border-ink pt-4">
          <span className="label">Total</span>
          <span className="text-4xl font-extrabold tracking-[-0.05em]">
            <span className="bg-acid px-2">{money(reservation.totalPrice)}</span>
            <span className="label ml-2 align-super text-smoke">ILS</span>
          </span>
        </div>
      </div>

      <Link
        to="/hotels"
        className="label mt-12 mb-20 inline-block border-2 border-ink px-6 py-3 text-ink no-underline hover:bg-ink hover:text-paper"
      >
        Book another room
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

function Line({ left, right }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 font-mono text-[13px]">
      <span className="text-smoke">{left}</span>
      <span>{right}</span>
    </div>
  );
}
