import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { saveLogin } from '../auth.js';
import Field, { Errors, Submit, FormShell } from './Field.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setBusy(true);

    try {
      const data = await api.login({ username, password });
      saveLogin(data);                      // the token goes into localStorage
      navigate(location.state?.from || '/hotels', { replace: true });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell eyebrow="Welcome back" title="LOG IN">
      <form onSubmit={handleSubmit} className="grid gap-6">
        <Errors items={message ? [message] : []} />

        <Field
          label="Username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
        <Field
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

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
