import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const change = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setErrors([]);
    setBusy(true);
    try {
      await login(form);
      navigate(location.state?.from || '/hotels', { replace: true });
    } catch (err) {
      setErrors(err.errors);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>כניסה לאתר</h2>

      {errors.length > 0 && (
        <div className="errors">
          <ul>{errors.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      )}

      <form className="stack" onSubmit={submit}>
        <label>
          שם משתמש
          <input name="username" value={form.username} onChange={change} required autoFocus />
        </label>
        <label>
          סיסמה
          <input type="password" name="password" value={form.password} onChange={change} required />
        </label>
        <div className="actions">
          <button className="btn" disabled={busy}>
            {busy ? 'רגע…' : 'כניסה'}
          </button>
        </div>
      </form>

      <p className="muted">
        עוד אין לך חשבון? <Link to="/register">להרשמה</Link>
      </p>
    </div>
  );
}
