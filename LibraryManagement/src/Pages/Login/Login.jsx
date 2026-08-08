import { useState } from 'react';
import { api, auth } from '../../api';
import './Login.css';

function Login({ setPage, onLoggedIn })  {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await api.login(form);
      auth.setSession(data);
onLoggedIn(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="Page-title">Login</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button type="submit" className="auth-submit-btn" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Login'}
        </button>

        <p className="auth-switch">
          No account? <a onClick={() => setPage('Register')}>Register</a>
        </p>
      </form>
    </div>
  );
}

export default Login;