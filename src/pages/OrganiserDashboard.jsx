import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Ticket, Calendar, Users, Plus, Eye, Edit3, Trash2, CheckCircle, Clock, AlertTriangle, Search, Camera, XCircle, QrCode, Download } from 'lucide-react';
import { getOrganiserStats, getOrganiserEvents, getOrganiserPayouts, getProfile, findTickets, checkInTicket, formatKES, formatDate } from '../lib/api';
import { renderQR, downloadQR, startScanner } from '../lib/qr';

const StatCard = ({ icon, label, value, sub, accent = false }) => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: accent ? 'var(--ct-orange-dim)' : 'var(--bg-3)',
        color: accent ? 'var(--ct-orange)' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 2 }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const MiniChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.sales), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%',
            height: `${(d.sales / max) * 72}px`,
            minHeight: 2,
            background: i === data.length - 1 ? 'var(--ct-orange)' : 'var(--bg-3)',
            borderRadius: '4px 4px 0 0',
          }}
            title={`${d.day}: ${d.sales} tickets`}
          />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ icon, title, body, cta }) => (
  <div style={{ textAlign: 'center', padding: '56px 24px' }}>
    <div style={{ fontSize: 44, marginBottom: 14 }}>{icon}</div>
    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto 22px', fontSize: 14, lineHeight: 1.6 }}>{body}</p>
    {cta}
  </div>
);

const SITE = 'https://chukuaticket.com';

// Shareable QR for an event — organisers print or post this.
function EventQR({ event, onClose }) {
  const boxRef = useRef(null);
  const url = `${SITE}/events/${event.id}`;
  const [err, setErr] = useState('');

  useEffect(() => {
    renderQR(boxRef.current, url, 220).catch(() => setErr('Could not draw the QR code.'));
  }, [url]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 18,
        padding: 28, width: '100%', maxWidth: 360, textAlign: 'center',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, marginBottom: 4 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
          Scan to open the ticket page
        </p>

        {/* White plate: a QR on a dark background will not scan. */}
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'inline-block' }}>
          <div ref={boxRef} />
        </div>

        {err && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{err}</p>}

        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '14px 0 18px', wordBreak: 'break-all' }}>
          {url.replace('https://', '')}
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={() => downloadQR(boxRef.current, `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-qr.png`, event.title)}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {qrEvent && <EventQR event={qrEvent} onClose={() => setQrEvent(null)} />}
    </div>
  );
}

function CheckInPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stopRef = useRef(null);

  // The camera must be released when this tab is left, or the light stays on.
  useEffect(() => () => { stopRef.current?.(); }, []);

  const search = async (raw) => {
    const q = (raw ?? query).trim();
    if (q.length < 3) return;
    setSearching(true);
    setVerdict(null);
    const found = await findTickets(q);
    setResults(found);
    setSearching(false);
  };

  const verify = async (code) => {
    setVerdict(null);
    const res = await checkInTicket(code);
    setVerdict(res);
    // Reflect the new state without a second round trip.
    setResults(rs => (rs || []).map(r =>
      r.ticketCode === code ? { ...r, checkedIn: res.ok ? true : r.checkedIn } : r
    ));
  };

  const toggleScan = async () => {
    if (scanning) {
      stopRef.current?.();
      setScanning(false);
      return;
    }
    setCamError('');
    setScanning(true);
    stopRef.current = await startScanner(
      videoRef.current,
      canvasRef.current,
      async (text) => {
        setScanning(false);
        setQuery(text);
        await search(text);
        await verify(text);
      },
      (msg) => { setCamError(msg); setScanning(false); },
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 620 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
        Gate Check-in
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>
        Scan the attendee's QR code, or type their ticket code, email or phone number.
      </p>

      <form
        onSubmit={e => { e.preventDefault(); search(); }}
        style={{ display: 'flex', gap: 8, marginBottom: 14 }}
      >
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="CT-4F9K2B, email or 07XX XXX XXX"
          style={{ flex: 1 }}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary" disabled={searching || query.trim().length < 3}>
          {searching ? <span className="spinner" /> : <Search size={16} />}
        </button>
        <button
          type="button"
          onClick={toggleScan}
          className={`btn ${scanning ? 'btn-secondary' : 'btn-ghost'}`}
          title="Scan a QR code"
        >
          {scanning ? <XCircle size={16} /> : <Camera size={16} />}
        </button>
      </form>

      {/* Camera */}
      <div style={{ display: scanning ? 'block' : 'none', marginBottom: 16 }}>
        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: 12, background: '#000', maxHeight: 320, objectFit: 'cover' }}
          muted
          playsInline
        />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          Point the camera at the ticket QR code
        </p>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {camError && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 10,
          padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 16,
        }}>
          {camError}
        </div>
      )}

      {/* Verdict */}
      {verdict && (
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 18,
          background: verdict.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${verdict.ok ? 'var(--success)' : 'var(--danger)'}`,
          borderRadius: 12, padding: 16,
        }}>
          {verdict.ok
            ? <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
            : <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />}
          <div>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17,
              color: verdict.ok ? 'var(--success)' : 'var(--danger)', marginBottom: 2,
            }}>
              {verdict.ok ? 'Let them in' : verdict.message}
            </p>
            {verdict.buyerName && (
              <p style={{ fontSize: 14 }}>{verdict.buyerName}{verdict.eventTitle ? ` · ${verdict.eventTitle}` : ''}</p>
            )}
            {!verdict.ok && verdict.checkedInAt && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                First scanned {new Date(verdict.checkedInAt).toLocaleString('en-KE')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {results !== null && results.length === 0 && (
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No ticket found</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Check the spelling, or try their email instead of the phone number.
          </p>
        </div>
      )}

      {results?.map(r => (
        <div key={r.ticketCode} className="card" style={{ padding: 18, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{r.buyerName || 'Unnamed'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.buyerEmail}</p>
              {r.buyerPhone && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.buyerPhone}</p>}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {r.eventTitle} · {r.tickets} ticket{r.tickets === 1 ? '' : 's'}
              </p>
              <p style={{
                fontFamily: 'monospace', fontSize: 13, color: 'var(--ct-orange)',
                marginTop: 6, letterSpacing: '0.04em',
              }}>
                {r.ticketCode}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${r.status === 'paid' ? 'badge-green' : 'badge-red'}`}>
                {r.status === 'paid' ? 'Paid' : r.status}
              </span>
              {r.checkedIn && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Already in{r.checkedInAt ? ` · ${new Date(r.checkedInAt).toLocaleTimeString('en-KE')}` : ''}
                </p>
              )}
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 10, opacity: (r.status !== 'paid' || r.checkedIn) ? 0.5 : 1 }}
                disabled={r.status !== 'paid' || r.checkedIn}
                onClick={() => verify(r.ticketCode)}
              >
                {r.checkedIn ? 'Checked in' : 'Check in'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrganiserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [qrEvent, setQrEvent] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      getOrganiserStats(),
      getOrganiserEvents(),
      getOrganiserPayouts(),
      getProfile(),
    ]).then(([s, e, p, pr]) => {
      if (!active) return;
      setStats(s);
      setEvents(e);
      setPayouts(p);
      setProfile(pr);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'My Events' },
    { id: 'checkin', label: 'Check-in' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'payouts', label: 'Payouts' },
  ];

  const payoutReady = profile?.payoutActivated ?? profile?.payout_activated ?? false;
  const salesChart = stats?.salesThisWeek || [];
  const settled = payouts.reduce((s, p) => s + (p.amount || 0), 0);

  const createBtn = <Link to="/organiser/create-event" className="btn btn-primary">+ Create Event</Link>;

  return (
    <div className="page-wrapper">
      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '32px 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>
                {profile?.name ? `Welcome back, ${profile.name.split(' ')[0]} 👋` : 'Welcome back 👋'}
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>Organiser Dashboard</h1>
            </div>
            <Link to="/organiser/create-event" className="btn btn-primary" style={{ display: 'flex', gap: 8 }}>
              <Plus size={18} /> New Event
            </Link>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {tabs.map(t => (
              <button key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '10px 18px', background: 'none', border: 'none',
                  fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
                  color: activeTab === t.id ? 'var(--text)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === t.id ? 'var(--ct-orange)' : 'transparent'}`,
                  transition: 'all 0.2s', cursor: 'pointer',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px 80px' }}>

        {/* Payout setup is required before money can reach the organiser */}
        {!loading && profile && !payoutReady && (
          <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: 'rgba(255,92,0,0.08)', border: '1px solid rgba(255,92,0,0.25)',
            borderRadius: 12, padding: 16, marginBottom: 24,
          }}>
            <AlertTriangle size={18} style={{ color: 'var(--ct-orange)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Finish your payout setup</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Your ticket sales can't be settled until you add your M-Pesa or bank details.{' '}
                <Link to="/organiser/setup-payout" style={{ color: 'var(--ct-orange)', fontWeight: 600 }}>Set it up now</Link>
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <span className="spinner" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="grid-4" style={{ marginBottom: 32 }}>
                  <StatCard
                    icon={<TrendingUp size={18} />}
                    label="Your Revenue"
                    value={formatKES(stats?.organiserRevenue ?? 0)}
                    sub="After the 7% platform fee"
                    accent
                  />
                  <StatCard
                    icon={<Ticket size={18} />}
                    label="Tickets Sold"
                    value={(stats?.ticketsSold ?? 0).toLocaleString()}
                    sub="Across all events"
                  />
                  <StatCard
                    icon={<Calendar size={18} />}
                    label="Active Events"
                    value={stats?.activeEvents ?? 0}
                    sub={`${stats?.totalEvents ?? 0} total`}
                  />
                  <StatCard
                    icon={<Users size={18} />}
                    label="Check-in Rate"
                    value={stats?.checkInRate != null ? `${stats.checkInRate}%` : '—'}
                    sub="Last event"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Sales This Week</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Daily ticket sales</p>
                    {salesChart.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '24px 0' }}>No sales yet this week.</p>
                    ) : (
                      <>
                        <MiniChart data={salesChart} />
                        <div className="divider" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Total this week</span>
                          <span style={{ fontWeight: 700, color: 'var(--ct-orange)' }}>
                            {salesChart.reduce((s, d) => s + d.sales, 0)} tickets
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Recent Events</h3>
                    {events.length === 0 ? (
                      <EmptyState
                        icon="🎪"
                        title="No events yet"
                        body="Create your first event and it'll show up here with live sales."
                        cta={createBtn}
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {events.slice(0, 5).map(evt => {
                          const sold = evt.ticketsSold || 0;
                          const cap = evt.totalTickets || 0;
                          const pct = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                          const net = evt.organiserReceives ?? Math.round((evt.revenue || 0) * 0.93);
                          return (
                            <div key={evt.id} style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <div>
                                  <p style={{ fontWeight: 600, fontSize: 14 }}>{evt.title}</p>
                                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(evt.date)}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ct-orange)' }}>
                                    {formatKES(net)}
                                  </p>
                                  <span className={`badge ${evt.status === 'completed' ? 'badge-grey' : 'badge-green'}`} style={{ fontSize: 10 }}>
                                    {evt.status === 'completed' ? 'Completed' : 'On Sale'}
                                  </span>
                                </div>
                              </div>
                              {cap > 0 && (
                                <div>
                                  <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: pct > 90 ? 'var(--success)' : 'var(--ct-orange)', borderRadius: 2 }} />
                                  </div>
                                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {sold}/{cap} tickets sold ({pct}%)
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>My Events</h2>
                  <Link to="/organiser/create-event" className="btn btn-primary btn-sm" style={{ display: 'flex', gap: 6 }}>
                    <Plus size={14} /> Create Event
                  </Link>
                </div>
                {events.length === 0 ? (
                  <div className="card">
                    <EmptyState
                      icon="🎟️"
                      title="You haven't created an event yet"
                      body="Set up your first event in about five minutes — details, ticket tiers, publish."
                      cta={createBtn}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {events.map(evt => {
                      const sold = evt.ticketsSold || 0;
                      const cap = evt.totalTickets || 0;
                      const pct = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                      const net = evt.organiserReceives ?? Math.round((evt.revenue || 0) * 0.93);
                      return (
                        <div key={evt.id} className="card" style={{ padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                <span className={`badge ${evt.status === 'completed' ? 'badge-grey' : 'badge-green'}`}>
                                  {evt.status === 'completed' ? <><Clock size={10} /> Completed</> : <><CheckCircle size={10} /> On Sale</>}
                                </span>
                              </div>
                              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{evt.title}</h3>
                              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(evt.date)}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{sold}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sold</p>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ct-orange)' }}>
                                  {formatKES(net)}
                                </p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your share</p>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{pct}%</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sold out</p>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <Link to={`/events/${evt.id}`} className="btn btn-ghost btn-sm" title="View"><Eye size={14} /></Link>
                                <button className="btn btn-ghost btn-sm" title="Share QR code" onClick={() => setQrEvent(evt)}><QrCode size={14} /></button>
                                <button className="btn btn-ghost btn-sm" title="Edit"><Edit3 size={14} /></button>
                                <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                          </div>
                          {cap > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: pct > 90 ? 'var(--success)' : 'var(--ct-orange)', borderRadius: 2 }} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'checkin' && <CheckInPanel />}

            {activeTab === 'analytics' && (
              <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Deep Analytics</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 24px' }}>
                  Detailed demographics, revenue breakdowns, peak hours, and more — coming soon.
                </p>
                <span className="badge badge-orange">Coming Soon</span>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Payouts</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, maxWidth: 560, lineHeight: 1.6 }}>
                  Payouts are automatic. Every ticket sale is split at the moment of payment — your 93%
                  goes to your own Paystack account and settles to your M-Pesa or bank within 2 working days.
                  There's nothing to request.
                </p>

                <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Settled to you so far</p>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, color: 'var(--success)' }}>
                    {formatKES(settled)}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>
                    Paid to {profile?.settlementType === 'bank' ? 'your bank account' : 'your M-Pesa number'} via Paystack
                  </p>
                </div>

                {payouts.length === 0 ? (
                  <div className="card">
                    <EmptyState
                      icon="💰"
                      title="No settlements yet"
                      body="Once you make your first sale, each settlement will be listed here with its date and reference."
                      cta={payoutReady ? createBtn : <Link to="/organiser/setup-payout" className="btn btn-primary">Set Up Payouts</Link>}
                    />
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {payouts.map((p, i) => (
                      <div key={p.id || i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: i < payouts.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{p.eventTitle || 'Ticket sales'}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {formatDate(p.date)}{p.reference ? ` · ${p.reference}` : ''}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--success)' }}>{formatKES(p.amount)}</p>
                          <span className={`badge ${p.status === 'settled' ? 'badge-green' : 'badge-grey'}`} style={{ fontSize: 10 }}>
                            {p.status === 'settled' ? 'Settled' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {qrEvent && <EventQR event={qrEvent} onClose={() => setQrEvent(null)} />}
    </div>
  );
}
