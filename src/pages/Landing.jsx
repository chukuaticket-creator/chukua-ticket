import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart2, Smartphone, MapPin, Users, Star, CheckCircle2, ChevronRight } from 'lucide-react';
import { getEvents, formatKES, formatDate, CATEGORIES } from '../lib/api';

const LOGO = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

const TICKER_ITEMS = [
  '🎵 Music Concerts', '⚽ Sports Matches', '😂 Comedy Nights', '✝️ Church Events',
  '💻 Tech Conferences', '🍽️ Food Festivals', '🎨 Art Shows', '🤝 Networking Events',
  '🎭 Theatre', '🏃 Marathons', '🎉 Corporate Events', '🎓 Graduations',
];

const FEATURES = [
  { icon: <Smartphone size={20} />, title: 'M-Pesa + Paystack', desc: 'Buy via M-Pesa, card, or bank. Every Kenyan can purchase — smartphone or kabambe.' },
  { icon: <Shield size={20} />, title: 'Fraud-Proof QR Tickets', desc: 'Dynamic QR codes with real-time gate validation. No duplicates. No forgeries.' },
  { icon: <BarChart2 size={20} />, title: 'Live Organiser Dashboard', desc: 'Watch ticket sales, check-ins, and revenue update in real time.' },
  { icon: <MapPin size={20} />, title: 'Event Discovery Map', desc: 'Attendees find events near them on a live map. Your event gets discovered organically.' },
  { icon: <Zap size={20} />, title: 'Instant Payouts', desc: 'Revenue in your M-Pesa or bank within 24hrs post-event. No delays.' },
  { icon: <Users size={20} />, title: 'Team Command Chat', desc: 'Built-in staff chat with roles, alerts and quick commands — no WhatsApp needed.' },
];

const STEPS = [
  { n: '01', title: 'Create Your Event', desc: 'Set up details, ticket tiers and pricing in under 5 minutes.' },
  { n: '02', title: 'Share & Sell', desc: 'Your event goes live instantly. Share the link or let attendees find it on Chukua Ticket.' },
  { n: '03', title: 'Manage Live', desc: 'Track sales, scan tickets at the gate, chat with your team — all from one dashboard.' },
  { n: '04', title: 'Get Paid', desc: 'Revenue lands in your account after the event. Simple, transparent, zero surprises.' },
];

const TESTIMONIALS = [
  { name: 'Grace Wanjiku', role: 'Events Director, Mavuno Church', quote: 'We managed 3,000 attendees without a single fraudulent ticket. Gate scanning was seamless.', stars: 5 },
  { name: 'Brian Otieno', role: 'Founder, Nairobi Comedy Nights', quote: 'The analytics showed me exactly which price point sold best. Revenue up 40% on my next show.', stars: 5 },
  { name: 'Amina Hassan', role: 'Concert Promoter, Mombasa', quote: 'Payout within 24 hours of my event. That\'s how you build trust with organisers.', stars: 5 },
];

const STATS = [
  { value: '0', label: 'Tickets Sold', live: true },
  { value: '0', label: 'Events Hosted', live: true },
  { value: '7%', label: 'Platform Fee' },
  { value: '24hr', label: 'Payout Time' },
];

// Reusable event card for landing
function MiniEventCard({ event }) {
  const lowestPrice = event.tickets?.reduce((m, t) => Math.min(m, t.price), Infinity) ?? 0;
  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'var(--bg-3)', position: 'relative' }}>
          {event.image
            ? <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                {CATEGORIES.find(c => c.id === event.category)?.icon || '🎪'}
              </div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
          {event.isFree && <span className="badge badge-green" style={{ position: 'absolute', top: 10, left: 10 }}>FREE</span>}
        </div>
        <div style={{ padding: '16px 18px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 6, color: 'var(--text)', lineHeight: 1.25 }}>
            {event.title}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            📅 {formatDate(event.date)} · 📍 {event.venue}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: event.isFree ? 'var(--success)' : 'var(--ct-orange)' }}>
              {formatKES(lowestPrice)}
            </span>
            <span className="btn btn-primary btn-sm">Get Tickets</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Landing() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getEvents({ limit: 3 }).then(data => {
      setFeaturedEvents(data.slice(0, 3));
      setLoadingEvents(false);
    });
  }, []);

  const handleWaitlist = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setEmail('');
    }
  };

  return (
    <div style={{ paddingTop: 0 }}>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        paddingTop: 'calc(var(--nav-h) + 48px)', paddingBottom: 80,
        background: 'var(--bg)',
      }}>
        {/* Background dots */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,92,0,0.08) 0%, transparent 70%)',
        }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, animation: 'fadeUp 0.5s ease' }}>
            <span className="badge badge-orange" style={{ fontSize: 12, padding: '5px 12px' }}>
              <span style={{ width: 6, height: 6, background: 'var(--ct-orange)', borderRadius: '50%', display: 'inline-block', animation: 'pulseRing 2s ease infinite' }} />
              &nbsp; Kenya's Most Advanced Ticketing Platform
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 9vw, 96px)',
            fontWeight: 900, lineHeight: 0.92,
            letterSpacing: '-0.03em',
            marginBottom: 28,
            animation: 'fadeUp 0.5s 0.08s ease both',
            color: 'var(--text)',
          }}>
            Every Event.<br />
            <em style={{ color: 'var(--ct-orange)', fontStyle: 'italic' }}>One Platform.</em>
          </h1>

          <p style={{
            color: 'var(--text-muted)', fontSize: 'clamp(16px, 2vw, 20px)',
            maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65,
            animation: 'fadeUp 0.5s 0.15s ease both',
          }}>
            Discover events near you. Buy tickets in seconds.<br />
            Built for Kenya — designed for Africa.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.5s 0.22s ease both' }}>
            <Link to="/events" className="btn btn-primary btn-lg">
              Discover Events <ArrowRight size={17} />
            </Link>
            <Link to="/map" className="btn btn-secondary btn-lg">
              🗺️ Live Map
            </Link>
            <Link to="/organiser/create-event" className="btn btn-ghost btn-lg">
              List Your Event
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 64, flexWrap: 'wrap', animation: 'fadeUp 0.5s 0.3s ease both' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px,4vw,38px)', color: 'var(--text)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', overflow: 'hidden', padding: '12px 0' }}>
        <div style={{ display: 'flex', gap: 40, animation: 'ticker 28s linear infinite', width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{
              fontWeight: 600, fontSize: 13, color: i % 4 === 0 ? 'var(--ct-orange)' : 'var(--text-muted)',
              whiteSpace: 'nowrap', letterSpacing: '0.03em',
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ─── FEATURED EVENTS ─── */}
      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Don't miss out</p>
              <h2 className="section-title">Happening Now</h2>
            </div>
            <Link to="/events" className="btn btn-ghost" style={{ display: 'flex', gap: 6 }}>
              See all events <ChevronRight size={15} />
            </Link>
          </div>

          {loadingEvents ? (
            <div style={{ display: 'flex', gap: 18 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ flex: 1, background: 'var(--bg-2)', borderRadius: 'var(--radius)', aspectRatio: '4/5', animation: 'fadeIn 0.5s ease' }} />
              ))}
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎪</div>
              <h3>No events listed yet</h3>
              <p>Be the first to create an event on Chukua Ticket.</p>
              <Link to="/organiser/create-event" className="btn btn-primary">+ Create First Event</Link>
            </div>
          ) : (
            <div className="grid-3">
              {featuredEvents.map((evt, i) => (
                <div key={evt.id} style={{ animation: `fadeUp 0.4s ${i*0.1}s ease both` }}>
                  <MiniEventCard event={evt} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="section-label" style={{ marginBottom: 10 }}>Why Chukua Ticket</p>
            <h2 className="section-title">Built different.<br /><em style={{ fontStyle:'italic', color:'var(--ct-orange)' }}>Built for Kenya.</em></h2>
          </div>
          <div className="grid-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ padding: 28, animation: `fadeUp 0.4s ${i*0.07}s ease both` }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--ct-orange-dim)', color: 'var(--ct-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 7, color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="section-label" style={{ marginBottom: 10 }}>Simple process</p>
            <h2 className="section-title">From idea to sold-out<br />in 4 steps</h2>
          </div>
          <div className="grid-4">
            {STEPS.map((s, i) => (
              <div key={i} style={{ padding: '28px 22px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: `fadeUp 0.4s ${i*0.08}s ease both` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 42, color: 'var(--ct-orange)', opacity: 0.15, lineHeight: 1, marginBottom: 14 }}>{s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text)' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-2)' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="section-label" style={{ marginBottom: 10 }}>Transparent pricing</p>
            <h2 className="section-title">No hidden fees.<br />Just 7%.</h2>
            <p className="section-sub" style={{ margin: '14px auto 0' }}>We only make money when you do. The 7% covers payment processing, QR scanning, analytics, and support.</p>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '2px solid var(--ct-orange)', borderRadius: 'var(--radius-lg)', padding: '36px 44px', boxShadow: 'var(--shadow-glow)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 34, marginBottom: 6, color: 'var(--text)' }}>7% per ticket</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Added at checkout. You receive your full ticket price.</p>
              {['Free event listing', 'Unlimited ticket types', 'QR scanning app', 'Real-time dashboard', 'M-Pesa & card payments', '24hr payout', 'Team command chat', 'Live event map'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 9 }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{f}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Example: KES 2,000 ticket</p>
                {[['Ticket price', 'KES 2,000'], ['Platform fee (7%)', '+ KES 140']].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 600, color: k.includes('fee') ? 'var(--ct-orange)' : 'var(--text)' }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
                  <span style={{ color: 'var(--text)' }}>Attendee pays</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ct-orange)' }}>KES 2,140</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>You receive</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>KES 2,000</span>
                </div>
              </div>
              <Link to="/organiser/create-event" className="btn btn-primary btn-lg btn-block">
                Start Selling — Free <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="section-label" style={{ marginBottom: 10 }}>Organiser love</p>
            <h2 className="section-title">Trusted by Kenya's<br />best event makers</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: 28, animation: `fadeUp 0.4s ${i*0.1}s ease both` }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={13} fill="var(--ct-orange)" style={{ color: 'var(--ct-orange)' }} />)}
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, marginBottom: 18, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 0 100px', background: 'var(--bg-2)' }}>
        <div className="container" style={{ maxWidth: 660, textAlign: 'center' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '52px 40px', boxShadow: 'var(--card-shadow)' }}>
            <h2 className="section-title" style={{ marginBottom: 14 }}>Ready to chukua<br /><em style={{ color:'var(--ct-orange)', fontStyle:'italic' }}>your event live?</em></h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 15 }}>Join organisers already selling on Chukua Ticket. Free to list. Always.</p>
            <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ flex: 1, minWidth: 180 }} required />
              <button type="submit" className="btn btn-primary">{submitted ? '✓ You\'re in!' : 'Get Early Access'}</button>
            </form>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>No spam. Just your launch invite.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
