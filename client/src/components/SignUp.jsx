import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { saveLogin } from '../auth.js';
import Field, { Errors, Submit, FormShell } from './Field.jsx';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  /** The same rules the server applies, so the answer is immediate. */
  function checkInBrowser() {
    const found = [];
    if (!/^[A-Za-z0-9_.-]{3,50}$/.test(username)) {
      found.push('Username: 3–50 characters — letters, digits, . _ or -');
    }
    if (fullName.trim().length < 2) found.push('Please enter your full name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) found.push('That email address is not valid');
    if (password.length < 6) found.push('Password must be at least 6 characters');
    if (password !== passwordConfirm) found.push('The two passwords do not match');
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const found = checkInBrowser();
    if (found.length) return setErrors(found);

    setErrors([]);
    setBusy(true);

    try {
      const data = await api.signup({ username, full_name: fullName, email, password });
      saveLogin(data);                      // signing up logs you straight in
      navigate('/hotels', { replace: true });
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell eyebrow="Takes about a minute" title="SIGN UP">
      <form onSubmit={handleSubmit} className="grid gap-6">
        <Errors items={errors} />

        <Field
          label="Username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
          hint="Letters, digits, dot, dash or underscore"
        />
        <Field
          label="Full name"
          name="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Field
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Field
          label="Confirm password"
          type="password"
          name="password_confirm"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />

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
