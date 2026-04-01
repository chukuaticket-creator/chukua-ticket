import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../lib/theme';

const LOGO = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setMobileOpen(false), [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) { navigate(`/events?q=${encodeURIComponent(searchQ)}`); setSearchOpen(false); setSearchQ(''); }
  };

  const links = [
    { to: '/events', label: 'Discover' },
    { to: '/map', label: '🗺️ Live Map' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/organiser', label: 'For Organisers' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 'var(--nav-h)',
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--nav-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24, width: '100%' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src={LOGO} alt="Chukua Ticket" style={{ height: 34, width: 'auto', objectFit: 'contain' }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <span style={{ display:'none', fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'var(--ct-orange)' }}>
              Chukua<span style={{ color:'var(--text)' }}>Ticket</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="desktop-links" style={{ display:'flex', gap:2, flex:1 }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: '7px 13px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                color: location.pathname.startsWith(l.to) ? 'var(--ct-orange)' : 'var(--text-muted)',
                background: location.pathname.startsWith(l.to) ? 'var(--ct-orange-dim)' : 'transparent',
                transition: 'all 0.18s',
              }}>{l.label}</Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSearchOpen(s => !s)} style={{ padding:'7px 10px' }}>
              <Search size={15} />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className={`theme-toggle ${dark ? 'dark' : ''}`}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            />

            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/organiser/create-event" className="btn btn-primary btn-sm">+ List Event</Link>

            <button className="mobile-btn" onClick={() => setMobileOpen(o => !o)}
              style={{ background:'none', border:'none', color:'var(--text)', padding:8, display:'none' }}>
              {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Search bar */}
      {searchOpen && (
        <div style={{
          position:'fixed', top:'var(--nav-h)', left:0, right:0, zIndex:999,
          background:'var(--nav-bg)', backdropFilter:'blur(16px)',
          borderBottom:'1px solid var(--nav-border)', padding:'16px 24px',
          animation:'fadeUp 0.2s ease',
        }}>
          <form onSubmit={handleSearch} style={{ maxWidth:560, margin:'0 auto', display:'flex', gap:10 }}>
            <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search events, venues..." style={{ flex:1 }} />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position:'fixed', top:'var(--nav-h)', left:0, right:0, bottom:0,
          background:'var(--bg)', zIndex:998, padding:20,
          display:'flex', flexDirection:'column', gap:6, animation:'fadeIn 0.2s',
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding:'13px 16px', borderRadius:10, fontSize:17, fontWeight:600,
              color: location.pathname.startsWith(l.to) ? 'var(--ct-orange)' : 'var(--text)',
              background: location.pathname.startsWith(l.to) ? 'var(--ct-orange-dim)' : 'transparent',
            }}>{l.label}</Link>
          ))}
          <div className="divider"/>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px' }}>
            <span style={{ fontSize:14, color:'var(--text-muted)' }}>{dark ? '🌙 Dark mode' : '☀️ Light mode'}</span>
            <button onClick={toggle} className={`theme-toggle ${dark ? 'dark' : ''}`}/>
          </div>
          <Link to="/login" className="btn btn-secondary btn-block">Sign In</Link>
          <Link to="/organiser/create-event" className="btn btn-primary btn-block">+ List Your Event</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .mobile-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
