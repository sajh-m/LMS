import { useState } from 'react';
import { api, auth } from '../../api';
import './../Login/Login.css';

function Register({ setPage }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const data = await api.register(form);
      auth.setSession(data);
      setPage('Books');
    } catch (err) {
      setErrors(err.data?.details || [{ message: err.message }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="Page-title">Register</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        {errors.length > 0 && (
          <ul className="auth-error-list">
            {errors.map((e, i) => <li key={i}>{e.message}</li>)}
          </ul>
        )}

        <label htmlFor="name">Name:</label>
        <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label htmlFor="email">Email:</label>
        <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <label htmlFor="phone">Phone:</label>
        <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <label htmlFor="password">Password:</label>
        <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <button type="submit" className="auth-submit-btn" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>

        <p className="auth-switch">
          Already have an account? <a onClick={() => setPage('Login')}>Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;