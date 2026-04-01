# Chukua Ticket — Developer Guide

## Project Structure

```
chukua-ticket/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx        ← Sticky nav with search
│   │   │   └── Footer.jsx        ← Full footer with links
│   │   └── ui/
│   │       └── EventCard.jsx     ← Reusable event card
│   ├── lib/
│   │   ├── data.js               ← Mock data (replace with API calls)
│   │   └── paystack.js           ← Paystack payment integration
│   ├── pages/
│   │   ├── Landing.jsx           ← Homepage / marketing
│   │   ├── Events.jsx            ← Event discovery + filters
│   │   ├── EventDetail.jsx       ← Single event + ticket checkout
│   │   ├── OrganiserDashboard.jsx← Organiser control panel
│   │   ├── CreateEvent.jsx       ← 3-step event creation wizard
│   │   ├── Auth.jsx              ← Login + Register pages
│   │   └── HowItWorks.jsx        ← How it works + FAQ + 404
│   ├── App.jsx                   ← Routes
│   ├── main.jsx                  ← Entry point
│   └── index.css                 ← Global design system
├── index.html
├── vite.config.js
├── netlify.toml                  ← Netlify SPA routing config
├── .env.example                  ← Environment variable template
└── package.json
```

---

## ─── STEP 1: Local Setup ───────────────────────────────────────

```bash
# 1. Install Node.js (if not installed)
# Download from https://nodejs.org (LTS version)

# 2. Install dependencies
cd chukua-ticket
npm install

# 3. Copy and fill environment variables
cp .env.example .env
# Edit .env — add your Paystack public key

# 4. Run development server
npm run dev
# Opens at http://localhost:5173
```

---

## ─── STEP 2: Paystack Setup ───────────────────────────────────

1. Go to https://dashboard.paystack.com
2. Create a free account (Kenya — KES supported ✅)
3. Settings → API Keys → copy your **Public Key**
4. Paste into `.env`: `VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx`
5. For Netlify deployment, also add this as an environment variable in Netlify dashboard

**IMPORTANT — Server-side verification:**
Never trust client-side payment confirmation in production.
You MUST build a backend endpoint to verify payments:
```
POST https://api.paystack.co/transaction/verify/:reference
Authorization: Bearer YOUR_SECRET_KEY
```
Your secret key MUST only exist on your backend, never the frontend.

---

## ─── STEP 3: GitHub Repository ──────────────────────────────

```bash
# In your project folder:
git init
git add .
git commit -m "Initial commit — Chukua Ticket v1"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/chukua-ticket.git
git push -u origin main
```

---

## ─── STEP 4: Deploy to Netlify (Free) ────────────────────────

### Option A — Netlify UI (Easiest)
1. Go to https://netlify.com → Sign up free
2. Click "Add new site" → "Import from Git"
3. Connect your GitHub account
4. Select the `chukua-ticket` repository
5. Build settings (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables:
   - `VITE_PAYSTACK_PUBLIC_KEY` → your key
7. Click "Deploy site"
8. Your site is live at `something.netlify.app`

### Option B — Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Custom Domain (chukuaticket.co.ke)
1. Buy domain from Kenic.co.ke or Kenya Domains
2. In Netlify: Site settings → Domain management → Add custom domain
3. Update your domain's DNS nameservers to Netlify's
4. SSL certificate is issued automatically (free)

---

## ─── STEP 5: Replace Mock Data with Real API ─────────────────

The file `src/lib/data.js` contains mock data.
When you build your backend, replace the data with API calls.

### Backend options (all free tiers available):
- **Supabase** (recommended) — Postgres + Auth + Storage, generous free tier
- **Firebase** — Firestore + Auth
- **PocketBase** — Self-hosted, one binary
- **Railway** — Deploy a Node.js/Express backend free

### Example API call pattern:
```js
// Replace mock data in Events.jsx with:
const [events, setEvents] = useState([]);

useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/events`)
    .then(r => r.json())
    .then(data => setEvents(data));
}, []);
```

---

## ─── STEP 6: QR Code Ticket Scanning ────────────────────────

For gate scanning, you need:
1. A backend that stores ticket purchases with unique refs
2. A QR code generator (use `qrcode` npm package)
3. A scanner page (use `html5-qrcode` npm package)

```bash
npm install qrcode html5-qrcode
```

The scanner reads the QR, calls your API to verify, and marks as used.
You can host a simple `/scan` route for gate staff on their phones.

---

## ─── STACK SUMMARY ──────────────────────────────────────────

| Layer         | Tool           | Cost  |
|---------------|----------------|-------|
| Frontend      | React + Vite   | Free  |
| Hosting       | Netlify        | Free  |
| Source        | GitHub         | Free  |
| Payments      | Paystack       | 1.5%+KES100 per txn |
| Database      | Supabase       | Free tier |
| Auth          | Supabase Auth  | Free  |
| Images        | Cloudinary     | Free tier |
| Domain        | Kenic.co.ke    | ~KES 1,200/yr |

**Total upfront cost to launch: ~KES 1,200/year (just domain)**

---

## ─── WHAT TO BUILD NEXT ─────────────────────────────────────

Phase 1 (Launch MVP):
- [ ] Backend API (Supabase recommended)
- [ ] Real auth (connect to Supabase Auth)
- [ ] Event creation saves to database
- [ ] Paystack webhook to confirm payments
- [ ] Email tickets via Resend (free 3000 emails/mo)
- [ ] QR scanner page for gate staff

Phase 2 (Growth):
- [ ] USSD/SMS ticketing via Africa's Talking
- [ ] Organiser analytics deep dive
- [ ] Event share to WhatsApp / social
- [ ] Attendee profiles & saved events

Phase 3 (Scale):
- [ ] Live crowd map (attendee check-in heatmap)
- [ ] AI dynamic pricing suggestions
- [ ] White-label for venues/stadiums
- [ ] Uganda, Tanzania, Rwanda expansion
