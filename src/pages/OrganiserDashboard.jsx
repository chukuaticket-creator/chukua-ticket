import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Ticket, Calendar, Users, BarChart2, Plus, Eye, Edit3, Trash2, CheckCircle, Clock } from 'lucide-react';
import { ORGANISER_STATS, ORGANISER_EVENTS, SALES_CHART_DATA, formatKES, formatDate } from '../lib/data';

const StatCard = ({ icon, label, value, sub, accent = false }) => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: accent ? 'var(--ct-orange-dim)' : 'var(--ct-dark-3)',
        color: accent ? 'var(--ct-orange)' : 'var(--ct-grey)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 2 }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--ct-grey)' }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--ct-orange)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const MiniChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.sales));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%',
            height: `${(d.sales / max) * 72}px`,
            background: i === data.length - 1 ? 'var(--ct-orange)' : 'var(--ct-dark-4)',
            borderRadius: '4px 4px 0 0',
            transition: 'background 0.2s',
            cursor: 'pointer',
          }}
            title={`${d.day}: ${d.sales} tickets`}
          />
          <span style={{ fontSize: 10, color: 'var(--ct-grey)' }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
};

export default function OrganiserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'My Events' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'payouts', label: 'Payouts' },
  ];

  return (
    <div className="page-wrapper">
      <div style={{ background: 'var(--ct-dark)', borderBottom: '1px solid var(--ct-border)', padding: '32px 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ color: 'var(--ct-grey)', fontSize: 14, marginBottom: 4 }}>Welcome back 👋</p>
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
                  color: activeTab === t.id ? 'var(--ct-white)' : 'var(--ct-grey)',
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

        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Stat cards */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
              <StatCard
                icon={<TrendingUp size={18} />}
                label="Total Revenue"
                value={`KES ${(ORGANISER_STATS.totalRevenue / 1000).toFixed(0)}K`}
                sub="↑ 18% this month"
                accent
              />
              <StatCard
                icon={<Ticket size={18} />}
                label="Tickets Sold"
                value={ORGANISER_STATS.ticketsSold.toLocaleString()}
                sub="Across all events"
              />
              <StatCard
                icon={<Calendar size={18} />}
                label="Active Events"
                value={ORGANISER_STATS.activeEvents}
                sub={`${ORGANISER_STATS.totalEvents} total`}
              />
              <StatCard
                icon={<Users size={18} />}
                label="Check-in Rate"
                value={`${ORGANISER_STATS.checkInRate}%`}
                sub="Last event"
              />
            </div>

            {/* Chart + recent events */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Sales This Week</h3>
                <p style={{ fontSize: 13, color: 'var(--ct-grey)', marginBottom: 20 }}>Daily ticket sales</p>
                <MiniChart data={SALES_CHART_DATA} />
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--ct-grey)' }}>Total this week</span>
                  <span style={{ fontWeight: 700, color: 'var(--ct-orange)' }}>
                    {SALES_CHART_DATA.reduce((s, d) => s + d.sales, 0)} tickets
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Recent Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {ORGANISER_EVENTS.map(evt => {
                    const pct = Math.round((evt.ticketsSold / evt.totalTickets) * 100);
                    return (
                      <div key={evt.id} style={{ paddingBottom: 16, borderBottom: '1px solid var(--ct-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 14 }}>{evt.title}</p>
                            <p style={{ fontSize: 12, color: 'var(--ct-grey)' }}>{formatDate(evt.date)}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ct-orange)' }}>
                              {formatKES(evt.revenue)}
                            </p>
                            <span className={`badge ${evt.status === 'completed' ? 'badge-grey' : 'badge-green'}`} style={{ fontSize: 10 }}>
                              {evt.status === 'completed' ? 'Completed' : 'On Sale'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div style={{ height: 4, background: 'var(--ct-dark-4)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct > 90 ? 'var(--ct-success)' : 'var(--ct-orange)', borderRadius: 2 }} />
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--ct-grey)', marginTop: 4 }}>
                            {evt.ticketsSold}/{evt.totalTickets} tickets sold ({pct}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ORGANISER_EVENTS.map(evt => {
                const pct = Math.round((evt.ticketsSold / evt.totalTickets) * 100);
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
                        <p style={{ fontSize: 13, color: 'var(--ct-grey)' }}>{formatDate(evt.date)}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{evt.ticketsSold}</p>
                          <p style={{ fontSize: 12, color: 'var(--ct-grey)' }}>Sold</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ct-orange)' }}>
                            {formatKES(evt.revenue)}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--ct-grey)' }}>Revenue</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{pct}%</p>
                          <p style={{ fontSize: 12, color: 'var(--ct-grey)' }}>Sold out</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-ghost btn-sm" title="View"><Eye size={14} /></button>
                          <button className="btn btn-ghost btn-sm" title="Edit"><Edit3 size={14} /></button>
                          <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--ct-danger)' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 4, background: 'var(--ct-dark-4)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct > 90 ? 'var(--ct-success)' : 'var(--ct-orange)', borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Deep Analytics</h3>
            <p style={{ color: 'var(--ct-grey)', maxWidth: 400, margin: '0 auto 24px' }}>
              Detailed demographics, revenue breakdowns, peak hours, and more — coming soon.
            </p>
            <span className="badge badge-orange">Coming Soon</span>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Payouts</h2>
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, color: 'var(--ct-success)', marginBottom: 8 }}>
                KES 680,000
              </div>
              <p style={{ color: 'var(--ct-grey)', marginBottom: 24 }}>Available balance from completed events</p>
              <button className="btn btn-primary btn-lg">Request Payout</button>
              <p style={{ fontSize: 12, color: 'var(--ct-grey)', marginTop: 12 }}>Processed via M-Pesa or bank within 24 hours</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
