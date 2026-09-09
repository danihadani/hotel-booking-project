import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../auth.js';

/**
 * Wraps a page that only a logged-in user may see.
 * A visitor without a token is sent to /login, and we remember where she
 * was heading so the login page can send her back there afterwards.
 */
export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
