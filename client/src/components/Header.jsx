import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../auth.js';

const link = ({ isActive }) =>
  `label px-2.5 py-1.5 no-underline ${isActive ? 'bg-acid text-ink' : 'text-ink hover:bg-hairline'}`;

/**
 * The bar at the top of every page. It sits outside <Routes> in App.jsx, so
 * it is written once and shown everywhere.
 */
export default function Header() {
  const navigate = useNavigate();
  const user = getUser();

  function signOut() {
    logout();
    navigate('/');
  }

  return (
    <header className="border-b-2 border-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3.5 sm:px-9">
        <Link to="/" className="text-[15px] font-extrabold tracking-[-0.04em] no-underline text-ink">
          BOOKING<span className="text-smoke">·</span>MINI
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/hotels" className={link}>Hotels</NavLink>
          <NavLink to="/book" className={link}>Book</NavLink>

          {user ? (
            <>
              <span className="label ml-2 text-smoke">{user.full_name}</span>
              <button onClick={signOut} className="label ml-1 cursor-pointer border-0 bg-ink px-2.5 py-1.5 text-paper hover:bg-acid hover:text-ink">
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/signup" className={link}>Sign up</NavLink>
              <NavLink to="/login" className={link}>Log in</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
