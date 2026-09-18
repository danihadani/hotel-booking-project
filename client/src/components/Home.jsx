import { Link } from 'react-router-dom';
import Hero from './Hero.jsx';
import { isLoggedIn } from '../auth.js';

const STEPS = [
  ['01', 'Sign up', 'You have to be registered before you can do anything here.'],
  ['02', 'Pick a hotel', 'Five properties, twenty-six rooms, four countries.'],
  ['03', 'Choose your dates', 'We check if the room is free before confirming.'],
];

export default function Home() {
  const loggedIn = isLoggedIn();

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-6 sm:px-9">
        <div className="grid md:grid-cols-3">
          {STEPS.map(([n, title, text], i) => (
            <div
              key={n}
              className={`border-b border-hairline py-10 md:border-b-0 md:py-12 md:pr-10 ${i > 0 ? 'md:border-l md:border-hairline md:pl-10' : ''}`}
            >
              <p className="label mb-5 text-smoke">{n}</p>
              <h2 className="mb-3 text-2xl font-extrabold tracking-[-0.035em]">{title}</h2>
              <p className="font-mono text-[13px] leading-[1.9] text-smoke">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t-2 border-ink py-10">
          <Link to="/signup" className="label bg-acid px-6 py-3.5 text-ink no-underline hover:bg-ink hover:text-paper">
            Sign up
          </Link>
          <Link to="/hotels" className="label border-2 border-ink px-6 py-3 text-ink no-underline hover:bg-ink hover:text-paper">
            Browse hotels
          </Link>
          {!loggedIn && (
            <p className="label ml-auto text-smoke">You need an account to book</p>
          )}
        </div>
      </div>
    </>
  );
}
