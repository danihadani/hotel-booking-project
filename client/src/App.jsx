import { Navigate, Route, Routes } from 'react-router-dom';

import Header from './components/Header.jsx';
import RequireAuth from './components/RequireAuth.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Hotels from './pages/Hotels.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import RoomDetails from './pages/RoomDetails.jsx';
import BookingForm from './pages/BookingForm.jsx';
import Confirmation from './pages/Confirmation.jsx';
import { UnavaliableRoom, InvalidRoom, InvalidDates } from './pages/ErrorPages.jsx';

/**
 * The shape of the whole site: a fixed header, the page for the current
 * address, and a fixed footer. Only the middle changes as you navigate.
 */
export default function App() {
  return (
    <>
      <Header />

      <main className="page">
        <Routes>
          {/* Open to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Only for a logged-in user */}
          <Route path="/hotels" element={<RequireAuth><Hotels /></RequireAuth>} />
          <Route path="/hotels/:id" element={<RequireAuth><HotelDetails /></RequireAuth>} />
          <Route path="/rooms/:id" element={<RequireAuth><RoomDetails /></RequireAuth>} />
          <Route path="/book" element={<RequireAuth><BookingForm /></RequireAuth>} />
          <Route path="/reservation/:id" element={<RequireAuth><Confirmation /></RequireAuth>} />

          {/* The three reservation errors */}
          <Route path="/unavaliable_room" element={<UnavaliableRoom />} />
          <Route path="/invalid_room" element={<InvalidRoom />} />
          <Route path="/invalid_dates" element={<InvalidDates />} />

          {/* Anything else goes home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="site-footer">
        פרויקט מסכם — From Web to Database · Express + React + PostgreSQL
      </footer>
    </>
  );
}
