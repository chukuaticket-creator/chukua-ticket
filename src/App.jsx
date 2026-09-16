import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { AuthProvider, useAuth, AUTH_ENFORCED } from './lib/auth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventMap from './pages/EventMap';
import OrganiserDashboard from './pages/OrganiserDashboard';
import CreateEvent from './pages/CreateEvent';
import PayoutSetup from './pages/PayoutSetup';
import { Login, Register } from './pages/Auth';
import { HowItWorks, NotFound } from './pages/HowItWorks';

const NO_NAV    = ['/login', '/register'];
const NO_FOOTER = ['/login', '/register', '/organiser', '/map'];

// Gate organiser routes. While no backend is configured AUTH_ENFORCED is false
// and this is a pass-through, so the live site keeps working.
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!AUTH_ENFORCED) return children;
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <span className="spinner" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function Layout() {
  const { pathname } = useLocation();
  const hideNav    = NO_NAV.some(p => pathname.startsWith(p));
  const hideFooter = NO_FOOTER.some(p => pathname.startsWith(p));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideNav && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"                       element={<Landing />} />
          <Route path="/events"                 element={<Events />} />
          <Route path="/events/:id"             element={<EventDetail />} />
          <Route path="/map"                    element={<EventMap />} />
          <Route path="/organiser"              element={<RequireAuth><OrganiserDashboard /></RequireAuth>} />
          <Route path="/organiser/create-event" element={<RequireAuth><CreateEvent /></RequireAuth>} />
          <Route path="/organiser/setup-payout" element={<RequireAuth><PayoutSetup /></RequireAuth>} />
          <Route path="/how-it-works"           element={<HowItWorks />} />
          <Route path="/login"                  element={<Login />} />
          <Route path="/register"               element={<Register />} />
          <Route path="*"                       element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </ThemeProvider>
  );
}
