import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Auth';
import { ErrorMessage } from '../components/UI';

function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/';
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else await register({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password });
      navigate(from, { replace: true });
    } catch (err) { setError(err); setBusy(false); }
  }

  return (
    <>
      <h1>{isLogin ? 'Log in' : 'Create your account'}</h1>
      <form className="form" onSubmit={submit}>
        {!isLogin && <label>Full name<input required maxLength={100} value={form.name} onChange={set('name')} autoComplete="name" /></label>}
        <label>Email<input required type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
        {!isLogin && <label>Phone (optional)<input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>}
        <label>Password{!isLogin && ' (min 8 characters)'}
          <input required type="password" minLength={isLogin ? 1 : 8} maxLength={72} value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} />
        </label>
        <ErrorMessage error={error} />
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}</button>
      </form>
      <p>{isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Log in</Link></>}</p>
    </>
  );
}
export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
