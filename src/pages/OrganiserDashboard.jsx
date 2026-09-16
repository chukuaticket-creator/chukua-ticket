import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Ticket, Calendar, Users, Plus, Eye, Edit3, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { getOrganiserStats, getOrganiserEvents, getOrganiserPayouts, getProfile, formatKES, formatDate } from '../lib/api';

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

export default function OrganiserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [profile, setProfile] = useState(null);

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
    </div>
  );
}
