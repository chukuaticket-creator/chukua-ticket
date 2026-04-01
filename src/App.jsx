import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventMap from './pages/EventMap';
import OrganiserDashboard from './pages/OrganiserDashboard';
import CreateEvent from './pages/CreateEvent';
import { Login, Register } from './pages/Auth';
import { HowItWorks, NotFound } from './pages/HowItWorks';

const NO_NAV    = ['/login', '/register'];
const NO_FOOTER = ['/login', '/register', '/organiser', '/map'];

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
          <Route path="/organiser"              element={<OrganiserDashboard />} />
          <Route path="/organiser/create-event" element={<CreateEvent />} />
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
      <Layout />
    </ThemeProvider>
  );
}
