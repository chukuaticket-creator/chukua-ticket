// ─── API Layer ───────────────────────────────────────────────────
// All data comes from your backend. Set VITE_API_URL in .env
// For now, falls back to empty arrays so UI shows empty states.

const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, opts = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.warn(`API ${path} failed:`, err.message);
    return null;
  }
}

// ─── Events ─────────────────────────────────────────────────────
export async function getEvents(params = {}) {
  const q = new URLSearchParams(params).toString();
  const data = await request(`/api/events${q ? '?' + q : ''}`);
  return data?.events || [];
}

export async function getEvent(id) {
  const data = await request(`/api/events/${id}`);
  return data?.event || null;
}

export async function createEvent(payload) {
  return request('/api/events', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getPublicMapEvents() {
  // Returns events with lat/lng for the map
  const data = await request('/api/events/map');
  return data?.events || [];
}

// ─── Tickets ────────────────────────────────────────────────────
export async function purchaseTicket(payload) {
  return request('/api/tickets/purchase', { method: 'POST', body: JSON.stringify(payload) });
}

export async function verifyTicket(ref) {
  return request(`/api/tickets/verify/${ref}`);
}

// ─── Organiser ──────────────────────────────────────────────────
export async function getOrganiserStats() {
  const data = await request('/api/organiser/stats');
  return data || null;
}

export async function getOrganiserEvents() {
  const data = await request('/api/organiser/events');
  return data?.events || [];
}

// ─── Auth ───────────────────────────────────────────────────────
export async function login(email, password) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function register(payload) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

// ─── Reactions ──────────────────────────────────────────────────
export async function getReactions(eventId) {
  const data = await request(`/api/events/${eventId}/reactions`);
  return data?.reactions || {};
}

export async function sendReaction(eventId, emoji) {
  return request(`/api/events/${eventId}/reactions`, { method: 'POST', body: JSON.stringify({ emoji }) });
}

// ─── Team Chat ──────────────────────────────────────────────────
export async function getMessages(eventId) {
  const data = await request(`/api/events/${eventId}/messages`);
  return data?.messages || [];
}

export async function sendMessage(eventId, text) {
  return request(`/api/events/${eventId}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
}

// ─── Paystack ───────────────────────────────────────────────────
export const COMMISSION = 0.07;

export function calcFees(subtotal) {
  const commission = Math.round(subtotal * COMMISSION);
  return { subtotal, commission, total: subtotal + commission };
}

export function formatKES(n) {
  if (n === 0) return 'FREE';
  return `KES ${Number(n).toLocaleString()}`;
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-KE', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function generateRef() {
  return `CT-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
}

export function openPaystack({ email, amountKES, reference, eventTitle, onSuccess, onClose }) {
  const load = () => {
    const h = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_YOUR_KEY',
      email, amount: amountKES * 100, currency: 'KES', ref: reference,
      metadata: { custom_fields: [{ display_name: 'Event', variable_name: 'event', value: eventTitle }] },
      callback: onSuccess,
      onClose,
    });
    h.openIframe();
  };
  if (window.PaystackPop) return load();
  const s = document.createElement('script');
  s.src = 'https://js.paystack.co/v1/inline.js';
  s.onload = load;
  document.head.appendChild(s);
}

export const CATEGORIES = [
  { id: 'all',        label: 'All Events',    icon: '🎪' },
  { id: 'music',      label: 'Music',         icon: '🎵' },
  { id: 'comedy',     label: 'Comedy',        icon: '😂' },
  { id: 'sports',     label: 'Sports',        icon: '⚽' },
  { id: 'church',     label: 'Church',        icon: '✝️' },
  { id: 'food',       label: 'Food & Drink',  icon: '🍽️' },
  { id: 'arts',       label: 'Arts',          icon: '🎨' },
  { id: 'networking', label: 'Networking',    icon: '🤝' },
  { id: 'tech',       label: 'Tech',          icon: '💻' },
];
