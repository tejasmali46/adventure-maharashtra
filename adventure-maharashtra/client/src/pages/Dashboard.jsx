import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Ticket, Heart, ShieldCheck, ArrowRight, User, 
  MapPin, Clock, AlertCircle, Sparkles, Plus, ExternalLink 
} from 'lucide-react';
import { getDashboardStats } from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    savedFavorites: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        if (isMounted && res && res.success) {
          setStats(res.data.stats);
          setRecentBookings(res.data.recentBookings || []);
        }
      } catch (err) {
        console.warn('Dashboard stats error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle relative overflow-hidden bg-gradient-to-r from-[#0B1220] via-[#101A2D] to-[#080F1D]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                {user?.role} ACCOUNT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Active Explorer
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Hello, {user?.name || 'Explorer'}!
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary max-w-xl">
              Manage your upcoming weekend escapes, access digital turnstile tickets, and track your favorite amusement parks across Maharashtra.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/parks"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Adventure</span>
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-border-subtle transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-2xl border border-border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted uppercase">Upcoming Trips</span>
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 text-brand-cyan flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.upcomingBookings}
          </div>
          <p className="text-[11px] text-content-muted">Confirmed visit passes</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted uppercase">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.totalBookings}
          </div>
          <p className="text-[11px] text-content-muted">Lifetime reservations</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted uppercase">Saved Favorites</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.savedFavorites}
          </div>
          <p className="text-[11px] text-content-muted">Saved parks & resorts</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted uppercase">Security</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-400 pt-1">
            Verified
          </div>
          <p className="text-[11px] text-content-muted">Protected with HttpOnly session</p>
        </div>
      </div>

      {/* Main Sections: Bookings Preview + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Recent Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-brand-cyan" />
              <span>Recent Bookings & Passes</span>
            </h2>
            <Link to="/my-bookings" className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b._id} className="glass-card p-5 rounded-2xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-amber">#{b.bookingReference}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {b.bookingStatus}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base">{b.park?.name || 'Park Visit'}</h4>
                    <p className="text-xs text-content-secondary flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>{formatDate(b.visitDate)}</span>
                      <span>•</span>
                      <span>{b.visitorQuantities?.adults || 1} Adult(s)</span>
                    </p>
                  </div>
                  <div className="text-right sm:flex-shrink-0">
                    <span className="text-sm font-black text-white block">
                      {formatPrice(b.priceBreakdown?.totalAmountPaise || 0)}
                    </span>
                    <Link
                      to={`/my-bookings/${b._id}/ticket`}
                      className="text-xs text-brand-cyan hover:underline font-semibold"
                    >
                      View Digital Ticket →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl border border-border-subtle text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-content-muted">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Bookings Yet</h3>
              <p className="text-xs text-content-secondary max-w-sm mx-auto">
                Ready for your next thrilling rush? Browse theme parks and water rides across Maharashtra.
              </p>
              <Link
                to="/parks"
                className="inline-block px-5 py-2 rounded-xl text-xs font-bold bg-brand-cyan text-slate-950 hover:bg-sky-400 transition-colors"
              >
                Explore Destinations
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Quick Shortcuts */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <div className="glass-card p-6 rounded-3xl border border-border-subtle space-y-3 text-xs">
            <Link
              to="/favorites"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-white font-semibold transition-colors border border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>My Saved Destinations</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-content-muted" />
            </Link>

            <Link
              to="/my-bookings"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-white font-semibold transition-colors border border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-brand-cyan" />
                <span>Ticket Passes & Rainchecks</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-content-muted" />
            </Link>

            <Link
              to="/offers"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-white font-semibold transition-colors border border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-amber" />
                <span>Active Coupon Deals</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-content-muted" />
            </Link>

            <Link
              to="/safety"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-white font-semibold transition-colors border border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>State Park Safety Guidelines</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-content-muted" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}