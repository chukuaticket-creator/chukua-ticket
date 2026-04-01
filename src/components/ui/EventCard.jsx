import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Zap } from 'lucide-react';
import { formatKES, formatDate, getStatusBadge } from '../../lib/data';

export default function EventCard({ event, style = {} }) {
  const status = getStatusBadge(event.status);
  const lowestPrice = event.tickets.reduce((min, t) => Math.min(min, t.price), Infinity);
  const soldPercent = Math.round(
    ((event.tickets.reduce((s, t) => s + (t.total - t.available), 0)) /
     event.tickets.reduce((s, t) => s + t.total, 0)) * 100
  );

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', ...style }}>
      <article className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', flexShrink: 0 }}>
          <img
            src={event.image}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
          {/* Overlays */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)',
          }} />
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${status.class}`}>{status.label}</span>
            {event.isFree && <span className="badge badge-green">FREE</span>}
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span style={{
              background: 'rgba(10,10,10,0.8)', color: 'var(--ct-white)',
              padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-display)',
            }}>
              {event.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, lineHeight: 1.3,
            color: 'var(--ct-white)',
          }}>{event.title}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ct-grey)', fontSize: 13 }}>
              <Calendar size={13} style={{ flexShrink: 0 }} />
              <span>{formatDate(event.date)} · {event.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ct-grey)', fontSize: 13 }}>
              <MapPin size={13} style={{ flexShrink: 0 }} />
              <span>{event.venue}, {event.city}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ct-grey)', fontSize: 13 }}>
              <Users size={13} style={{ flexShrink: 0 }} />
              <span>{event.attendees.toLocaleString()} attending</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 4 }}>
            <div style={{
              height: 3, background: 'var(--ct-dark-4)', borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${soldPercent}%`,
                background: soldPercent > 80 ? 'var(--ct-danger)' : 'var(--ct-orange)',
                borderRadius: 2, transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--ct-grey)', marginTop: 4 }}>{soldPercent}% sold</p>
          </div>

          {/* Price */}
          <div style={{
            marginTop: 'auto', paddingTop: 12,
            borderTop: '1px solid var(--ct-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--ct-grey)' }}>From</p>
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                color: event.isFree ? 'var(--ct-success)' : 'var(--ct-orange)',
              }}>
                {formatKES(lowestPrice)}
              </p>
            </div>
            <button className="btn btn-primary btn-sm">Get Tickets</button>
          </div>
        </div>
      </article>
    </Link>
  );
}
