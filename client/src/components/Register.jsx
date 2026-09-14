import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { saveLogin } from '../auth.js';
import Field, { Errors, Submit, FormShell } from './Field.jsx';

const EMPTY = { username: '', full_name: '', email: '', password: '', password_confirm: '' };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /** The same rules the server applies, so the answer is immediate. */
  function checkInBrowser() {
    const found = [];
    if (!/^[A-Za-z0-9_.-]{3,50}$/.test(form.username)) {
      found.push('Username: 3–50 characters — letters, digits, . _ or -');
    }
    if (form.full_name.trim().length < 2) found.push('Please enter your full name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.push('That email address is not valid');
    if (form.password.length < 6) found.push('Password must be at least 6 characters');
    if (form.password !== form.password_confirm) found.push('The two passwords do not match');
    return found;
  }

  async function submit(event) {
    event.preventDefault();
    const found = checkInBrowser();
    if (found.length) return setErrors(found);

    setErrors([]);
    setBusy(true);
    try {
      saveLogin(await api.signup(form));   // signing up logs you straight in
      navigate('/hotels', { replace: true });
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell eyebrow="Takes about a minute" title="SIGN UP">
      <form onSubmit={submit} className="grid gap-6">
        <Errors items={errors} />
        <Field label="Username" name="username" value={form.username} onChange={change} required autoFocus
               hint="Letters, digits, dot, dash or underscore" />
        <Field label="Full name" name="full_name" value={form.full_name} onChange={change} required />
        <Field label="Email" type="email" name="email" value={form.email} onChange={change} required />
        <Field label="Password" type="password" name="password" value={form.password} onChange={change} required minLength={6} />
        <Field label="Confirm password" type="password" name="password_confirm" value={form.password_confirm} onChange={change} required />
        <div><Submit busy={busy}>Create account →</Submit></div>
      </form>

      <p className="label mt-10 text-smoke">
        Already registered?{' '}
        <Link to="/login" className="text-ink underline decoration-acid decoration-4 underline-offset-4">
          Log in
        </Link>
      </p>
    </FormShell>
  );
}
