import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { getUser, isLoggedIn, logout } from './auth.js';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Hotels from './pages/Hotels.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import RoomDetails from './pages/RoomDetails.jsx';
import BookingForm from './pages/BookingForm.jsx';
import Confirmation from './pages/Confirmation.jsx';
import ErrorPage from './components/ErrorPage.jsx';

/** Wraps a page that only a logged-in user may see. */
function RequireAuth({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function Header() {
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

export default function App() {
  return (
    <>
      <Header />

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Everything below needs a logged-in user. */}
          <Route path="/hotels" element={<RequireAuth><Hotels /></RequireAuth>} />
          <Route path="/hotels/:id" element={<RequireAuth><HotelDetails /></RequireAuth>} />
          <Route path="/rooms/:id" element={<RequireAuth><RoomDetails /></RequireAuth>} />
          <Route path="/book" element={<RequireAuth><BookingForm /></RequireAuth>} />
          <Route path="/reservation/:id" element={<RequireAuth><Confirmation /></RequireAuth>} />

          {/* The three reservation error pages. */}
          <Route
            path="/unavaliable_room"
            element={
              <ErrorPage
                title="The room is not avaliable at the dates requested"
                subtitle="No reservation made !!"
              />
            }
          />
          <Route
            path="/invalid_room"
            element={
              <ErrorPage
                title="The room does not exist in the hotel"
                subtitle="No reservation made !!"
              />
            }
          />
          <Route
            path="/invalid_dates"
            element={
              <ErrorPage title="Dates in reservation are invalid" subtitle="No reservation made" />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="site-footer">
        פרויקט מסכם — From Web to Database · Express + React + PostgreSQL
      </footer>
    </>
  );
}
