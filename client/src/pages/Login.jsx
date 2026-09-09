import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { saveLogin } from '../auth.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.login(form);
      saveLogin(data); // keeps the token and the user in localStorage
      navigate(location.state?.from || '/hotels', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>כניסה לאתר</h2>

      {error && <div className="errors">{error}</div>}

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
