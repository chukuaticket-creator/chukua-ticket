import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Youtube, Mail, Phone } from 'lucide-react';

const LOGO = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--ct-border)',
      background: 'var(--ct-dark)',
      padding: '60px 0 32px',
      marginTop: 80,
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <img src={LOGO} alt="Chukua Ticket" style={{ height: 40, marginBottom: 16 }}
              onError={e => { e.target.style.display='none'; }} />
            <p style={{ color: 'var(--ct-grey)', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
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
                  background: 'var(--ct-dark-3)', border: '1px solid var(--ct-border)',
                  color: 'var(--ct-grey)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='var(--ct-orange)'; e.currentTarget.style.borderColor='var(--ct-orange)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--ct-grey)'; e.currentTarget.style.borderColor='var(--ct-border)'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ct-grey)', marginBottom: 16 }}>Explore</h4>
            {['Discover Events', 'Create Event', 'How It Works', 'Pricing'].map(l => (
              <div key={l} style={{ marginBottom: 10 }}>
                <Link to="#" style={{ color: 'var(--ct-grey-light)', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='var(--ct-white)'}
                  onMouseLeave={e => e.target.style.color='var(--ct-grey-light)'}
                >{l}</Link>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ct-grey)', marginBottom: 16 }}>Organisers</h4>
            {['Dashboard', 'Analytics', 'Ticket Types', 'Promotions', 'Gate Scanner'].map(l => (
              <div key={l} style={{ marginBottom: 10 }}>
                <Link to="#" style={{ color: 'var(--ct-grey-light)', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='var(--ct-white)'}
                  onMouseLeave={e => e.target.style.color='var(--ct-grey-light)'}
                >{l}</Link>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ct-grey)', marginBottom: 16 }}>Company</h4>
            {['About Us', 'Blog', 'Careers', 'Privacy Policy', 'Terms of Service'].map(l => (
              <div key={l} style={{ marginBottom: 10 }}>
                <Link to="#" style={{ color: 'var(--ct-grey-light)', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='var(--ct-white)'}
                  onMouseLeave={e => e.target.style.color='var(--ct-grey-light)'}
                >{l}</Link>
              </div>
            ))}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="mailto:hello@chukuaticket.co.ke" style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--ct-grey)', fontSize: 13 }}>
                <Mail size={14} /> hello@chukuaticket.co.ke
              </a>
              <a href="tel:+254700000000" style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--ct-grey)', fontSize: 13 }}>
                <Phone size={14} /> +254 700 000 000
              </a>
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: '0 0 24px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--ct-grey)', fontSize: 13 }}>
            © {new Date().getFullYear()} Chukua Ticket Ltd. All rights reserved. Kenya 🇰🇪
          </p>
          <p style={{ color: 'var(--ct-grey)', fontSize: 13 }}>
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
