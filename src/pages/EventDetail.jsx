import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Share2, Heart, ArrowLeft, Minus, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { EVENTS, formatKES, formatDate, getStatusBadge } from '../lib/data';
import { calculateFees, openPaystack, generateRef } from '../lib/paystack';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = EVENTS.find(e => e.id === id);

  const [quantities, setQuantities] = useState({});
  const [wishlist, setWishlist] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [toast, setToast] = useState(null);

  if (!event) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12 }}>Event not found</h2>
        <Link to="/events" className="btn btn-primary">Browse Events</Link>
      </div>
    </div>
  );

  const status = getStatusBadge(event.status);
  const soldPercent = Math.round(
    (event.tickets.reduce((s, t) => s + (t.total - t.available), 0) /
     event.tickets.reduce((s, t) => s + t.total, 0)) * 100
  );

  const subtotal = event.tickets.reduce((sum, t) => sum + (quantities[t.id] || 0) * t.price, 0);
  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);
  const { commission, total } = calculateFees(subtotal);

  const updateQty = (ticketId, delta) => {
    const ticket = event.tickets.find(t => t.id === ticketId);
    const curr = quantities[ticketId] || 0;
    const next = Math.max(0, Math.min(curr + delta, Math.min(10, ticket.available)));
    setQuantities(prev => ({ ...prev, [ticketId]: next }));
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  };

  const handleBuy = (e) => {
    e.preventDefault();
    if (totalQty === 0) return;
    if (!buyerEmail || !buyerName) {
      showToast('Please fill in your details', 'error');
      return;
    }

    if (total === 0) {
      // Free event — just "register"
      setSuccess({ reference: generateRef(), name: buyerName });
      setCheckoutOpen(false);
      return;
    }

    setProcessing(true);
    openPaystack({
      email: buyerEmail,
      amountKES: total,
      reference: generateRef(),
      eventTitle: event.title,
      onSuccess: (response) => {
        setProcessing(false);
        setSuccess({ reference: response.reference, name: buyerName });
        setCheckoutOpen(false);
      },
      onClose: () => {
        setProcessing(false);
        showToast('Payment window closed', 'error');
      },
    });
  };

  if (success) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{
          textAlign: 'center', maxWidth: 480, margin: '0 auto',
          background: 'var(--ct-dark-2)', border: '1px solid var(--ct-border)',
          borderRadius: 20, padding: 48,
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <CheckCircle2 size={48} style={{ color: 'var(--ct-success)', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
            You're going, {success.name.split(' ')[0]}!
          </h2>
          <p style={{ color: 'var(--ct-grey)', marginBottom: 8 }}>{event.title}</p>
          <p style={{ fontSize: 13, color: 'var(--ct-grey)', marginBottom: 32 }}>
            Ref: <span style={{ color: 'var(--ct-orange)', fontFamily: 'monospace' }}>{success.reference}</span>
          </p>
          <p style={{ color: 'var(--ct-grey-light)', marginBottom: 24, fontSize: 14 }}>
            Your ticket has been sent to <strong>{buyerEmail}</strong>. Check your inbox!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/events" className="btn btn-secondary">Discover More</Link>
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Back */}
      <div className="container" style={{ paddingTop: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ display: 'flex', gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Hero image */}
      <div style={{ position: 'relative', height: 'clamp(200px, 40vw, 420px)', overflow: 'hidden', marginTop: 16 }}>
        <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--ct-black) 100%)' }} />
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>

          {/* Left col */}
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className={`badge ${status.class}`}>{status.label}</span>
              {event.isFree && <span className="badge badge-green">FREE</span>}
              {event.tags.map(tag => <span key={tag} className="badge badge-grey">{tag}</span>)}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.1, marginBottom: 24 }}>
              {event.title}
            </h1>

            <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--ct-grey-light)' }}>
                <Calendar size={16} style={{ color: 'var(--ct-orange)' }} />
                <span>{formatDate(event.date)} at {event.time}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--ct-grey-light)' }}>
                <MapPin size={16} style={{ color: 'var(--ct-orange)' }} />
                <span>{event.venue}, {event.city}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--ct-grey-light)' }}>
                <Users size={16} style={{ color: 'var(--ct-orange)' }} />
                <span>{event.attendees.toLocaleString()} attending</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleCopyLink}
                style={{ display: 'flex', gap: 6 }}
              >
                <Share2 size={14} /> Share
              </button>
              <button
                className={`btn btn-sm ${wishlist ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setWishlist(!wishlist)}
                style={{ display: 'flex', gap: 6 }}
              >
                <Heart size={14} fill={wishlist ? 'white' : 'none'} />
                {wishlist ? 'Saved' : 'Save'}
              </button>
            </div>

            <div className="divider" />

            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 12 }}>About this event</h2>
            <p style={{ color: 'var(--ct-grey-light)', lineHeight: 1.8, marginBottom: 24 }}>{event.description}</p>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--ct-grey)', marginBottom: 6 }}>Organised by</p>
              <p style={{ fontWeight: 600 }}>{event.organiser}</p>
            </div>

            <div>
              <div style={{ height: 6, background: 'var(--ct-dark-3)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{
                  height: '100%', width: `${soldPercent}%`,
                  background: soldPercent > 80 ? 'var(--ct-danger)' : 'var(--ct-orange)',
                  borderRadius: 3,
                }} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--ct-grey)' }}>{soldPercent}% of tickets sold</p>
            </div>
          </div>

          {/* Right col — ticket selector */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Select Tickets</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {event.tickets.map(ticket => (
                  <div key={ticket.id} style={{
                    padding: '16px',
                    background: 'var(--ct-dark-3)',
                    borderRadius: 12,
                    border: `1px solid ${(quantities[ticket.id] || 0) > 0 ? 'var(--ct-orange)' : 'var(--ct-border)'}`,
                    transition: 'border-color 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15 }}>{ticket.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--ct-grey)' }}>{ticket.available} remaining</p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: ticket.price === 0 ? 'var(--ct-success)' : 'var(--ct-orange)' }}>
                        {formatKES(ticket.price)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px 10px' }}
                        onClick={() => updateQty(ticket.id, -1)}
                        disabled={!quantities[ticket.id]}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, minWidth: 24, textAlign: 'center' }}>
                        {quantities[ticket.id] || 0}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px 10px' }}
                        onClick={() => updateQty(ticket.id, 1)}
                        disabled={ticket.available === 0}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              {totalQty > 0 && (
                <div style={{
                  background: 'var(--ct-dark-2)', borderRadius: 10, padding: 16,
                  marginBottom: 16, fontSize: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--ct-grey)' }}>{totalQty} ticket{totalQty > 1 ? 's' : ''}</span>
                    <span>{formatKES(subtotal)}</span>
                  </div>
                  {subtotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--ct-grey)' }}>Platform fee (7%)</span>
                      <span style={{ color: 'var(--ct-orange)' }}>{formatKES(commission)}</span>
                    </div>
                  )}
                  <div className="divider" style={{ margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: subtotal === 0 ? 'var(--ct-success)' : 'var(--ct-white)' }}>
                      {subtotal === 0 ? 'FREE' : formatKES(total)}
                    </span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={() => setCheckoutOpen(true)}
                disabled={totalQty === 0}
                style={{ opacity: totalQty === 0 ? 0.5 : 1 }}
              >
                {totalQty === 0 ? 'Select tickets' : `Get ${totalQty} Ticket${totalQty > 1 ? 's' : ''}`}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ct-grey)', marginTop: 12 }}>
                Powered by Paystack · Secured by Chukua Ticket
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Checkout Modal ─── */}
      {checkoutOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: 16, backdropFilter: 'blur(8px)',
        }}
          onClick={e => { if (e.target === e.currentTarget) setCheckoutOpen(false); }}
        >
          <div style={{
            background: 'var(--ct-dark-2)', border: '1px solid var(--ct-border)',
            borderRadius: 20, padding: 36, width: '100%', maxWidth: 460,
            animation: 'fadeUp 0.3s ease',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
              Complete your order
            </h3>
            <p style={{ color: 'var(--ct-grey)', fontSize: 14, marginBottom: 24 }}>{event.title}</p>

            <form onSubmit={handleBuy} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Jane Wanjiru" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email address *</label>
                <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="jane@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone (for M-Pesa notifications)</label>
                <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+254 7XX XXX XXX" />
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ct-grey)' }}>{totalQty} ticket{totalQty > 1 ? 's' : ''}</span>
                  <span>{formatKES(subtotal)}</span>
                </div>
                {subtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ct-grey)' }}>Platform fee</span>
                    <span style={{ color: 'var(--ct-orange)' }}>{formatKES(commission)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--ct-orange)' }}>
                    {subtotal === 0 ? 'FREE' : formatKES(total)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCheckoutOpen(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={processing}>
                  {processing ? <span className="spinner" /> : (subtotal === 0 ? 'Register Free' : `Pay ${formatKES(total)}`)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} style={{ color: 'var(--ct-success)' }} /> : <AlertTriangle size={16} style={{ color: 'var(--ct-danger)' }} />}
          {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .page-wrapper > .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
