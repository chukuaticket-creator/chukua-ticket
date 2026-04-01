import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Image, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const STEPS = ['Event Details', 'Tickets', 'Media & Review'];

const CATEGORIES_LIST = [
  { id: 'music', label: '🎵 Music' },
  { id: 'comedy', label: '😂 Comedy' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'church', label: '✝️ Church / Faith' },
  { id: 'food', label: '🍽️ Food & Drink' },
  { id: 'arts', label: '🎨 Arts & Culture' },
  { id: 'networking', label: '🤝 Networking' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'other', label: '🎪 Other' },
];

const defaultTicket = () => ({ id: Date.now(), name: '', price: '', quantity: '', description: '' });

export default function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    endDate: '',
    time: '',
    endTime: '',
    venue: '',
    address: '',
    city: 'Nairobi',
    isFree: false,
    isPublic: true,
    maxAttendees: '',
    image: '',
    website: '',
    tags: '',
  });

  const [tickets, setTickets] = useState([defaultTicket()]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const addTicket = () => setTickets(prev => [...prev, defaultTicket()]);
  const removeTicket = (id) => setTickets(prev => prev.filter(t => t.id !== id));
  const updateTicket = (id, k, v) => setTickets(prev => prev.map(t => t.id === id ? { ...t, [k]: v } : t));

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };
  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // TODO: POST to your backend API
    // const payload = { ...form, tickets };
    // await fetch('/api/events', { method:'POST', body: JSON.stringify(payload), headers: {'Content-Type':'application/json'} });
    await new Promise(r => setTimeout(r, 1800)); // simulate
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <CheckCircle2 size={52} style={{ color: 'var(--ct-success)', margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, marginBottom: 8 }}>Event Created!</h2>
          <p style={{ color: 'var(--ct-grey)', marginBottom: 8 }}>{form.title}</p>
          <p style={{ color: 'var(--ct-grey-light)', marginBottom: 32, fontSize: 14 }}>
            Your event is live and accepting tickets. Share the link to start selling.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => { setDone(false); setStep(0); setForm({ title:'',category:'',description:'',date:'',endDate:'',time:'',endTime:'',venue:'',address:'',city:'Nairobi',isFree:false,isPublic:true,maxAttendees:'',image:'',website:'',tags:'' }); setTickets([defaultTicket()]); }}>
              Create Another
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/organiser')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ background: 'var(--ct-dark)', borderBottom: '1px solid var(--ct-border)', padding: '32px 0 24px' }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>
            Create New Event
          </h1>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i < step ? 'var(--ct-success)' : i === step ? 'var(--ct-orange)' : 'var(--ct-dark-4)',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)',
                    flexShrink: 0, transition: 'background 0.3s',
                  }}>
                    {i < step ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: i === step ? 'var(--ct-white)' : 'var(--ct-grey)', whiteSpace: 'nowrap' }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: i < step ? 'var(--ct-success)' : 'var(--ct-border)', margin: '0 16px', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 780, padding: '40px 24px 80px' }}>

        {/* ─── STEP 1: Event Details ─── */}
        {step === 0 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Nairobi Jazz Night 2025"
                  maxLength={100}
                />
                <span style={{ fontSize: 11, color: 'var(--ct-grey)' }}>{form.title.length}/100</span>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {CATEGORIES_LIST.map(c => (
                    <button key={c.id} type="button"
                      onClick={() => set('category', c.id)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, border: '1px solid',
                        borderColor: form.category === c.id ? 'var(--ct-orange)' : 'var(--ct-border)',
                        background: form.category === c.id ? 'var(--ct-orange-dim)' : 'var(--ct-dark-2)',
                        color: form.category === c.id ? 'var(--ct-orange)' : 'var(--ct-grey-light)',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                        textAlign: 'left',
                      }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Tell attendees what makes your event special..."
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue Name *</label>
                <input value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Carnivore Grounds" />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select value={form.city} onChange={e => set('city', e.target.value)}>
                    {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Other'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Address</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address or directions" />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Max Attendees (optional)</label>
                  <input type="number" value={form.maxAttendees} onChange={e => set('maxAttendees', e.target.value)} placeholder="Leave blank for unlimited" min={1} />
                </div>
                <div className="form-group">
                  <label className="form-label">Website / Social Link</label>
                  <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. Afrobeats, Outdoor, Family" />
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isPublic} onChange={e => set('isPublic', e.target.checked)} style={{ width: 18, height: 18 }} />
                  <span style={{ fontSize: 14, color: 'var(--ct-grey-light)' }}>Public event (visible on Chukua Ticket)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Tickets ─── */}
        {step === 1 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>Ticket Types</h2>
                <p style={{ color: 'var(--ct-grey)', fontSize: 14, marginTop: 4 }}>Add one or more ticket tiers. Set price to 0 for free registration.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={addTicket} style={{ display: 'flex', gap: 6 }}>
                <Plus size={14} /> Add Tier
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {tickets.map((ticket, i) => (
                <div key={ticket.id} className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                      color: 'var(--ct-orange)',
                    }}>
                      Ticket Tier {i + 1}
                    </span>
                    {tickets.length > 1 && (
                      <button
                        onClick={() => removeTicket(ticket.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--ct-danger)', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Ticket Name *</label>
                      <input
                        value={ticket.name}
                        onChange={e => updateTicket(ticket.id, 'name', e.target.value)}
                        placeholder="e.g. Early Bird, VIP, Regular"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price (KES) *</label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={e => updateTicket(ticket.id, 'price', e.target.value)}
                        placeholder="0 = Free"
                        min={0}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity *</label>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={e => updateTicket(ticket.id, 'quantity', e.target.value)}
                        placeholder="e.g. 500"
                        min={1}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Revenue (est.)</label>
                      <input
                        readOnly
                        value={ticket.price && ticket.quantity
                          ? `KES ${(ticket.price * ticket.quantity).toLocaleString()}`
                          : '—'}
                        style={{ background: 'var(--ct-dark-3)', color: 'var(--ct-orange)', cursor: 'default' }}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Description (optional)</label>
                      <input
                        value={ticket.description}
                        onChange={e => updateTicket(ticket.id, 'description', e.target.value)}
                        placeholder="e.g. Includes access to VIP lounge and 2 drinks"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue summary */}
            <div style={{
              background: 'var(--ct-dark-2)', border: '1px solid var(--ct-border)',
              borderRadius: 14, padding: 20,
            }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                Revenue Estimate
              </h4>
              {tickets.map(t => t.name && t.price && t.quantity ? (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--ct-grey)' }}>{t.name} × {Number(t.quantity).toLocaleString()}</span>
                  <span>KES {(t.price * t.quantity).toLocaleString()}</span>
                </div>
              ) : null)}
              <div className="divider" style={{ margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--ct-grey)' }}>Gross revenue</span>
                <span style={{ fontWeight: 600 }}>
                  KES {tickets.reduce((s, t) => s + (Number(t.price) * Number(t.quantity) || 0), 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--ct-grey)' }}>Platform fee (7% — paid by attendees)</span>
                <span style={{ color: 'var(--ct-orange)' }}>
                  KES {Math.round(tickets.reduce((s, t) => s + (Number(t.price) * Number(t.quantity) || 0), 0) * 0.07).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                <span>You receive</span>
                <span style={{ color: 'var(--ct-success)' }}>
                  KES {tickets.reduce((s, t) => s + (Number(t.price) * Number(t.quantity) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Media & Review ─── */}
        {step === 2 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="form-group">
                <label className="form-label">Event Cover Image URL</label>
                <input
                  value={form.image}
                  onChange={e => set('image', e.target.value)}
                  placeholder="https://your-image-url.com/photo.jpg"
                />
                {form.image && (
                  <img src={form.image} alt="Preview" style={{ marginTop: 12, borderRadius: 12, maxHeight: 200, objectFit: 'cover', width: '100%' }}
                    onError={e => e.target.style.display = 'none'} />
                )}
                {!form.image && (
                  <div style={{
                    marginTop: 12, border: '2px dashed var(--ct-border)', borderRadius: 12,
                    padding: 32, textAlign: 'center', color: 'var(--ct-grey)',
                  }}>
                    <Image size={32} style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13 }}>Paste an image URL above, or use Unsplash/Cloudinary for hosting</p>
                  </div>
                )}
              </div>

              {/* Review */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Review your event</h3>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
                    {[
                      ['Title', form.title || '—'],
                      ['Category', form.category || '—'],
                      ['Date', form.date ? `${form.date} at ${form.time}` : '—'],
                      ['Venue', form.venue ? `${form.venue}, ${form.city}` : '—'],
                      ['Ticket tiers', tickets.filter(t => t.name).length],
                      ['Total tickets', tickets.reduce((s, t) => s + (Number(t.quantity) || 0), 0).toLocaleString()],
                      ['Visibility', form.isPublic ? 'Public' : 'Private'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p style={{ fontSize: 11, color: 'var(--ct-grey)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</p>
                        <p style={{ fontWeight: 600 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,92,0,0.08)', border: '1px solid rgba(255,92,0,0.2)',
                borderRadius: 12, padding: 16, fontSize: 13, color: 'var(--ct-grey-light)', lineHeight: 1.6,
              }}>
                ℹ️ By creating this event you agree to Chukua Ticket's Terms of Service. Your 7% platform fee will be added to attendee checkout. You receive 100% of the base ticket price within 24hrs of event completion.
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <button
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.4 : 1, display: 'flex', gap: 8 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary btn-lg" onClick={nextStep} style={{ display: 'flex', gap: 8 }}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting} style={{ display: 'flex', gap: 8 }}>
              {submitting ? <><span className="spinner" /> Publishing...</> : <>🚀 Publish Event</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
