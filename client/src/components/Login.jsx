import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { saveLogin } from '../auth.js';
import Field, { Errors, Submit, FormShell } from './Field.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      saveLogin(await api.login(form));   // keeps the token in localStorage
      navigate(location.state?.from || '/hotels', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell eyebrow="Welcome back" title="LOG IN">
      <form onSubmit={submit} className="grid gap-6">
        <Errors items={error ? [error] : []} />
        <Field label="Username" name="username" value={form.username} onChange={change} required autoFocus />
        <Field label="Password" type="password" name="password" value={form.password} onChange={change} required />
        <div><Submit busy={busy}>Log in →</Submit></div>
      </form>

      <p className="label mt-10 text-smoke">
        No account yet?{' '}
        <Link to="/signup" className="text-ink underline decoration-acid decoration-4 underline-offset-4">
          Sign up
        </Link>
      </p>
    </FormShell>
  );
}
