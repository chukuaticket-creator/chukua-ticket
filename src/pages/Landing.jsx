import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart2, Smartphone, MapPin, Users, Star, CheckCircle2, ChevronRight } from 'lucide-react';
import EventCard from '../components/ui/EventCard';
import { EVENTS } from '../lib/data';

const LOGO = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

const TICKER_ITEMS = [
  '🎵 Music Concerts', '⚽ Sports Matches', '😂 Comedy Nights', '✝️ Church Events',
  '💻 Tech Conferences', '🍽️ Food Festivals', '🎨 Art Shows', '🤝 Networking Events',
  '🎭 Theatre', '🏃 Marathons', '🎓 Graduations', '🎉 Corporate Events',
];

const FEATURES = [
  {
    icon: <Smartphone size={22} />,
    title: 'M-Pesa + Paystack',
    desc: 'Buy tickets via M-Pesa, card, or bank. Every Kenyan can purchase, from smartphone to kabambe.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Fraud-Proof Entry',
    desc: 'Dynamic QR codes with real-time validation. No duplicates. No forgeries. Every ticket is cryptographically unique.',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Live Analytics',
    desc: 'Watch ticket sales, check-ins, and revenue update in real time from your organiser dashboard.',
  },
  {
    icon: <MapPin size={22} />,
    title: 'Event Discovery',
    desc: 'Attendees discover events near them. Your event gets found by people already looking for something to do.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Instant Payouts',
    desc: 'Revenue in your account within 24hrs post-event. No chasing payments, no delays.',
  },
  {
    icon: <Users size={22} />,
    title: 'Team Management',
    desc: 'Add gate staff, team leads, and managers. Each gets their own access level and scanner.',
  },
];

const STEPS = [
  { n: '01', title: 'Create Your Event', desc: 'Set up event details, ticket tiers, and pricing in under 5 minutes.' },
  { n: '02', title: 'Share & Sell', desc: 'Your event goes live instantly. Share the link, embed it on your site, or let attendees find it on Chukua Ticket.' },
  { n: '03', title: 'Manage Live', desc: 'Track sales, scan tickets at the gate, and monitor your crowd from the organiser dashboard.' },
  { n: '04', title: 'Get Paid', desc: 'Revenue lands in your account after the event. Simple, transparent, no surprises.' },
];

const TESTIMONIALS = [
  {
    name: 'Grace Wanjiku',
    role: 'Events Director, Mavuno Church',
    quote: 'We managed 3,000 attendees without a single fraudulent ticket. The gate scanning was seamless — staff picked it up in minutes.',
    stars: 5,
  },
  {
    name: 'Brian Otieno',
    role: 'Founder, Nairobi Comedy Nights',
    quote: 'The analytics dashboard showed me exactly which price point sold best. I increased revenue by 40% on my next show.',
    stars: 5,
  },
  {
    name: 'Amina Hassan',
    role: 'Concert Promoter, Mombasa',
    quote: 'Every other platform made me wait weeks for my money. Chukua Ticket paid out within 24 hours. That\'s how you build trust.',
    stars: 5,
  },
];

const STATS = [
  { value: '50K+', label: 'Tickets Sold' },
  { value: '200+', label: 'Events Hosted' },
  { value: '7%', label: 'Platform Fee' },
  { value: '24hr', label: 'Payout Time' },
];

export default function Landing() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);

  const featured = EVENTS.slice(0, 3);

  const handleWaitlist = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setEmail('');
    }
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: 0 }}>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        paddingTop: 'calc(var(--nav-h) + 40px)',
        paddingBottom: 80,
      }}>
        {/* BG */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,92,0,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,92,0,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          {/* Label */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, animation: 'fadeUp 0.5s ease' }}>
            <span className="badge badge-orange" style={{ fontSize: 12 }}>
              <span style={{ width: 6, height: 6, background: 'var(--ct-orange)', borderRadius: '50%', display: 'inline-block' }} />
              Kenya's Most Advanced Ticketing Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 8vw, 88px)',
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            marginBottom: 28,
            animation: 'fadeUp 0.5s 0.1s ease both',
          }}>
            <span style={{ color: 'var(--ct-white)' }}>Every Event.</span><br />
            <span style={{
              background: 'linear-gradient(135deg, var(--ct-orange) 0%, #FF9A3C 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>One Platform.</span>
          </h1>

          <p style={{
            color: 'var(--ct-grey-light)', fontSize: 'clamp(16px, 2vw, 20px)',
            maxWidth: 560, margin: '0 auto 40px',
            animation: 'fadeUp 0.5s 0.2s ease both',
          }}>
            Discover events near you. Buy tickets in seconds. Organise with confidence.
            Built for Kenya, designed for Africa.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeUp 0.5s 0.3s ease both',
          }}>
            <Link to="/events" className="btn btn-primary btn-lg">
              Discover Events <ArrowRight size={18} />
            </Link>
            <Link to="/organiser/create-event" className="btn btn-secondary btn-lg">
              List Your Event
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 40, marginTop: 60, flexWrap: 'wrap',
            animation: 'fadeUp 0.5s 0.4s ease both',
          }}>
            {STATS.map(s => (
              <div key={s.value} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--ct-white)' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--ct-grey)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div style={{
        borderTop: '1px solid var(--ct-border)',
        borderBottom: '1px solid var(--ct-border)',
        background: 'var(--ct-dark)',
        overflow: 'hidden', padding: '14px 0',
      }}
        onMouseEnter={() => setTickerPaused(true)}
        onMouseLeave={() => setTickerPaused(false)}
      >
        <div style={{
          display: 'flex', gap: 40,
          animation: `ticker 25s linear infinite`,
          animationPlayState: tickerPaused ? 'paused' : 'running',
          width: 'max-content',
        }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              color: i % 3 === 0 ? 'var(--ct-orange)' : 'var(--ct-grey)',
              whiteSpace: 'nowrap', letterSpacing: '0.04em',
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ─── FEATURED EVENTS ─── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Don't miss out</p>
              <h2 className="section-title">Happening Now</h2>
            </div>
            <Link to="/events" className="btn btn-ghost" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              See all events <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid-3">
            {featured.map((evt, i) => (
              <div key={evt.id} style={{ animation: `fadeUp 0.5s ${i * 0.1}s ease both` }}>
                <EventCard event={evt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ padding: '80px 0', background: 'var(--ct-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Why Chukua Ticket</p>
            <h2 className="section-title" style={{ margin: '0 auto 16px' }}>Built different.<br />Built for Kenya.</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              Not a copy-paste of Western ticketing. Built from scratch for how Kenyans pay, attend, and organise events.
            </p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{
                padding: 28,
                animation: `fadeUp 0.5s ${i * 0.08}s ease both`,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--ct-orange-dim)', color: 'var(--ct-orange)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--ct-grey)', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Simple process</p>
            <h2 className="section-title">From idea to sold-out<br />in 4 steps</h2>
          </div>
          <div className="grid-4" style={{ position: 'relative' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                background: 'var(--ct-dark-2)',
                borderRadius: 16,
                border: '1px solid var(--ct-border)',
                position: 'relative',
                animation: `fadeUp 0.5s ${i * 0.1}s ease both`,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40,
                  color: 'var(--ct-orange-dim)', lineHeight: 1, marginBottom: 16,
                  WebkitTextStroke: '1px var(--ct-orange)',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {s.n}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--ct-grey)', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section style={{ padding: '80px 0', background: 'var(--ct-dark)' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Transparent pricing</p>
            <h2 className="section-title">No hidden fees.<br />Just 7%.</h2>
            <p className="section-sub" style={{ margin: '16px auto 0' }}>
              We only make money when you do. The 7% platform fee covers everything — payment processing, QR scanning, analytics, and support.
            </p>
          </div>

          <div style={{
            background: 'var(--ct-dark-2)',
            border: '1px solid var(--ct-orange)',
            borderRadius: 20, padding: '40px 48px',
            boxShadow: 'var(--shadow-glow)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center',
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, marginBottom: 8 }}>7% per ticket</h3>
              <p style={{ color: 'var(--ct-grey)', marginBottom: 24 }}>Charged to attendees at checkout. You receive the full ticket price.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Free event listing',
                  'Unlimited ticket types',
                  'QR code scanning app',
                  'Real-time sales dashboard',
                  'M-Pesa & card payments',
                  'Instant post-event payout',
                  'Email ticket delivery',
                  'Gate management tools',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--ct-success)', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: 'var(--ct-grey-light)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background: 'var(--ct-dark-3)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--ct-grey)', marginBottom: 12 }}>Example: KES 2,000 ticket</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--ct-grey-light)', fontSize: 14 }}>Ticket price</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>KES 2,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: 'var(--ct-grey-light)', fontSize: 14 }}>Platform fee (7%)</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ct-orange)' }}>+ KES 140</span>
                </div>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ct-white)', fontWeight: 700, fontSize: 15 }}>Attendee pays</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ct-orange)' }}>KES 2,140</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ color: 'var(--ct-grey)', fontSize: 13 }}>You receive</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ct-success)' }}>KES 2,000</span>
                </div>
              </div>
              <Link to="/organiser/create-event" className="btn btn-primary btn-lg btn-block">
                Start Selling — Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Organiser love</p>
            <h2 className="section-title">Trusted by Kenya's<br />best event makers</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={14} fill="var(--ct-orange)" style={{ color: 'var(--ct-orange)' }} />
                  ))}
                </div>
                <p style={{ color: 'var(--ct-grey-light)', fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--ct-grey)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 0 100px' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,92,0,0.15) 0%, rgba(255,92,0,0.05) 100%)',
            border: '1px solid rgba(255,92,0,0.25)',
            borderRadius: 24, padding: '56px 40px',
          }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Ready to chukua<br />your event live?</h2>
            <p style={{ color: 'var(--ct-grey)', marginBottom: 32 }}>
              Join hundreds of organisers already selling on Chukua Ticket. Free to list. Simple to manage.
            </p>
            <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, minWidth: 200 }}
                required
              />
              <button type="submit" className="btn btn-primary">
                {submitted ? '✓ You\'re in!' : 'Get Early Access'}
              </button>
            </form>
            <p style={{ fontSize: 12, color: 'var(--ct-grey)', marginTop: 12 }}>
              No spam. Just your launch invite.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
