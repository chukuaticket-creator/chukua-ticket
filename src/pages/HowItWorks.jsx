import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

// ─── HOW IT WORKS ────────────────────────────────────────────────
export function HowItWorks() {
  const attendeeSteps = [
    { n: '01', emoji: '🔍', title: 'Discover', desc: 'Browse events near you or search by category, date, or city. Filter free vs paid.' },
    { n: '02', emoji: '🎟️', title: 'Choose Tickets', desc: 'Pick your ticket type — Early Bird, Regular, VIP. See exactly what\'s left.' },
    { n: '03', emoji: '💳', title: 'Pay Securely', desc: 'Pay via M-Pesa, Visa, Mastercard, or bank transfer — all through Paystack.' },
    { n: '04', emoji: '📧', title: 'Get Your Ticket', desc: 'QR code ticket delivered instantly to your email. Show at the gate — done.' },
  ];

  const organiserSteps = [
    { n: '01', emoji: '✏️', title: 'Create Event', desc: 'Fill in event details, add ticket tiers with prices and quantities. Takes 5 minutes.' },
    { n: '02', emoji: '🚀', title: 'Go Live', desc: 'Publish and share your event link. We handle the checkout and payment collection.' },
    { n: '03', emoji: '📊', title: 'Track Sales', desc: 'Watch ticket sales in real time. See who\'s buying, which tier is hot, and when.' },
    { n: '04', emoji: '💰', title: 'Get Paid', desc: 'Post-event, your revenue lands in your M-Pesa or bank account within 24hrs.' },
  ];

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '80px 24px',
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,92,0,0.1) 0%, transparent 70%)',
      }}>
        <p className="section-label" style={{ marginBottom: 12 }}>Simple by design</p>
        <h1 className="section-title" style={{ marginBottom: 16 }}>How Chukua Ticket works</h1>
        <p className="section-sub" style={{ margin: '0 auto' }}>Whether you're buying or selling — it's straightforward.</p>
      </div>

      {/* Attendee */}
      <div className="container" style={{ paddingBottom: 80 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 32, textAlign: 'center' }}>
          🎟️ For Attendees
        </h2>
        <div className="grid-4">
          {attendeeSteps.map((s, i) => (
            <div key={i} style={{
              padding: 28, background: 'var(--ct-dark-2)', borderRadius: 16,
              border: '1px solid var(--ct-border)', textAlign: 'center',
              animation: `fadeUp 0.4s ${i * 0.1}s ease both`,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{s.emoji}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--ct-orange)', marginBottom: 8, letterSpacing: '0.08em' }}>{s.n}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: 'var(--ct-grey)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/events" className="btn btn-primary btn-lg">Browse Events <ArrowRight size={16} /></Link>
        </div>
      </div>

      <div style={{ background: 'var(--ct-dark)', padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 32, textAlign: 'center' }}>
            🎪 For Organisers
          </h2>
          <div className="grid-4">
            {organiserSteps.map((s, i) => (
              <div key={i} style={{
                padding: 28, background: 'var(--ct-dark-3)', borderRadius: 16,
                border: '1px solid var(--ct-border)', textAlign: 'center',
                animation: `fadeUp 0.4s ${i * 0.1}s ease both`,
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{s.emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--ct-orange)', marginBottom: 8, letterSpacing: '0.08em' }}>{s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--ct-grey)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/organiser/create-event" className="btn btn-primary btn-lg">Create Your First Event <ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container" style={{ padding: '80px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 40 }}>FAQs</h2>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['How does the 7% fee work?', 'The fee is added to the ticket price at checkout — so attendees pay ticket price + 7%. You receive 100% of your listed ticket price. No hidden deductions.'],
            ['When do I get paid?', 'Within 24 hours of your event ending. Payment goes directly to your M-Pesa or bank account via Paystack.'],
            ['How does ticket verification work?', 'Each ticket has a unique QR code. Your gate staff scan it with the Chukua Ticket scanner (any phone\'s camera). Attempted duplicates are flagged instantly.'],
            ['Can I list a free event?', 'Yes! Free events have zero fees for both organisers and attendees. Just set your ticket price to KES 0.'],
            ['What payment methods can attendees use?', 'M-Pesa, Visa, Mastercard, and bank transfers — all via Paystack\'s secure checkout.'],
            ['Can I issue refunds?', 'Refund policies are set by each organiser. You control your refund policy when creating the event.'],
          ].map(([q, a]) => (
            <div key={q} className="card" style={{ padding: 24 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--ct-white)' }}>{q}</h4>
              <p style={{ color: 'var(--ct-grey)', fontSize: 14, lineHeight: 1.7 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 404 ─────────────────────────────────────────────────────────
export function NotFound() {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div>
        <p style={{ fontSize: 80, marginBottom: 16 }}>🎟️</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, marginBottom: 8 }}>404</h1>
        <p style={{ color: 'var(--ct-grey)', fontSize: 18, marginBottom: 32 }}>This ticket doesn't exist — or the event has passed.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">Go Home</Link>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      </div>
    </div>
  );
}
