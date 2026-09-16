import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Share2, Heart, ArrowLeft, Minus, Plus, CheckCircle2, AlertTriangle, Link2, Check, MessageCircle, Twitter, Facebook } from 'lucide-react';
import { getEvent, createOrder, completeFreeOrder, calcFees, openPaystack, generateRef, formatKES, formatDate } from '../lib/api';

// Status badge is derived locally — no mock data module.
function getStatusBadge(status) {
  switch (status) {
    case 'sold_out':   return { label: 'Sold Out',   class: 'badge-red' };
    case 'almost_full':return { label: 'Almost Full',class: 'badge-orange' };
    case 'cancelled':  return { label: 'Cancelled',  class: 'badge-red' };
    case 'past':       return { label: 'Past Event', class: 'badge-grey' };
    case 'live':       return { label: 'Live Now',   class: 'badge-green' };
    default:           return { label: 'On Sale',    class: 'badge-green' };
  }
}

const SITE = 'https://chukuaticket.com';

function ShareMenu({ event, onCopied }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = `${SITE}/events/${event.id}`;
  const line = `${event.title}${event.venue ? ` at ${event.venue}` : ''} — tickets on Chukua Ticket`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers and non-HTTPS contexts have no clipboard API.
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  };

  // On phones this opens the real OS share sheet, which is what most people expect.
  const nativeShare = async () => {
    try {
      await navigator.share({ title: event.title, text: line, url });
      setOpen(false);
    } catch {
      /* dismissed — leave the menu as it is */
    }
  };

  const targets = [
    { label: 'WhatsApp', icon: <MessageCircle size={15} />, href: `https://wa.me/?text=${encodeURIComponent(`${line}\n${url}`)}` },
    { label: 'X',        icon: <Twitter size={15} />,       href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(line)}&url=${encodeURIComponent(url)}` },
    { label: 'Facebook', icon: <Facebook size={15} />,      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)} style={{ display: 'flex', gap: 6 }}>
        <Share2 size={14} /> Share
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
          <div style={{
            position: 'absolute', left: 0, top: 'calc(100% + 8px)', zIndex: 2,
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 10, width: 280,
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
          }}>
            {/* The link itself, visible and selectable */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 10px', marginBottom: 8,
            }}>
              <Link2 size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{
                fontSize: 12, color: 'var(--text-2)', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {url.replace('https://', '')}
              </span>
            </div>

            <button
              onClick={copy}
              className="btn btn-primary btn-sm btn-block"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}
            >
              {copied ? <><Check size={14} /> Copied</> : <><Link2 size={14} /> Copy link</>}
            </button>

            <div style={{ display: 'flex', gap: 6 }}>
              {targets.map(t => (
                <a
                  key={t.label}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 4px', borderRadius: 8, fontSize: 11,
                    color: 'var(--text-2)', border: '1px solid var(--border)',
                  }}
                >
                  {t.icon} {t.label}
                </a>
              ))}
            </div>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={nativeShare}
                className="btn btn-ghost btn-sm btn-block"
                style={{ marginTop: 8, fontSize: 12 }}
              >
                More options…
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [wishlist, setWishlist] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getEvent(id).then(data => {
      if (!active) return;
      setEvent(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <span className="spinner" />
    </div>
  );

  if (!event) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12 }}>Event not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>This event may have been removed or the link is wrong.</p>
        <Link to="/events" className="btn btn-primary">Browse Events</Link>
      </div>
    </div>
  );

  const tickets = event.tickets || [];
  const status = getStatusBadge(event.status);

  const totalCapacity = tickets.reduce((s, t) => s + (t.total || 0), 0);
  const soldPercent = totalCapacity > 0
    ? Math.round((tickets.reduce((s, t) => s + ((t.total || 0) - (t.available || 0)), 0) / totalCapacity) * 100)
    : 0;

  const subtotal = tickets.reduce((sum, t) => sum + (quantities[t.id] || 0) * t.price, 0);
  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);
  // Organiser absorbs the 7%. `commission` is shown to organisers only, never here.
  const { total, commission } = calcFees(subtotal);

  const updateQty = (ticketId, delta) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const curr = quantities[ticketId] || 0;
    const next = Math.max(0, Math.min(curr + delta, Math.min(10, ticket.available || 0)));
    setQuantities(prev => ({ ...prev, [ticketId]: next }));
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const orderLines = tickets
    .filter(t => (quantities[t.id] || 0) > 0)
    .map(t => ({ ticketId: t.id, name: t.name, qty: quantities[t.id], price: t.price }));

  const handleBuy = async (e) => {
    e.preventDefault();
    if (totalQty === 0) return;
    if (!buyerEmail || !buyerName) {
      showToast('Please fill in your details', 'error');
      return;
    }

    setProcessing(true);
    const reference = generateRef();
    const subaccountCode = event.subaccountCode || event.subaccount_code;

    // The order is recorded as 'pending' first. The Paystack webhook is what
    // marks it paid — if we created it after payment, the webhook could arrive
    // before the row existed and the sale would be lost.
    const order = await createOrder({
      eventId: event.id,
      reference,
      buyer: { name: buyerName, email: buyerEmail, phone: buyerPhone },
      items: orderLines,
    });

    if (order?.error) {
      setProcessing(false);
      showToast(order.error, 'error');
      return;
    }

    // Charge what the database calculated, not the figure held in the browser.
    const chargeable = order.subtotal;

    if (chargeable === 0) {
      const res = await completeFreeOrder(reference);
      setProcessing(false);
      if (res?.error) {
        showToast('Could not complete your registration. Please try again.', 'error');
        return;
      }
      setSuccess({ reference, name: buyerName });
      setCheckoutOpen(false);
      return;
    }

    openPaystack({
      email: buyerEmail,
      amountKES: chargeable, // attendee pays exactly the ticket price
      // Paystack splits at transaction time: the organiser's subaccount is
      // settled directly and our 7% is retained.
      subaccount: order.subaccountCode || subaccountCode,
      platformFeeKES: order.commission,
      reference,
      eventTitle: event.title,
      onSuccess: () => {
        setProcessing(false);
        // Deliberately not marking the order paid here — only the webhook may
        // do that, since a client-side success callback can be faked.
        setSuccess({ reference, name: buyerName });
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
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 48,
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
            You're going, {success.name.split(' ')[0]}!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>{event.title}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>
            Ref: <span style={{ color: 'var(--ct-orange)', fontFamily: 'monospace' }}>{success.reference}</span>
          </p>
          <p style={{ color: 'var(--text-2)', marginBottom: 24, fontSize: 14 }}>
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
      <div style={{ position: 'relative', height: 'clamp(200px, 40vw, 420px)', overflow: 'hidden', marginTop: 16, background: 'var(--bg-3)' }}>
        {event.image
          ? <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🎪</div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--bg) 100%)' }} />
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>

          {/* Left col */}
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className={`badge ${status.class}`}>{status.label}</span>
              {event.isFree && <span className="badge badge-green">FREE</span>}
              {(event.tags || []).map(tag => <span key={tag} className="badge badge-grey">{tag}</span>)}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.1, marginBottom: 24 }}>
              {event.title}
            </h1>

            <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-2)' }}>
                <Calendar size={16} style={{ color: 'var(--ct-orange)' }} />
                <span>{formatDate(event.date)}{event.time ? ` at ${event.time}` : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-2)' }}>
                <MapPin size={16} style={{ color: 'var(--ct-orange)' }} />
                <span>{event.venue}{event.city ? `, ${event.city}` : ''}</span>
              </div>
              {typeof event.attendees === 'number' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-2)' }}>
                  <Users size={16} style={{ color: 'var(--ct-orange)' }} />
                  <span>{event.attendees.toLocaleString()} attending</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
              <ShareMenu event={event} onCopied={() => showToast('Event link copied!')} />
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
            <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24 }}>{event.description}</p>

            {event.organiser && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Organised by</p>
                <p style={{ fontWeight: 600 }}>{event.organiser}</p>
              </div>
            )}

            {/* Tells an attendee arriving from a shared link where they are. */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--ct-orange-dim)', border: '1px solid rgba(255,92,0,0.25)',
              borderRadius: 999, padding: '7px 14px', marginBottom: 24,
              fontSize: 12, color: 'var(--text-2)',
            }}>
              <img
                src="https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png"
                alt=""
                style={{ height: 14, width: 'auto' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              Tickets issued securely by <strong style={{ color: 'var(--ct-orange)' }}>Chukua Ticket</strong>
            </div>

            {totalCapacity > 0 && (
              <div>
                <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{
                    height: '100%', width: `${soldPercent}%`,
                    background: soldPercent > 80 ? 'var(--danger)' : 'var(--ct-orange)',
                    borderRadius: 3,
                  }} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{soldPercent}% of tickets sold</p>
              </div>
            )}
          </div>

          {/* Right col — ticket selector */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Select Tickets</h3>

              {tickets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                  No tickets are on sale for this event yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  {tickets.map(ticket => (
                    <div key={ticket.id} style={{
                      padding: '16px',
                      background: 'var(--bg-3)',
                      borderRadius: 12,
                      border: `1px solid ${(quantities[ticket.id] || 0) > 0 ? 'var(--ct-orange)' : 'var(--border)'}`,
                      transition: 'border-color 0.2s',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 15 }}>{ticket.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.available} remaining</p>
                        </div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: ticket.price === 0 ? 'var(--success)' : 'var(--ct-orange)' }}>
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
                          disabled={!ticket.available}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order summary — attendee pays the ticket price, nothing added */}
              {totalQty > 0 && (
                <div style={{
                  background: 'var(--bg-2)', borderRadius: 10, padding: 16,
                  marginBottom: 16, fontSize: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{totalQty} ticket{totalQty > 1 ? 's' : ''}</span>
                    <span>{formatKES(subtotal)}</span>
                  </div>
                  <div className="divider" style={{ margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: subtotal === 0 ? 'var(--success)' : 'var(--text)' }}>
                      {subtotal === 0 ? 'FREE' : formatKES(subtotal)}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    No booking fees. The price you see is the price you pay.
                  </p>
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

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
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
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 36, width: '100%', maxWidth: 460,
            animation: 'fadeUp 0.3s ease',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
              Complete your order
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{event.title}</p>

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
                  <span style={{ color: 'var(--text-muted)' }}>{totalQty} ticket{totalQty > 1 ? 's' : ''}</span>
                  <span>{formatKES(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--ct-orange)' }}>
                    {subtotal === 0 ? 'FREE' : formatKES(subtotal)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCheckoutOpen(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={processing}>
                  {processing ? <span className="spinner" /> : (subtotal === 0 ? 'Register Free' : `Pay ${formatKES(subtotal)}`)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> : <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />}
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
