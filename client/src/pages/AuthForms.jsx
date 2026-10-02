import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/Auth';
import { useTitle } from '@/hooks/useTitle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/auth/Field';
import PasswordInput from '@/components/auth/PasswordInput';
import { describeError } from '@/components/common/errors';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ()-]{7,20}$/;

function validate(mode, f) {
  const e = {};
  if (mode === 'register' && !f.name.trim()) e.name = 'Enter your full name.';
  if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (mode === 'register' && f.phone && !PHONE.test(f.phone.trim())) e.phone = 'Enter a valid phone number, e.g. +254 700 000 000.';
  if (!f.password) e.password = 'Enter your password.';
  else if (mode === 'register' && f.password.length < 8) e.password = 'Use at least 8 characters.';
  return e;
}

function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  useTitle(isLogin ? 'Log in' : 'Create account');
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/';
  const formRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: undefined }); };

  if (user && !busy) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const found = validate(mode, form);
    setErrors(found); setFormError(null);
    if (Object.keys(found).length) { formRef.current?.querySelector(`#${Object.keys(found)[0]}`)?.focus(); return; }
    setBusy(true);
    try {
      const u = isLogin
        ? await login({ email: form.email.trim(), password: form.password })
        : await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, password: form.password });
      toast.success(isLogin ? `Welcome back, ${u.name.split(' ')[0]}!` : `Welcome to GreenMart, ${u.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      // Show server-side field errors next to their fields, everything else in an alert.
      const fieldErrs = {};
      (err.details || []).forEach((d) => { if (d.path) fieldErrs[d.path] = d.message; });
      if (Object.keys(fieldErrs).length) setErrors(fieldErrs);
      const d = describeError(err);
      if (Object.keys(fieldErrs).length) setFormError({ title: 'Please check the highlighted fields', text: '' });
      else if (err.status === 0 || err.status >= 500 || err.status === 429) setFormError({ title: d.title, text: d.text });
      else setFormError({ title: isLogin ? 'Could not log in' : 'Could not create account', text: err.message });
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title={isLogin ? 'Welcome back' : 'Create your account'}
      description={isLogin ? 'Log in to track orders and check out faster.' : 'Order fresh produce and track every delivery.'}
      footer={isLogin ? <>New to GreenMart? <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/register" state={{ from }}>Create an account</Link></> : <>Already have an account? <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/login" state={{ from }}>Log in</Link></>}
    >
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>{formError.title}</AlertTitle>
            {formError.text && <AlertDescription>{formError.text}</AlertDescription>}
          </Alert>
        )}
        {!isLogin && <Field id="name" label="Full name" error={errors.name}>{(p) => <Input {...p} value={form.name} onChange={set('name')} maxLength={100} autoComplete="name" />}</Field>}
        <Field id="email" label="Email" error={errors.email}>{(p) => <Input {...p} type="email" value={form.email} onChange={set('email')} maxLength={254} autoComplete="email" />}</Field>
        {!isLogin && <Field id="phone" label="Phone (optional)" error={errors.phone}>{(p) => <Input {...p} type="tel" value={form.phone} onChange={set('phone')} maxLength={20} autoComplete="tel" placeholder="+254 700 000 000" />}</Field>}
        <Field id="password" label="Password" error={errors.password} hint={isLogin ? undefined : 'At least 8 characters.'}>
          {(p) => <PasswordInput {...p} value={form.password} onChange={set('password')} maxLength={72} autoComplete={isLogin ? 'current-password' : 'new-password'} />}
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {busy ? (isLogin ? 'Logging in…' : 'Creating account…') : isLogin ? 'Log in' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
