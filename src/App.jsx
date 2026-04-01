import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import OrganiserDashboard from './pages/OrganiserDashboard';
import CreateEvent from './pages/CreateEvent';
import { Login, Register } from './pages/Auth';
import { HowItWorks, NotFound } from './pages/HowItWorks';

// Pages that show the full footer
const PAGES_WITH_FOOTER = ['/', '/events', '/how-it-works', '/organiser'];
const pagesWithNoNav = ['/login', '/register'];

export default function App() {
  const path = window.location.pathname;
  const hideNavFooter = pagesWithNoNav.some(p => path.startsWith(p));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideNavFooter && <Navbar />}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/organiser" element={<OrganiserDashboard />} />
          <Route path="/organiser/create-event" element={<CreateEvent />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideNavFooter && <Footer />}
    </div>
  );
}
