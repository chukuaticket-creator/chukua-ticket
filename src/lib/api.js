// ─── API Layer ───────────────────────────────────────────────────
// Every call goes to Supabase. Run supabase-setup.sql first, then deploy the
// create-subaccount and paystack-webhook edge functions.
//
// Supabase is called over its REST endpoints with plain fetch rather than
// @supabase/supabase-js on purpose: adding a dependency from the GitHub web UI
// desyncs package-lock.json and breaks Netlify's `npm ci`. Swap to the SDK later
// from a local clone if you want realtime.

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

export const SUPABASE_READY = Boolean(SUPABASE_URL && SUPABASE_KEY);

const SESSION_KEY = 'ct_session';

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

// Supabase access tokens expire after ~1 hour. The refresh token is what lets
// us renew silently — storing only the access token is why sessions were
// dropping mid-flow.
export function saveSession(data) {
  if (!data?.access_token) return null;
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || null,
    expires_at: Date.now() + ((data.expires_in ?? 3600) * 1000),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('ct_token', session.access_token); // legacy readers
  } catch {}
  return session;
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('ct_token');
  } catch {}
}

export function authToken() {
  const s = getSession();
  if (s?.access_token) return s.access_token;
  try { return localStorage.getItem('ct_token'); } catch { return null; }
}

// Returns a token that is valid right now, renewing it if it's about to lapse.
let refreshInFlight = null;
async function ensureToken() {
  const s = getSession();
  if (!s?.access_token) return authToken();

  const stillFresh = s.expires_at && Date.now() < s.expires_at - 60_000;
  if (stillFresh || !s.refresh_token) return s.access_token;

  // Collapse concurrent refreshes — the dashboard fires four calls at once.
  if (!refreshInFlight) {
    refreshInFlight = sbRequest('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    }).then(data => {
      refreshInFlight = null;
      if (data?.error || !data?.access_token) {
        clearSession();
        return null;
      }
      saveSession(data);
      return data.access_token;
    });
  }
  return refreshInFlight;
}

// Unlike `request` below, this surfaces the real error text — auth needs to tell
// the person what actually went wrong.
async function sbRequest(path, opts = {}) {
  if (!SUPABASE_READY) {
    return { error: 'Sign-in is not configured yet. Please try again later.' };
  }
  try {
    const { auth, headers: extraHeaders, ...rest } = opts;
    const headers = {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    // Resolved here, after any refresh, so a renewed token is always the one sent.
    if (auth) {
      const token = await ensureToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${SUPABASE_URL}${path}`, { ...rest, headers });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      return {
        error: data?.msg || data?.error_description || data?.message
          || data?.hint || `Request failed (${res.status})`,
      };
    }
    return data;
  } catch (err) {
    return { error: err.message || 'Network error. Check your connection.' };
  }
}

// ─── Shared helpers ─────────────────────────────────────────────
// The signed-in user's id, needed to stamp organiser_id on inserts.
export async function getAuthUserId() {
  const token = authToken();
  if (!token) return null;
  const data = await sbRequest('/auth/v1/user', { auth: true });
  return data?.error ? null : data?.id || null;
}

// Supabase rows are snake_case; the UI is camelCase. One translation point.
function mapTicket(t) {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    price: t.price ?? 0,
    total: t.quantity ?? 0,
    available: t.available ?? 0,
  };
}

function mapEvent(e) {
  if (!e) return null;
  const tickets = (e.ticket_types || []).map(mapTicket);
  const sold = tickets.reduce((n, t) => n + (t.total - t.available), 0);
  const revenue = tickets.reduce((n, t) => n + (t.total - t.available) * t.price, 0);
  return {
    id: e.id,
    organiserId: e.organiser_id,
    title: e.title,
    description: e.description,
    category: e.category,
    date: e.date,
    time: e.time,
    endDate: e.end_date,
    endTime: e.end_time,
    venue: e.venue,
    address: e.address,
    city: e.city,
    lat: e.lat,
    lng: e.lng,
    image: e.image,
    isFree: e.is_free,
    isPublic: e.is_public,
    status: e.status,
    maxAttendees: e.max_attendees,
    website: e.website,
    tags: e.tags || [],
    subaccountCode: e.subaccount_code,
    organiser: e.profiles?.org_name || e.profiles?.name || '',
    tickets,
    ticketsSold: sold,
    attendees: sold,   // "X attending" on the event page
    totalTickets: tickets.reduce((n, t) => n + t.total, 0),
    revenue,
    organiserReceives: revenue - Math.round(revenue * COMMISSION),
  };
}

const EVENT_SELECT = '*,ticket_types(*)';

// ─── Events ─────────────────────────────────────────────────────
export async function getEvents(params = {}) {
  const filters = [`select=${EVENT_SELECT}`, 'is_public=eq.true', 'order=date.asc'];
  if (params.category && params.category !== 'all') filters.push(`category=eq.${params.category}`);
  if (params.city) filters.push(`city=eq.${params.city}`);
  if (params.free) filters.push('is_free=eq.true');
  if (params.limit) filters.push(`limit=${params.limit}`);
  const data = await sbRequest(`/rest/v1/events?${filters.join('&')}`, { auth: true });
  if (!data || data.error || !Array.isArray(data)) return [];
  return data.map(mapEvent);
}

export async function getEvent(id) {
  const data = await sbRequest(
    `/rest/v1/events?select=${EVENT_SELECT}&id=eq.${id}&limit=1`,
    { auth: true },
  );
  if (!data || data.error || !Array.isArray(data)) return null;
  return data.length ? mapEvent(data[0]) : null;
}

export async function createEvent(payload) {
  const organiserId = await getAuthUserId();
  if (!organiserId) return { error: 'Please sign in again to publish this event.' };

  // Carry the organiser's Paystack subaccount onto the event so checkout can
  // split each sale without another lookup.
  const profile = await getProfile();

  const row = {
    organiser_id: organiserId,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    date: payload.date || null,
    time: payload.time || null,
    end_date: payload.endDate || null,
    end_time: payload.endTime || null,
    venue: payload.venue,
    address: payload.address,
    city: payload.city,
    image: payload.image || null,
    is_free: Boolean(payload.isFree),
    is_public: payload.isPublic !== false,
    max_attendees: payload.maxAttendees ?? null,
    website: payload.website || null,
    tags: payload.tags || [],
    subaccount_code: profile?.subaccountCode || null,
    status: 'on_sale',
  };

  const created = await sbRequest('/rest/v1/events', {
    method: 'POST',
    auth: true,
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  if (created?.error) return created;

  const event = Array.isArray(created) ? created[0] : created;
  if (!event?.id) return { error: 'The event could not be saved. Please try again.' };

  const tiers = (payload.tickets || []).map(t => ({
    event_id: event.id,
    name: t.name,
    description: t.description || null,
    price: Number(t.price) || 0,
    quantity: Number(t.quantity) || 0,
    available: Number(t.available ?? t.quantity) || 0,
  }));

  if (tiers.length) {
    const tix = await sbRequest('/rest/v1/ticket_types', {
      method: 'POST',
      auth: true,
    headers: { Prefer: 'return=representation' },
      body: JSON.stringify(tiers),
    });
    // The event exists but has no tiers — say so rather than reporting success.
    if (tix?.error) {
      return { error: 'Event saved, but the ticket tiers failed. Edit the event to add them.' };
    }
  }

  return { event: mapEvent({ ...event, ticket_types: [] }) };
}

export async function getPublicMapEvents() {
  const data = await sbRequest(
    `/rest/v1/events?select=${EVENT_SELECT}&is_public=eq.true&lat=not.is.null&lng=not.is.null`,
    { auth: true },
  );
  if (!data || data.error || !Array.isArray(data)) return [];
  return data.map(mapEvent);
}

// ─── Tickets ────────────────────────────────────────────────────
// Written as 'pending' BEFORE Paystack opens, so the webhook always has a row
// to mark paid. Goes through the create_order function rather than a direct
// insert: the database prices the order from ticket_types, so the amount can't
// be altered in the browser.
export async function createOrder({ eventId, reference, buyer, items }) {
  const data = await sbRequest('/rest/v1/rpc/create_order', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({
      p_event_id: eventId,
      p_reference: reference,
      p_buyer_name: buyer.name,
      p_buyer_email: buyer.email,
      p_buyer_phone: buyer.phone || null,
      p_items: (items || []).map(i => ({ ticket_type_id: i.ticketId, quantity: i.qty })),
    }),
  });

  if (data?.error) return data;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.order_id) return { error: 'We could not start your order. Please try again.' };

  return {
    orderId: row.order_id,
    reference,
    // Authoritative amounts — charge these, not anything computed client-side.
    subtotal: row.subtotal,
    commission: row.commission,
    organiserReceives: row.organiser_receives,
    subaccountCode: row.subaccount_code,
  };
}

// Free events only. The database refuses this for any order with a subtotal,
// so it cannot be used to mark a real purchase as paid.
export async function completeFreeOrder(reference) {
  const res = await sbRequest('/rest/v1/rpc/complete_free_order', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ p_reference: reference }),
  });
  return res?.error ? res : { ok: true };
}

// Kept for older callers; paid orders are completed by the webhook.
export async function purchaseTicket(payload) {
  return createOrder(payload);
}

export async function verifyTicket(ref) {
  const data = await sbRequest('/rest/v1/rpc/verify_ticket', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ p_reference: ref }),
  });
  if (!data || data.error) return { valid: false, error: data?.error || 'Ticket not found.' };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { valid: false, error: 'Ticket not found.' };
  return {
    valid: row.valid && !row.already_used,
    status: row.status,
    buyerName: row.buyer_name,
    eventTitle: row.event_title,
    alreadyUsed: row.already_used,
  };
}

// ─── Organiser ──────────────────────────────────────────────────
export async function getOrganiserStats() {
  const events = await getOrganiserEvents();
  if (!events.length) {
    return { organiserRevenue: 0, ticketsSold: 0, activeEvents: 0, totalEvents: 0, checkInRate: null, salesThisWeek: [] };
  }
  const ticketsSold = events.reduce((n, e) => n + e.ticketsSold, 0);
  const gross = events.reduce((n, e) => n + e.revenue, 0);
  return {
    // Net of the 7%, because this is what actually reaches the organiser.
    organiserRevenue: gross - Math.round(gross * COMMISSION),
    grossRevenue: gross,
    ticketsSold,
    activeEvents: events.filter(e => e.status === 'on_sale').length,
    totalEvents: events.length,
    // Both need the orders table — left null/empty so the UI shows its
    // empty state instead of inventing a number.
    checkInRate: null,
    salesThisWeek: [],
  };
}

export async function getOrganiserEvents() {
  const organiserId = await getAuthUserId();
  if (!organiserId) return [];
  const data = await sbRequest(
    `/rest/v1/events?select=${EVENT_SELECT}&organiser_id=eq.${organiserId}&order=date.desc`,
    { auth: true },
  );
  if (!data || data.error || !Array.isArray(data)) return [];
  return data.map(mapEvent);
}

// Settlement history. Payouts are automatic (Paystack splits each sale and
// settles the organiser's subaccount on T+2), so this is a record, not a queue.
export async function getOrganiserPayouts() {
  const organiserId = await getAuthUserId();
  if (!organiserId) return [];
  const data = await sbRequest(
    `/rest/v1/orders?select=id,paystack_ref,organiser_receives,paid_at,status,events(title)`
    + `&organiser_id=eq.${organiserId}&status=eq.paid&order=paid_at.desc`,
    { auth: true },
  );
  if (!data || data.error || !Array.isArray(data)) return [];
  return data.map(o => ({
    id: o.id,
    reference: o.paystack_ref,
    amount: o.organiser_receives,
    date: o.paid_at,
    status: 'settled',
    eventTitle: o.events?.title || 'Ticket sales',
  }));
}

// ─── Auth (live: Supabase GoTrue) ───────────────────────────────
function shapeSession(data) {
  const meta = data?.user?.user_metadata || {};
  return {
    token: data?.access_token || null,
    user: data?.user ? {
      id: data.user.id,
      email: data.user.email,
      name: meta.name || '',
      phone: meta.phone || '',
      role: meta.role || 'attendee',
      orgName: meta.org_name || '',
    } : null,
  };
}

export async function login(email, password) {
  const data = await sbRequest('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.error) return data;
  saveSession(data);
  return shapeSession(data);
}

export async function register({ name, email, phone, password, role, orgName }) {
  const data = await sbRequest('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      // Goes to raw_user_meta_data; the handle_new_user trigger copies it into profiles.
      data: { name, phone: phone || null, role: role || 'attendee', org_name: orgName || null },
    }),
  });
  if (data?.error) return data;
  saveSession(data);
  const session = shapeSession(data);
  // With "Confirm email" enabled, Supabase returns the user but no token until
  // they click the link. The UI already tells them to check their inbox.
  return { ...session, needsEmailConfirmation: !session.token };
}

export async function logout() {
  const token = authToken();
  if (token) {
    await sbRequest('/auth/v1/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  clearSession();
}

// ─── Profile & payouts ──────────────────────────────────────────
export async function getProfile() {
  const token = authToken();
  if (!token) return null;
  // RLS limits this to the caller's own row, so the first result is theirs.
  const data = await sbRequest('/rest/v1/profiles?select=*', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!data || data.error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    orgName: row.org_name,
    subaccountCode: row.subaccount_code,
    settlementType: row.settlement_type,
    payoutActivated: row.payout_activated,
  };
}

// Creates the organiser's Paystack subaccount server-side (the secret key must
// never reach the browser). Returns { subaccount_code } on success.
export async function createSubaccount(payload) {
  const token = authToken();
  if (!token) return { error: 'Please sign in again.' };
  // Edge function: the Paystack secret key must never reach the browser.
  return sbRequest('/functions/v1/create-subaccount', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}

// ─── Reactions ──────────────────────────────────────────────────
export async function getReactions(eventId) {
  const data = await sbRequest(`/rest/v1/reactions?select=emoji,count&event_id=eq.${eventId}`, { auth: true });
  if (!data || data.error || !Array.isArray(data)) return {};
  return Object.fromEntries(data.map(r => [r.emoji, r.count]));
}

export async function sendReaction(eventId, emoji) {
  return sbRequest('/rest/v1/rpc/add_reaction', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ p_event_id: eventId, p_emoji: emoji }),
  });
}

// ─── Team Chat ──────────────────────────────────────────────────
export async function getMessages(eventId) {
  const data = await sbRequest(
    `/rest/v1/messages?select=*&event_id=eq.${eventId}&order=created_at.asc`,
    { auth: true },
  );
  if (!data || data.error || !Array.isArray(data)) return [];
  return data.map(m => ({
    id: m.id,
    text: m.text,
    senderName: m.sender_name,
    senderRole: m.sender_role,
    createdAt: m.created_at,
  }));
}

export async function sendMessage(eventId, text, sender = {}) {
  return sbRequest('/rest/v1/messages', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({
      event_id: eventId,
      text,
      sender_name: sender.name || null,
      sender_role: sender.role || null,
    }),
  });
}

// ─── Paystack ───────────────────────────────────────────────────
// Single implementation lives in ./paystack.js. Re-exported here so pages can
// keep importing everything from one module.
export { openPaystack, generateRef, verifyPayment } from './paystack';

export const COMMISSION = 0.07;

// Organiser pays the 7% — attendee pays the exact ticket price.
// `total` is what the attendee is charged. `organiserReceives` is the payout.
export function calcFees(subtotal) {
  const commission = Math.round(subtotal * COMMISSION);
  const organiserReceives = subtotal - commission;
  return { subtotal, commission, total: subtotal, organiserReceives };
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
