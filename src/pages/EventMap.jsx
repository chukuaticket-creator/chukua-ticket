import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Filter, Calendar, ExternalLink } from 'lucide-react';
import { getPublicMapEvents, formatKES, formatDate, CATEGORIES } from '../lib/api';

// Uses Leaflet (free, open-source maps — no API key needed)
// Add to index.html: <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
// Add to index.html: <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

export default function EventMap() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getPublicMapEvents().then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    if (!window.L) return;

    const L = window.L;

    // Default center: Nairobi
    const map = L.map(mapRef.current, {
      center: [-1.2921, 36.8219],
      zoom: 12,
      zoomControl: true,
    });

    // Free OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        map.setView([latitude, longitude], 13);

        // User location marker
        const userIcon = L.divIcon({
          html: `<div style="
            width:16px;height:16px;
            background:#FF5C00;border-radius:50%;
            border:3px solid white;
            box-shadow:0 0 0 3px rgba(255,92,0,0.3);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          className: '',
        });
        L.marker([latitude, longitude], { icon: userIcon })
          .bindPopup('<b>You are here</b>')
          .addTo(map);
      });
    }

    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // Add event markers when events load
  useEffect(() => {
    if (!leafletMap.current || !window.L) return;
    const L = window.L;
    const map = leafletMap.current;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker && layer._isEventMarker) map.removeLayer(layer);
    });

    const filtered = category === 'all' ? events : events.filter(e => e.category === category);

    filtered.forEach(evt => {
      if (!evt.lat || !evt.lng) return;

      const icon = L.divIcon({
        html: `<div style="
          background:#FF5C00;color:white;
          padding:5px 10px;border-radius:20px;
          font-size:12px;font-weight:700;white-space:nowrap;
          box-shadow:0 2px 8px rgba(255,92,0,0.4);
          border:2px solid white;cursor:pointer;
          font-family:system-ui;
        ">${evt.isFree ? 'FREE' : `KES ${Number(evt.lowestPrice || 0).toLocaleString()}`}</div>`,
        className: '',
        iconAnchor: [0, 0],
      });

      const marker = L.marker([evt.lat, evt.lng], { icon });
      marker._isEventMarker = true;
      marker.on('click', () => setSelected(evt));
      marker.addTo(map);
    });
  }, [events, category]);

  const filtered = category === 'all' ? events : events.filter(e => e.category === category);

  return (
    <div className="page-wrapper" style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      {/* Header */}
      <div style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)', padding:'16px 0', flexShrink:0 }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22 }}>
              🗺️ Events Near You
            </h1>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>
              {loading ? 'Loading events...' : `${filtered.length} public event${filtered.length !== 1 ? 's' : ''} on the map`}
            </p>
          </div>
          <div style={{ display:'flex', gap:6, overflowX:'auto', flex:1, scrollbarWidth:'none' }}>
            {CATEGORIES.slice(0, 6).map(c => (
              <button key={c.id} className={`pill ${category === c.id ? 'active' : ''}`}
                onClick={() => setCategory(c.id)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map + sidebar */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Leaflet map */}
        <div style={{ flex:1, position:'relative' }}>
          {/* Load Leaflet dynamically */}
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

          <div ref={mapRef} style={{ width:'100%', height:'100%' }} />

          {!window.L && (
            <div style={{
              position:'absolute', inset:0,
              background:'var(--bg-2)',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexDirection:'column', gap:12,
            }}>
              <MapPin size={48} style={{ color:'var(--ct-orange)' }} />
              <p style={{ color:'var(--text-muted)', fontSize:14, textAlign:'center', maxWidth:300 }}>
                Map requires internet connection. Add Leaflet to your index.html to enable the map.
              </p>
              <code style={{
                background:'var(--bg-3)', padding:'8px 14px', borderRadius:8,
                fontSize:11, color:'var(--text-muted)', display:'block', maxWidth:400,
              }}>
                {`<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>`}
              </code>
            </div>
          )}

          {/* No events state */}
          {!loading && filtered.length === 0 && (
            <div style={{
              position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)',
              background:'var(--card-bg)', border:'1px solid var(--border)',
              borderRadius:12, padding:'14px 20px',
              boxShadow:'var(--card-shadow)', textAlign:'center',
            }}>
              <p style={{ color:'var(--text-muted)', fontSize:14 }}>
                No public events in this category yet.{' '}
                <Link to="/organiser/create-event" style={{ color:'var(--ct-orange)', fontWeight:600 }}>
                  List your event →
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Event panel */}
        <div style={{
          width: selected ? 320 : 0,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg)',
          flexShrink: 0,
        }}>
          {selected && (
            <div style={{ width:320, padding:20, animation:'fadeIn 0.2s ease' }}>
              <button onClick={() => setSelected(null)}
                style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', marginBottom:16, fontSize:13 }}>
                ✕ Close
              </button>
              {selected.image && (
                <img src={selected.image} alt={selected.title}
                  style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', borderRadius:10, marginBottom:14 }} />
              )}
              <span className="badge badge-orange" style={{ marginBottom:10 }}>{selected.category}</span>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, marginBottom:8, color:'var(--text)' }}>
                {selected.title}
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                <div style={{ display:'flex', gap:7, alignItems:'center', fontSize:13, color:'var(--text-muted)' }}>
                  <Calendar size={13} style={{ color:'var(--ct-orange)' }} />
                  {formatDate(selected.date)} · {selected.time}
                </div>
                <div style={{ display:'flex', gap:7, alignItems:'center', fontSize:13, color:'var(--text-muted)' }}>
                  <MapPin size={13} style={{ color:'var(--ct-orange)' }} />
                  {selected.venue}, {selected.city}
                </div>
              </div>
              <div style={{
                background:'var(--bg-2)', borderRadius:10, padding:'12px 14px',
                display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14,
              }}>
                <div>
                  <p style={{ fontSize:11, color:'var(--text-muted)' }}>From</p>
                  <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color: selected.isFree ? 'var(--success)' : 'var(--ct-orange)' }}>
                    {formatKES(selected.lowestPrice || 0)}
                  </p>
                </div>
                <Link to={`/events/${selected.id}`} className="btn btn-primary" style={{ display:'flex', gap:6 }}>
                  Get Tickets <ExternalLink size={13} />
                </Link>
              </div>
              {selected.description && (
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
                  {selected.description.slice(0, 140)}{selected.description.length > 140 ? '…' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
