import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import OrganiserDashboard from './pages/OrganiserDashboard';
import CreateEvent from './pages/CreateEvent';
import { Login, Register } from './pages/Auth';
import { HowItWorks, NotFound } from './pages/HowItWorks';

const pagesWithNoNav = ['/login', '/register'];
const pagesWithNoFooter = ['/organiser', '/organiser/create-event', '/login', '/register'];

export default function App() {
  const location = useLocation();
  const path = location.pathname;

  const hideNav = pagesWithNoNav.some(p => path.startsWith(p));
  const hideFooter = pagesWithNoFooter.some(p => path.startsWith(p));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideNav && <Navbar />}

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

      {!hideFooter && <Footer />}
    </div>
  );
}
