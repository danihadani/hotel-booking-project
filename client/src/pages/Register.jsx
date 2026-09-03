import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const EMPTY = {
  username: '',
  full_name: '',
  email: '',
  password: '',
  password_confirm: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  /** The same rules the server checks - so the user gets an answer immediately. */
  function checkInBrowser() {
    const found = [];
    if (!/^[A-Za-z0-9_.-]{3,50}$/.test(form.username)) {
      found.push('שם משתמש: 3–50 תווים באנגלית, ספרות או . _ -');
    }
    if (form.full_name.trim().length < 2) found.push('יש להזין שם מלא');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.push('כתובת האימייל אינה תקינה');
    if (form.password.length < 6) found.push('הסיסמה חייבת להיות באורך 6 תווים לפחות');
    if (form.password !== form.password_confirm) found.push('שתי הסיסמאות אינן זהות');
    return found;
  }

  async function submit(event) {
    event.preventDefault();
    const found = checkInBrowser();
    if (found.length) return setErrors(found);

    setErrors([]);
    setBusy(true);
    try {
      await register(form);
      navigate('/hotels', { replace: true });
    } catch (err) {
      setErrors(err.errors);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>רישום משתמש/ת חדש/ה</h2>

      {errors.length > 0 && (
        <div className="errors">
          <ul>{errors.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      )}

      <form className="stack" onSubmit={submit}>
        <label>
          שם משתמש
          <input name="username" value={form.username} onChange={change} required autoFocus />
          <span className="field-hint">אותיות באנגלית, ספרות, נקודה, מקף או קו תחתון</span>
        </label>
        <label>
          שם מלא
          <input name="full_name" value={form.full_name} onChange={change} required />
        </label>
        <label>
          אימייל
          <input type="email" name="email" value={form.email} onChange={change} required />
        </label>
        <label>
          סיסמה
          <input type="password" name="password" value={form.password} onChange={change} required minLength={6} />
        </label>
        <label>
          אימות סיסמה
          <input
            type="password"
            name="password_confirm"
            value={form.password_confirm}
            onChange={change}
            required
          />
        </label>
        <div className="actions">
          <button className="btn" disabled={busy}>
            {busy ? 'רגע…' : 'הרשמה'}
          </button>
        </div>
      </form>

      <p className="muted">
        כבר רשומה? <Link to="/login">לכניסה לאתר</Link>
      </p>
    </div>
  );
}
