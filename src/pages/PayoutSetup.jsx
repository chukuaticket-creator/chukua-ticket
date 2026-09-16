import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { createSubaccount, getProfile } from '../lib/api';
import { useAuth } from '../lib/auth';

// Paystack-supported Kenyan settlement banks.
const BANKS = [
  'Equity Bank', 'KCB Bank', 'Co-operative Bank', 'NCBA Bank', 'Absa Bank Kenya',
  'Diamond Trust Bank', 'Family Bank', 'I&M Bank', 'Standard Chartered', 'Stanbic Bank',
  'National Bank of Kenya', 'Prime Bank', 'SBM Bank', 'HFC Bank', 'Gulf African Bank',
];

export default function PayoutSetup() {
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const [type, setType] = useState('mpesa'); // mpesa | bank
  const [form, setForm] = useState({ businessName: '', mpesaPhone: '', bankName: '', accountNumber: '' });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    let active = true;
    getProfile().then(p => {
      if (!active) return;
      if (p?.payoutActivated ?? p?.payout_activated) setDone(true);
      if (p?.orgName || p?.org_name) set('businessName', p.orgName || p.org_name);
      if (p?.phone) set('mpesaPhone', p.phone);
      setChecking(false);
    });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // percentage_charge is set to 93 per the split spec. The per-transaction
    // `transaction_charge` sent from checkout overrides it, so verify the
    // actual split with one live test sale before launch.
    const res = await createSubaccount({
      business_name: form.businessName,
      settlement_type: type,
      settlement_bank: type === 'bank' ? form.bankName : 'M-Pesa',
      account_number: type === 'bank' ? form.accountNumber : form.mpesaPhone,
      percentage_charge: 93,
    });

    setLoading(false);

    if (!res || res.error || !res.subaccount_code) {
      setError(res?.error || 'We couldn’t create your payout account. Check your details and try again.');
      return;
    }
    await refresh();
    setDone(true);
  };

  if (checking) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <CheckCircle2 size={56} style={{ color: 'var(--success)', margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 10 }}>Payouts are active</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.7, fontSize: 15 }}>
            Every ticket sale now splits automatically. Your 93% settles to your{' '}
            {type === 'bank' ? 'bank account' : 'M-Pesa number'} within 2 working days — you never have to request it.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/organiser')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <Link to="/organiser" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', gap: 6, marginBottom: 20 }}>
          <ArrowLeft size={15} /> Dashboard
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
          Set up your payout account
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.7, fontSize: 15 }}>
          Tell us where your ticket revenue should go. You only do this once — after that, every
          sale is split at the moment of payment and settles to you automatically.
        </p>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Business / account name *</label>
              <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
                placeholder="e.g. Nairobi Events Co." required />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Must match the name on the account receiving the money.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Where should we send your money? *</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                {[['mpesa', '📱 M-Pesa'], ['bank', '🏦 Bank account']].map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setType(id)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${type === id ? 'var(--ct-orange)' : 'var(--border)'}`,
                      background: type === id ? 'var(--ct-orange-dim)' : 'transparent',
                      color: type === id ? 'var(--ct-orange)' : 'var(--text-muted)',
                      fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {type === 'mpesa' ? (
              <div className="form-group">
                <label className="form-label">M-Pesa number *</label>
                <input type="tel" value={form.mpesaPhone} onChange={e => set('mpesaPhone', e.target.value)}
                  placeholder="+254 7XX XXX XXX" required />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Bank *</label>
                  <select value={form.bankName} onChange={e => set('bankName', e.target.value)} required>
                    <option value="">Select your bank</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account number *</label>
                  <input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)}
                    placeholder="0123456789" required />
                </div>
              </>
            )}

            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: 'var(--bg-2)', borderRadius: 10, padding: 14,
              fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              <ShieldCheck size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
              <span>
                Your details are sent straight to Paystack to create your payout account.
                Chukua Ticket never holds your money — each sale goes to you directly.
              </span>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save & Activate Payouts'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
