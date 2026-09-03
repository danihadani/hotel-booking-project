import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import { useAuth } from '../auth.jsx';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Hero />

      <div className="card">
        <h2>ברוכה הבאה ל‑Booking Mini</h2>
        <p>
          כאן אפשר לעיין במלונות מכל העולם, לראות אילו חדרים יש בכל מלון, כמה עולה לילה,
          ולהזמין חדר לתאריכים שנוחים לך. ההזמנה מאושרת רק אם החדר באמת פנוי בתאריכים
          שביקשת — אחרת תתקבל הודעת שגיאה מסבירה.
        </p>

        {!user && (
          <p className="muted">
            <strong>שימי לב:</strong> כדי לבצע פעולה כלשהי באתר צריך להיות רשומה ומחוברת.
          </p>
        )}

        <div className="actions">
          <Link className="btn" to="/register">
            הרשם
          </Link>
          <Link className="btn secondary" to="/hotels">
            מלונות
          </Link>
        </div>
      </div>
    </>
  );
}
