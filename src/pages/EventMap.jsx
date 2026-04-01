import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { getPublicMapEvents, formatKES, formatDate, CATEGORIES } from '../lib/api';

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    if (!document.querySelector('link[href*="leaflet"]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    const existing = document.querySelector('script[src*="leaflet"]');
    if (existing) {
      const check = setInterval(() => { if (window.L) { clearInterval(check); resolve(window.L); } }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

export default function EventMap() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const [L, setL] = useState(null);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    loadLeaflet().then(setL);
    getPublicMapEvents().then(data => { setEvents(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || leafletMap.current) return;
    const map = L.map(mapRef.current, { center: [-1.2921, 36.8219], zoom: 12 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    leafletMap.current = map;
    setMapReady(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        map.setView([coords.latitude, coords.longitude], 13);
        const icon = L.divIcon({
          html: '<div style="width:14px;height:14px;background:#FF5C00;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(255,92,0,0.25);"></div>',
          iconSize: [14,14], iconAnchor: [7,7], className: '',
        });
        L.marker([coords.latitude, coords.longitude], { icon }).bindPopup('<b>You are here</b>').addTo(map);
      }, () => {});
    }
    return () => { map.remove(); leafletMap.current = null; };
  }, [L]);

  useEffect(() => {
    if (!mapReady || !L || !leafletMap.current) return;
    const map = leafletMap.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    const filtered = category === 'all' ? events : events.filter(e => e.category === category);
    filtered.forEach(evt => {
      if (!evt.lat || !evt.lng) return;
      const label = evt.isFree ? 'FREE' : `KES ${Number(evt.lowestPrice||0).toLocaleString()}`;
      const icon = L.divIcon({
        html: `<div style="background:#FF5C00;color:white;padding:5px 11px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 3px 10px rgba(255,92,0,0.4);border:2px solid white;cursor:pointer;font-family:system-ui">${label}</div>`,
        className: '', iconAnchor: [0,0],
      });
      const marker = L.marker([evt.lat, evt.lng], { icon });
      marker.on('click', () => setSelected(evt));
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [events, category, mapReady, L]);

  const filtered = category === 'all' ? events : events.filter(e => e.category === category);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', paddingTop:'var(--nav-h)' }}>
      {/* Top bar */}
      <div style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)', padding:'12px 0', flexShrink:0 }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div style={{ flexShrink:0 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'var(--text)' }}>🗺️ Events Near You</h1>
            <p style={{ color:'var(--text-muted)', fontSize:11, marginTop:1 }}>
              {loading ? 'Loading...' : `${filtered.length} public event${filtered.length!==1?'s':''}`}
            </p>
          </div>
          <div style={{ display:'flex', gap:5, overflowX:'auto', flex:1, scrollbarWidth:'none' }}>
            {CATEGORIES.slice(0,7).map(c => (
              <button key={c.id} className={`pill ${category===c.id?'active':''}`} onClick={() => setCategory(c.id)} style={{ fontSize:11 }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <Link to="/organiser/create-event" className="btn btn-primary btn-sm" style={{ flexShrink:0 }}>+ Add Event</Link>
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* Map */}
        <div style={{ flex:1, position:'relative', background:'var(--bg-2)' }}>
          <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
          {!mapReady && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg-2)', gap:12 }}>
              <div className="spinner" style={{ width:36, height:36, borderWidth:3 }} />
              <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading map...</p>
            </div>
          )}
          {mapReady && !loading && filtered.filter(e=>e.lat&&e.lng).length===0 && (
            <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:10, padding:'11px 18px', boxShadow:'var(--card-shadow)', fontSize:13, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
              {events.length===0
                ? <><Link to="/organiser/create-event" style={{ color:'var(--ct-orange)', fontWeight:600 }}>Create the first event →</Link></>
                : 'No map events in this category yet.'}
            </div>
          )}
        </div>

        {/* Selected event panel */}
        <div style={{ width:selected?300:0, transition:'width 0.3s ease', overflow:'hidden', flexShrink:0, borderLeft:'1px solid var(--border)', background:'var(--bg)' }}>
          {selected && (
            <div style={{ width:300, padding:18, overflowY:'auto', height:'100%', animation:'fadeIn 0.2s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <span className="badge badge-orange">{selected.category}</span>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18 }}>✕</button>
              </div>
              {selected.image && <img src={selected.image} alt={selected.title} style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', borderRadius:10, marginBottom:12 }} />}
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, color:'var(--text)', marginBottom:10, lineHeight:1.2 }}>{selected.title}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14 }}>
                <div style={{ display:'flex', gap:6, fontSize:12, color:'var(--text-muted)', alignItems:'center' }}>
                  <Calendar size={12} style={{ color:'var(--ct-orange)' }} /> {formatDate(selected.date)}{selected.time?` · ${selected.time}`:''}
                </div>
                <div style={{ display:'flex', gap:6, fontSize:12, color:'var(--text-muted)', alignItems:'center' }}>
                  <MapPin size={12} style={{ color:'var(--ct-orange)' }} /> {selected.venue}{selected.city?`, ${selected.city}`:''}
                </div>
              </div>
              <div style={{ background:'var(--bg-2)', borderRadius:10, padding:'11px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:10, color:'var(--text-muted)' }}>From</p>
                  <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:selected.isFree?'var(--success)':'var(--ct-orange)' }}>
                    {formatKES(selected.lowestPrice||0)}
                  </p>
                </div>
                <Link to={`/events/${selected.id}`} className="btn btn-primary btn-sm" style={{ display:'flex', gap:5 }}>
                  Tickets <ExternalLink size={12}/>
                </Link>
              </div>
              {selected.description && <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{selected.description.slice(0,160)}{selected.description.length>160?'…':''}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
