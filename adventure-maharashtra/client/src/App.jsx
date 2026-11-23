import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import ExploreParks from './pages/ExploreParks';
import ParkDetails from './pages/ParkDetails';
import Activities from './pages/Activities';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Offers from './pages/Offers';
import About from './pages/About';
import SafetyGuidelines from './pages/SafetyGuidelines';
import CancellationPolicy from './pages/CancellationPolicy';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Auth & Customer Dashboard Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import BookPark from './pages/BookPark';

// Partner / Park Operations Pages (Phase 4)
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerParks from './pages/partner/PartnerParks';
import ParkForm from './pages/partner/ParkForm';
import PackageManagement from './pages/partner/PackageManagement';
import GateScanner from './pages/partner/GateScanner';
import PartnerAnalytics from './pages/partner/PartnerAnalytics';

// Digital Tickets (Phase 7)
import DigitalTicket from './pages/DigitalTicket';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="parks" element={<ExploreParks />} />
            <Route path="parks/:slug" element={<ParkDetails />} />
            <Route path="activities" element={<Activities />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/:slug" element={<DestinationDetail />} />
            <Route path="offers" element={<Offers />} />
            <Route path="about" element={<About />} />
            <Route path="safety" element={<SafetyGuidelines />} />
            <Route path="cancellation-policy" element={<CancellationPolicy />} />
            <Route path="contact" element={<Contact />} />
            
            {/* Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected Customer Dashboard Routes */}
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-bookings" 
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="favorites" 
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="book/:slug" 
              element={
                <ProtectedRoute>
                  <BookPark />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="parks/:slug/book" 
              element={
                <ProtectedRoute>
                  <BookPark />
                </ProtectedRoute>
              } 
            />

            {/* Protected Partner / Admin Routes (Phase 4) */}
            <Route 
              path="partner/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['PARK_ADMIN', 'SUPER_ADMIN']}>
                  <PartnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="partner/parks" 
              element={
                <ProtectedRoute allowedRoles={['PARK_ADMIN', 'SUPER_ADMIN']}>
                  <PartnerParks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="partner/parks/new" 
              element={
                <ProtectedRoute allowedRoles={['PARK_ADMIN', 'SUPER_ADMIN']}>
                  <ParkForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="partner/parks/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['PARK_ADMIN', 'SUPER_ADMIN']}>
                  <ParkForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="partner/parks/:id/packages" 
              element={
                <ProtectedRoute allowedRoles={['PARK_ADMIN', 'SUPER_ADMIN']}>
                  <PackageManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="partner/scanner" 
              element={
                <ProtectedRoute allowedRoles={['PARK_ADMIN', 'SUPER_ADMIN']}>
                  <GateScanner />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="partner/analytics" 
              element={
                <ProtectedRoute allowedRoles={['PARK_ADMIN', 'SUPER_ADMIN']}>
                  <PartnerAnalytics />
                </ProtectedRoute>
              } 
            />

            {/* Digital Passes & Tickets (Phase 7) */}
            <Route 
              path="tickets/:ticketRef" 
              element={
                <ProtectedRoute>
                  <DigitalTicket />
                </ProtectedRoute>
              } 
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}