// Mock data — replace with real API calls to your backend

export const CATEGORIES = [
  { id: 'all', label: 'All Events', icon: '🎪' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'church', label: 'Church', icon: '✝️' },
  { id: 'food', label: 'Food & Drink', icon: '🍽️' },
  { id: 'arts', label: 'Arts & Culture', icon: '🎨' },
  { id: 'networking', label: 'Networking', icon: '🤝' },
  { id: 'tech', label: 'Tech', icon: '💻' },
];

export const EVENTS = [
  {
    id: 'evt-001',
    title: 'Carnivore Summer Fest 2025',
    organiser: 'Nairobi Live Events',
    category: 'music',
    date: '2025-08-15',
    time: '18:00',
    venue: 'Carnivore Grounds',
    city: 'Nairobi',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    isFree: false,
    status: 'on_sale',
    tags: ['Live Music', 'Afrobeats', 'Outdoor'],
    tickets: [
      { id: 't1', name: 'Early Bird', price: 1500, available: 200, total: 500 },
      { id: 't2', name: 'Regular', price: 2500, available: 800, total: 1000 },
      { id: 't3', name: 'VIP Table', price: 15000, available: 20, total: 30 },
    ],
    description: 'The biggest outdoor music festival in Nairobi returns! Featuring top Kenyan and international Afrobeats artists across 3 stages.',
    attendees: 1247,
  },
  {
    id: 'evt-002',
    title: 'Churchill Show Live',
    organiser: 'Churchill Productions',
    category: 'comedy',
    date: '2025-07-26',
    time: '19:30',
    venue: 'KICC Auditorium',
    city: 'Nairobi',
    image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=80',
    isFree: false,
    status: 'on_sale',
    tags: ['Comedy', 'Live Show'],
    tickets: [
      { id: 't1', name: 'Standard', price: 1000, available: 500, total: 800 },
      { id: 't2', name: 'Premium', price: 2000, available: 150, total: 200 },
    ],
    description: 'Kenya\'s #1 comedy show live on stage. An unforgettable night of laughter with Churchill and the best comedians in East Africa.',
    attendees: 623,
  },
  {
    id: 'evt-003',
    title: 'Devfest Nairobi 2025',
    organiser: 'GDG Nairobi',
    category: 'tech',
    date: '2025-09-20',
    time: '08:00',
    venue: 'Strathmore University',
    city: 'Nairobi',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    isFree: true,
    status: 'on_sale',
    tags: ['Tech', 'Free', 'Google'],
    tickets: [
      { id: 't1', name: 'General Admission', price: 0, available: 1000, total: 1500 },
    ],
    description: 'East Africa\'s largest Google Developer Festival. Talks, workshops, and networking with 1500+ developers.',
    attendees: 892,
  },
  {
    id: 'evt-004',
    title: 'Blankets & Wine Mombasa',
    organiser: 'Mombasa Events Co.',
    category: 'music',
    date: '2025-08-03',
    time: '14:00',
    venue: 'Mama Ngina Waterfront',
    city: 'Mombasa',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    isFree: false,
    status: 'on_sale',
    tags: ['Music', 'Outdoor', 'Family'],
    tickets: [
      { id: 't1', name: 'Single', price: 1200, available: 300, total: 600 },
      { id: 't2', name: 'Couple', price: 2000, available: 150, total: 250 },
    ],
    description: 'The iconic Blankets & Wine experience comes to the Coast. Bring a blanket, bring friends, and enjoy live music by the ocean.',
    attendees: 445,
  },
  {
    id: 'evt-005',
    title: 'KPL Match Day — Gor Mahia vs AFC',
    organiser: 'Football Kenya Federation',
    category: 'sports',
    date: '2025-07-19',
    time: '15:00',
    venue: 'Nyayo Stadium',
    city: 'Nairobi',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    isFree: false,
    status: 'selling_fast',
    tags: ['Football', 'Derby', 'Sports'],
    tickets: [
      { id: 't1', name: 'Terraces', price: 200, available: 800, total: 5000 },
      { id: 't2', name: 'Upper Deck', price: 500, available: 200, total: 1000 },
      { id: 't3', name: 'VIP Stand', price: 2000, available: 50, total: 200 },
    ],
    description: 'The biggest derby in Kenyan football. Gor Mahia vs AFC Leopards at Nyayo — be part of history.',
    attendees: 3820,
  },
  {
    id: 'evt-006',
    title: 'Sunday Service Experience',
    organiser: 'Mavuno Church',
    category: 'church',
    date: '2025-07-27',
    time: '09:00',
    venue: 'KICC Grounds',
    city: 'Nairobi',
    image: 'https://images.unsplash.com/photo-1477281765962-ef34e8bb0967?w=800&q=80',
    isFree: true,
    status: 'on_sale',
    tags: ['Church', 'Free', 'Worship'],
    tickets: [
      { id: 't1', name: 'General', price: 0, available: 5000, total: 5000 },
    ],
    description: 'A powerful outdoor Sunday experience with live worship, inspiring message, and community.',
    attendees: 2100,
  },
];

export const COMMISSION_RATE = 0.07; // 7%

export const formatKES = (amount) => {
  if (amount === 0) return 'FREE';
  return `KES ${amount.toLocaleString()}`;
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
};

export const getStatusBadge = (status) => {
  const map = {
    on_sale: { label: 'On Sale', class: 'badge-green' },
    selling_fast: { label: 'Selling Fast 🔥', class: 'badge-orange' },
    sold_out: { label: 'Sold Out', class: 'badge-grey' },
    coming_soon: { label: 'Coming Soon', class: 'badge-grey' },
  };
  return map[status] || map.on_sale;
};

// Simulated organiser dashboard data
export const ORGANISER_STATS = {
  totalRevenue: 2847500,
  ticketsSold: 1247,
  activeEvents: 3,
  totalEvents: 8,
  checkInRate: 78.4,
  avgTicketPrice: 2284,
};

export const ORGANISER_EVENTS = [
  {
    id: 'evt-001',
    title: 'Carnivore Summer Fest 2025',
    date: '2025-08-15',
    ticketsSold: 1020,
    totalTickets: 1530,
    revenue: 1925000,
    status: 'on_sale',
  },
  {
    id: 'evt-002',
    title: 'Churchill Show Live',
    date: '2025-07-26',
    ticketsSold: 180,
    totalTickets: 1000,
    revenue: 286000,
    status: 'on_sale',
  },
  {
    id: 'evt-past-1',
    title: 'Nairobi Jazz Night',
    date: '2025-06-10',
    ticketsSold: 340,
    totalTickets: 350,
    revenue: 680000,
    status: 'completed',
  },
];

export const SALES_CHART_DATA = [
  { day: 'Mon', sales: 45 },
  { day: 'Tue', sales: 82 },
  { day: 'Wed', sales: 61 },
  { day: 'Thu', sales: 120 },
  { day: 'Fri', sales: 189 },
  { day: 'Sat', sales: 240 },
  { day: 'Sun', sales: 178 },
];
