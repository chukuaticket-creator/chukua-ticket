import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import EventCard from '../components/ui/EventCard';
import { EVENTS, CATEGORIES } from '../lib/data';

const CITIES = ['All Cities', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
const DATES = ['Anytime', 'Today', 'This Weekend', 'This Week', 'This Month'];
const PRICES = ['Any Price', 'Free', 'Under KES 1,000', 'Under KES 3,000', 'KES 3,000+'];

export default function Events() {
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('All Cities');
  const [dateFilter, setDateFilter] = useState('Anytime');
  const [priceFilter, setPriceFilter] = useState('Any Price');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return EVENTS.filter(evt => {
      if (q && !evt.title.toLowerCase().includes(q.toLowerCase()) &&
          !evt.venue.toLowerCase().includes(q.toLowerCase()) &&
          !evt.organiser.toLowerCase().includes(q.toLowerCase())) return false;
      if (category !== 'all' && evt.category !== category) return false;
      if (city !== 'All Cities' && evt.city !== city) return false;
      if (priceFilter === 'Free' && !evt.isFree) return false;
      if (priceFilter === 'Under KES 1,000' && evt.tickets[0]?.price >= 1000) return false;
      if (priceFilter === 'Under KES 3,000' && evt.tickets[0]?.price >= 3000) return false;
      if (priceFilter === 'KES 3,000+' && evt.tickets[0]?.price < 3000) return false;
      return true;
    });
  }, [q, category, city, priceFilter]);

  const hasFilters = category !== 'all' || city !== 'All Cities' || dateFilter !== 'Anytime' || priceFilter !== 'Any Price';

  const clearFilters = () => {
    setCategory('all');
    setCity('All Cities');
    setDateFilter('Anytime');
    setPriceFilter('Any Price');
    setQ('');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ background: 'var(--ct-dark)', borderBottom: '1px solid var(--ct-border)', padding: '40px 0 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 44px)', marginBottom: 24 }}>
            Discover Events
          </h1>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-grey)', pointerEvents: 'none' }} />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search events, venues, organizers..."
                style={{ paddingLeft: 40 }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-grey)', pointerEvents: 'none' }} />
              <select value={city} onChange={e => setCity(e.target.value)} style={{ paddingLeft: 36, paddingRight: 16, minWidth: 160 }}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <SlidersHorizontal size={16} /> Filters {hasFilters && <span className="badge badge-orange" style={{ padding: '2px 7px' }}>•</span>}
            </button>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div style={{
              display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap',
              padding: '16px 20px',
              background: 'var(--ct-dark-2)',
              borderRadius: 12,
              border: '1px solid var(--ct-border)',
              animation: 'fadeUp 0.2s ease',
            }}>
              <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label">Date</label>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                  {DATES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label">Price Range</label>
                <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
                  {PRICES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              {hasFilters && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ display: 'flex', gap: 6 }}>
                    <X size={14} /> Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={`pill ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ color: 'var(--ct-grey)', fontSize: 14 }}>
            {filtered.length === 0 ? 'No events found' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🎪</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>No events found</h3>
            <p style={{ color: 'var(--ct-grey)', marginBottom: 24 }}>Try adjusting your filters or search terms</p>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((evt, i) => (
              <div key={evt.id} style={{ animation: `fadeUp 0.4s ${i * 0.06}s ease both` }}>
                <EventCard event={evt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
