import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Youtube, Mail, Phone, MessageCircle } from 'lucide-react';

// One place to change support details.
const SUPPORT_EMAIL = 'support@chukuaticket.com';
const SUPPORT_PHONE_DISPLAY = '+254 112 159 006';
const SUPPORT_PHONE_TEL = '+254112159006';
// wa.me needs the international number with no '+' and no leading zero.
const SUPPORT_WHATSAPP = '254112159006';

const LOGO = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg)',
      padding: '60px 0 32px',
      marginTop: 80,
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <img src={LOGO} alt="Chukua Ticket" style={{ height: 40, marginBottom: 16 }}
              onError={e => { e.target.style.display='none'; }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
              Kenya's smartest event ticketing platform. Discover, book, and manage events with confidence.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[
                { icon: <Twitter size={16}/>, href: '#' },
                { icon: <Instagram size={16}/>, href: '#' },
                { icon: <Facebook size={16}/>, href: '#' },
                { icon: <Youtube size={16}/>, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 8,
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='var(--ct-orange)'; e.currentTarget.style.borderColor='var(--ct-orange)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Explore</h4>
            {[
              ['Discover Events', '/events'],
              ['Live Map', '/map'],
              ['Create Event', '/organiser/create-event'],
              ['How It Works', '/how-it-works'],
            ].map(([l, to]) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <Link to={to} style={{ color: 'var(--text-2)', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='var(--text)'}
                  onMouseLeave={e => e.target.style.color='var(--text-2)'}
                >{l}</Link>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Organisers</h4>
            {[
              ['Dashboard', '/organiser'],
              ['Create Event', '/organiser/create-event'],
              ['Payout Setup', '/organiser/setup-payout'],
              ['Sign In', '/login'],
            ].map(([l, to]) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <Link to={to} style={{ color: 'var(--text-2)', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='var(--text)'}
                  onMouseLeave={e => e.target.style.color='var(--text-2)'}
                >{l}</Link>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Company</h4>
            {[
              ['Privacy Policy', '/privacy'],
              ['Terms of Service', '/terms'],
            ].map(([l, to]) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <Link to={to} style={{ color: 'var(--text-2)', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='var(--text)'}
                  onMouseLeave={e => e.target.style.color='var(--text-2)'}
                >{l}</Link>
              </div>
            ))}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <Mail size={14} />,          label: SUPPORT_EMAIL,          href: `mailto:${SUPPORT_EMAIL}` },
                { icon: <Phone size={14} />,         label: SUPPORT_PHONE_DISPLAY,  href: `tel:${SUPPORT_PHONE_TEL}` },
                { icon: <MessageCircle size={14} />, label: 'WhatsApp us',          href: `https://wa.me/${SUPPORT_WHATSAPP}`, external: true },
              ].map(c => (
                <a
                  key={c.label}
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--ct-orange)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                >
                  {c.icon} {c.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: '0 0 24px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            © {new Date().getFullYear()} Chukua Ticket Ltd. All rights reserved. Kenya 🇰🇪
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Built for Kenya. Expanding across Africa.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer .container > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          footer .container > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
