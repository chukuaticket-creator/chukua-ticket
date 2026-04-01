import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const LOGO = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: call your auth API
    await new Promise(r => setTimeout(r, 1000));
    // Demo: any credentials work
    if (form.email && form.password) {
      navigate('/organiser');
    } else {
      setError('Please enter your email and password.');
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src={LOGO} alt="Chukua Ticket" style={{ height: 44, margin: '0 auto 20px' }}
            onError={e => { e.target.style.display = 'none'; }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>Welcome back</h1>
          <p style={{ color: 'var(--ct-grey)', marginTop: 6 }}>Sign in to your account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--ct-danger)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--ct-danger)', marginBottom: 20 }}>
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
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ct-grey)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ct-grey)' }}>
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
  const [tab, setTab] = useState('attendee'); // attendee | organiser
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', orgName: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: call your auth/register API
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
          <CheckCircle2 size={60} style={{ color: 'var(--ct-success)', margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>You're in!</h2>
          <p style={{ color: 'var(--ct-grey)', marginBottom: 24 }}>
            Welcome, {form.name.split(' ')[0]}! Check your email to verify your account.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate(tab === 'organiser' ? '/organiser' : '/events')}>
            {tab === 'organiser' ? 'Go to Dashboard' : 'Discover Events'}
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
          <p style={{ color: 'var(--ct-grey)', marginTop: 6 }}>Free to join. Always.</p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: 'var(--ct-dark-2)', border: '1px solid var(--ct-border)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {['attendee', 'organiser'].map(t => (
            <button key={t} type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px', borderRadius: 9, border: 'none',
                background: tab === t ? 'var(--ct-orange)' : 'transparent',
                color: tab === t ? 'white' : 'var(--ct-grey)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-display)',
              }}>
              {t === 'attendee' ? '🎟️ Attendee' : '🎪 Organiser'}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 32 }}>
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
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ct-grey)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--ct-grey)' }}>
              By signing up you agree to Chukua Ticket's{' '}
              <Link to="/terms" style={{ color: 'var(--ct-orange)' }}>Terms</Link> and{' '}
              <Link to="/privacy" style={{ color: 'var(--ct-orange)' }}>Privacy Policy</Link>.
            </p>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ct-grey)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--ct-orange)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
