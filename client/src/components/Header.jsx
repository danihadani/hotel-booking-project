import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../auth.js';

/**
 * The bar at the top of every page.
 * It lives outside <Routes> in App.jsx, so it is written once and shown
 * everywhere - React only swaps the content underneath it.
 */
export default function Header() {
  const navigate = useNavigate();
  const user = getUser();

  function signOut() {
    logout();
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="inner">
        <Link className="brand" to="/">
          Booking<span>Mini</span>
        </Link>

        <nav>
          {/* NavLink marks itself "active" on the current page, which is what
              draws the orange underline. */}
          <NavLink to="/">דף הבית</NavLink>
          <NavLink to="/hotels">מלונות</NavLink>
          <NavLink to="/book">הזמנה</NavLink>

          {user ? (
            <>
              <span className="who">שלום, {user.full_name}</span>
              <button className="btn small" onClick={signOut}>
                יציאה
              </button>
            </>
          ) : (
            <>
              <NavLink to="/register">הרשם</NavLink>
              <NavLink to="/login">כניסה</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
