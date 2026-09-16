import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { login as apiLogin, register as apiRegister } from '../lib/api';
import { useAuth } from '../lib/auth';

const LOGO = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiLogin(form.email, form.password);
    setLoading(false);

    if (!res || res.error) {
      setError(res?.error || 'That email and password combination didn’t work. Try again.');
      return;
    }
    signIn(res);
    navigate(res.user?.role === 'organiser' ? '/organiser' : '/events');
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src={LOGO} alt="Chukua Ticket" style={{ height: 44, margin: '0 auto 20px' }}
            onError={e => { e.target.style.display = 'none'; }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Sign in to your account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Password
                <Link to="/forgot-password" style={{ color: 'var(--ct-orange)', fontSize: 12 }}>Forgot?</Link>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--ct-orange)', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [tab, setTab] = useState('attendee'); // attendee | organiser
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', orgName: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiRegister({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: tab,
      orgName: tab === 'organiser' ? form.orgName : undefined,
    });
    setLoading(false);

    if (!res || res.error) {
      setError(res?.error || 'We couldn’t create your account. Please try again.');
      return;
    }
    signIn(res);
    // With "Confirm email" on, Supabase creates the account but issues no
    // session until the link is clicked. Sending them to a signed-in page
    // here is what produced "Please sign in again".
    setNeedsConfirm(Boolean(res.needsEmailConfirmation));
    setDone(true);
  };

  if (done) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
          <CheckCircle2 size={60} style={{ color: 'var(--success)', margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>You're in!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7 }}>
            {needsConfirm
              ? `Welcome, ${form.name.split(' ')[0]}! We've sent a confirmation link to ${form.email}. Click it, then sign in to continue.`
              : `Welcome, ${form.name.split(' ')[0]}! Your account is ready.`}
          </p>
          {!needsConfirm && tab === 'organiser' && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              One more step: add your M-Pesa or bank details so ticket revenue can reach you.
            </p>
          )}
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              if (needsConfirm) return navigate('/login');
              navigate(tab === 'organiser' ? '/organiser/setup-payout' : '/events');
            }}
          >
            {needsConfirm ? 'Go to Sign In' : (tab === 'organiser' ? 'Set Up Payouts' : 'Discover Events')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src={LOGO} alt="Chukua Ticket" style={{ height: 44, margin: '0 auto 20px' }}
            onError={e => { e.target.style.display = 'none'; }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Free to join. Always.</p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {['attendee', 'organiser'].map(t => (
            <button key={t} type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px', borderRadius: 9, border: 'none',
                background: tab === t ? 'var(--ct-orange)' : 'transparent',
                color: tab === t ? 'white' : 'var(--text-muted)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-display)',
              }}>
              {t === 'attendee' ? '🎟️ Attendee' : '🎪 Organiser'}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Wanjiru" required />
            </div>

            {tab === 'organiser' && (
              <div className="form-group">
                <label className="form-label">Organisation / Company Name *</label>
                <input value={form.orgName} onChange={e => set('orgName', e.target.value)} placeholder="e.g. Nairobi Events Co." required />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone (M-Pesa number)</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 7XX XXX XXX" />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              By signing up you agree to Chukua Ticket's{' '}
              <Link to="/terms" style={{ color: 'var(--ct-orange)' }}>Terms</Link> and{' '}
              <Link to="/privacy" style={{ color: 'var(--ct-orange)' }}>Privacy Policy</Link>.
            </p>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--ct-orange)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
