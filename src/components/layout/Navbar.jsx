import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, ChevronDown } from 'lucide-react';

const LOGO = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const navLinks = [
    { to: '/events', label: 'Discover' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/organiser', label: 'For Organisers' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 'var(--nav-h)',
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--ct-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img
              src={LOGO}
              alt="Chukua Ticket"
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span style={{ display: 'none', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ct-orange)' }}>
              Chukua<span style={{ color: 'var(--ct-white)' }}>Ticket</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 4, flex: 1 }} className="desktop-nav">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: location.pathname.startsWith(l.to) ? 'var(--ct-orange)' : 'var(--ct-grey-light)',
                background: location.pathname.startsWith(l.to) ? 'var(--ct-orange-dim)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!location.pathname.startsWith(l.to)) e.target.style.color = 'var(--ct-white)'; }}
              onMouseLeave={e => { if (!location.pathname.startsWith(l.to)) e.target.style.color = 'var(--ct-grey-light)'; }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSearchOpen(!searchOpen)}
              style={{ padding: '8px 10px' }}
            >
              <Search size={16} />
            </button>

            <Link to="/login" className="btn btn-ghost btn-sm" style={{ display: 'flex' }}>
              Sign In
            </Link>
            <Link to="/organiser/create-event" className="btn btn-primary btn-sm" style={{ display: 'flex' }}>
              + List Event
            </Link>

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'none', border: 'none', color: 'var(--ct-white)',
                padding: 8, display: 'none',
              }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0,
          background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--ct-border)',
          padding: '20px 24px', zIndex: 999,
          animation: 'fadeUp 0.2s ease',
        }}>
          <form onSubmit={handleSearch} style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 12 }}>
            <input
              autoFocus
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search events, venues, organizers..."
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, bottom: 0,
          background: 'var(--ct-dark)', zIndex: 998,
          padding: 24, display: 'flex', flexDirection: 'column', gap: 8,
          animation: 'fadeIn 0.2s ease',
        }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '14px 16px', borderRadius: 10,
              fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)',
              color: location.pathname.startsWith(l.to) ? 'var(--ct-orange)' : 'var(--ct-white)',
              background: location.pathname.startsWith(l.to) ? 'var(--ct-orange-dim)' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
          <div className="divider" />
          <Link to="/login" className="btn btn-secondary btn-block">Sign In</Link>
          <Link to="/organiser/create-event" className="btn btn-primary btn-block">+ List Your Event</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
