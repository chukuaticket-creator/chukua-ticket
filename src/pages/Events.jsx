import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, X, Calendar, Users } from 'lucide-react';
import { getEvents, formatKES, formatDate, CATEGORIES } from '../lib/api';

const CITIES = ['All Cities', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
const DATES = ['Anytime', 'Today', 'This Weekend', 'This Week', 'This Month'];
const PRICES = ['Any Price', 'Free', 'Under KES 1,000', 'Under KES 3,000', 'KES 3,000+'];

function EventCard({ event }) {
  const lowestPrice = event.tickets?.reduce((m, t) => Math.min(m, t.price), Infinity) ?? 0;
  const totalTickets = event.tickets?.reduce((s, t) => s + t.total, 0) || 1;
  const soldTickets = event.tickets?.reduce((s, t) => s + (t.total - t.available), 0) || 0;
  const soldPct = Math.round((soldTickets / totalTickets) * 100);

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <article className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', flexShrink: 0, background: 'var(--bg-3)' }}>
          {event.image
            ? <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                {CATEGORIES.find(c => c.id === event.category)?.icon || '🎪'}
              </div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
            {event.status === 'selling_fast' && <span className="badge badge-orange">🔥 Selling Fast</span>}
            {event.isFree && <span className="badge badge-green">FREE</span>}
          </div>
        </div>

        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: 'var(--text)' }}>
            {event.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              <Calendar size={12} /> {formatDate(event.date)}{event.time ? ` · ${event.time}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              <MapPin size={12} /> {event.venue}{event.city ? `, ${event.city}` : ''}
            </div>
            {event.attendees > 0 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                <Users size={12} /> {event.attendees.toLocaleString()} attending
              </div>
            )}
          </div>

          {soldPct > 0 && (
            <div>
              <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${soldPct}%`, background: soldPct > 80 ? 'var(--danger)' : 'var(--ct-orange)', borderRadius: 2 }} />
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{soldPct}% sold</p>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>From</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: event.isFree ? 'var(--success)' : 'var(--ct-orange)' }}>
                {formatKES(lowestPrice)}
              </p>
            </div>
            <span className="btn btn-primary btn-sm">Get Tickets</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Events() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('All Cities');
  const [priceFilter, setPriceFilter] = useState('Any Price');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEvents().then(data => { setEvents(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => events.filter(evt => {
    if (q && !evt.title?.toLowerCase().includes(q.toLowerCase()) &&
        !evt.venue?.toLowerCase().includes(q.toLowerCase())) return false;
    if (category !== 'all' && evt.category !== category) return false;
    if (city !== 'All Cities' && evt.city !== city) return false;
    const p = evt.tickets?.[0]?.price || 0;
    if (priceFilter === 'Free' && !evt.isFree) return false;
    if (priceFilter === 'Under KES 1,000' && p >= 1000) return false;
    if (priceFilter === 'Under KES 3,000' && p >= 3000) return false;
    if (priceFilter === 'KES 3,000+' && p < 3000) return false;
    return true;
  }), [events, q, category, city, priceFilter]);

  const clearFilters = () => { setQ(''); setCategory('all'); setCity('All Cities'); setPriceFilter('Any Price'); };
  const hasFilters = category !== 'all' || city !== 'All Cities' || priceFilter !== 'Any Price' || q;

  return (
    <div className="page-wrapper">
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '32px 0 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px,5vw,42px)', marginBottom: 20, color: 'var(--text)' }}>
            Discover Events
          </h1>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search events..." style={{ paddingLeft: 38 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select value={city} onChange={e => setCity(e.target.value)} style={{ paddingLeft: 32, minWidth: 150 }}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilters(s => !s)} style={{ display: 'flex', gap: 7 }}>
              <SlidersHorizontal size={14} /> Filters {hasFilters && '·'}
            </button>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ display: 'flex', gap: 5 }}><X size={13}/> Clear</button>}
          </div>

          {showFilters && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', animation: 'fadeUp 0.2s ease', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                <label className="form-label">Price</label>
                <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
                  {PRICES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14, scrollbarWidth: 'none' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} className={`pill ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 24px 80px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎪</div>
            <h3>No events found</h3>
            <p>{events.length === 0 ? 'No events listed yet. Be the first to create one!' : 'Try adjusting your search or filters.'}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {hasFilters && <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>}
              <Link to="/organiser/create-event" className="btn btn-primary">+ List an Event</Link>
            </div>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid-3">
              {filtered.map((evt, i) => (
                <div key={evt.id} style={{ animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
                  <EventCard event={evt} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
