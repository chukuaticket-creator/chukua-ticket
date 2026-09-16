// netlify/edge-functions/event-meta.js
//
// WhatsApp, Facebook, X and iMessage crawlers do not run JavaScript, so meta
// tags set by React are never seen — every event link previews as the generic
// site card. This runs at the edge, fetches the event, and rewrites the tags in
// index.html before the crawler receives it. Real visitors get the same HTML
// and the React app boots as normal.
//
// Wire it up in netlify.toml:
//
//   [[edge_functions]]
//     function = "event-meta"
//     path = "/events/*"

const SITE = 'https://chukuaticket.com';
const FALLBACK_IMAGE = 'https://pub-6e116d83d30d40c7b5583e078cd66cdf.r2.dev/Chukua_Ticket_Logo_2.png';

// Never interpolate raw database text into HTML.
const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-KE', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return '';
  }
}

function money(n) {
  if (n === 0) return 'Free';
  return `From KES ${Number(n).toLocaleString()}`;
}

export default async (request, context) => {
  const response = await context.next();

  // Only rewrite HTML documents; leave assets and JSON alone.
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  const url = new URL(request.url);
  const id = url.pathname.split('/').filter(Boolean).pop();
  if (!id || !UUID.test(id)) return response;

  const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
  const SUPABASE_KEY = Deno.env.get('VITE_SUPABASE_KEY');
  if (!SUPABASE_URL || !SUPABASE_KEY) return response;

  let event = null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/events`
      + `?select=title,description,image,date,time,venue,city,is_free,is_public,ticket_types(price)`
      + `&id=eq.${id}&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    if (res.ok) {
      const rows = await res.json();
      event = Array.isArray(rows) ? rows[0] : null;
    }
  } catch {
    // Network trouble at the edge shouldn't break the page.
    return response;
  }

  // Unknown or private events keep the default site card.
  if (!event || event.is_public === false) return response;

  const prices = (event.ticket_types || []).map(t => t.price ?? 0);
  const lowest = prices.length ? Math.min(...prices) : null;

  const title = `${event.title} · Chukua Ticket`;
  const where = [event.venue, event.city].filter(Boolean).join(', ');
  const when = [formatDate(event.date), event.time].filter(Boolean).join(' at ');

  // Built from real fields so the preview says something useful even when the
  // organiser wrote no description.
  const description = [
    when,
    where,
    event.is_free ? 'Free entry' : (lowest !== null ? money(lowest) : null),
  ].filter(Boolean).join(' · ')
    || (event.description || '').slice(0, 160);

  const image = event.image || FALLBACK_IMAGE;
  const canonical = `${SITE}/events/${id}`;

  let html = await response.text();

  // Drop the site-wide tags so crawlers don't see two of everything.
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta[^>]+(property|name)=["'](og:[^"']+|twitter:[^"']+|description)["'][^>]*>/gi, '');

  const tags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(canonical)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Chukua Ticket" />
    <meta property="og:title" content="${esc(event.title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:image:alt" content="${esc(event.title)}" />
    <meta property="og:url" content="${esc(canonical)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(event.title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
  `;

  html = html.replace(/<\/head>/i, `${tags}</head>`);

  const headers = new Headers(response.headers);
  headers.delete('content-length'); // body length changed
  headers.set('cache-control', 'public, max-age=0, must-revalidate');

  return new Response(html, { status: response.status, headers });
};
