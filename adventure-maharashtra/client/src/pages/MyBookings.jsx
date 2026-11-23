import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, Calendar, Users, ShieldCheck, ArrowRight, Clock, 
  AlertCircle, X, CheckCircle2, RotateCcw, MapPin, Sparkles
} from 'lucide-react';
import { formatPrice, formatDate } from '../utils/formatters';
import { getMyBookings, cancelBooking, getTicketsForBooking } from '../services/api';
import DigitalTicketModal from '../components/DigitalTicketModal';

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of travel schedule');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [selectedTicketBooking, setSelectedTicketBooking] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const handleOpenTicket = async (booking) => {
    setSelectedTicketBooking(booking);
    try {
      setLoadingTicket(true);
      const res = await getTicketsForBooking(booking._id);
      if (res.success && res.data && res.data.length > 0) {
        setActiveTicket(res.data[0]);
      } else {
        setActiveTicket(null);
      }
    } catch (err) {
      console.error('Failed to load dynamic ticket:', err);
      setActiveTicket(null);
    } finally {
      setLoadingTicket(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalBooking) return;

    try {
      setCancelling(true);
      const res = await cancelBooking(cancelModalBooking._id, cancelReason);
      if (res.success) {
        setActionSuccess(res.message || 'Booking cancelled successfully.');
        setCancelModalBooking(null);
        fetchBookings();
      }
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const calculateRefundEstimate = (visitDateStr, totalPaise) => {
    const hours = (new Date(visitDateStr).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hours >= 48) return { pct: 100, rupees: Math.round(totalPaise / 100) };
    if (hours >= 24) return { pct: 50, rupees: Math.round((totalPaise * 0.5) / 100) };
    return { pct: 0, rupees: 0 };
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN') && new Date(b.visitDate) >= new Date();
    if (activeTab === 'COMPLETED') return b.bookingStatus === 'COMPLETED' || (b.bookingStatus === 'CHECKED_IN' && new Date(b.visitDate) < new Date());
    if (activeTab === 'CANCELLED') return b.bookingStatus === 'CANCELLED';
    return true;
  });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan uppercase tracking-wider">
          <Ticket className="w-4 h-4" />
          <span>Turnstile Entitlements</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          My Bookings &amp; Passes
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary max-w-xl">
          View your confirmed reservations, download digital QR tickets, or request eligible cancellations.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-subtle pb-4 overflow-x-auto">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-brand-cyan text-slate-950 font-extrabold'
                : 'text-content-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-36 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-border-subtle p-12 text-center">
          <Ticket className="w-12 h-12 text-content-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-content-secondary mt-1 max-w-md mx-auto mb-6">
            You don't have any bookings under the "{activeTab.toLowerCase()}" tab. Plan an adventure across Maharashtra today!
          </p>
          <Link
            to="/parks"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-white transition-colors"
          >
            <span>Explore Adventure Parks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isConfirmed = booking.bookingStatus === 'CONFIRMED';
            const isCancelled = booking.bookingStatus === 'CANCELLED';
            const parkName = booking.park?.name || 'Adventure Park';
            const parkSlug = booking.park?.slug || '';
            const totalRupees = Math.round((booking.priceBreakdown?.totalAmountPaise || 0) / 100);
            const totalPasses = (booking.visitorQuantities?.adults || 0) + 
                                (booking.visitorQuantities?.children || 0) + 
                                (booking.visitorQuantities?.seniors || 0);

            const hoursUntilVisit = (new Date(booking.visitDate).getTime() - Date.now()) / (1000 * 60 * 60);
            const canCancel = isConfirmed && hoursUntilVisit > 0;

            return (
              <div
                key={booking._id}
                className="glass-panel p-6 rounded-2xl border border-border-subtle hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-lg">
                      {booking.bookingReference}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCancelled
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {booking.bookingStatus}
                    </span>

                    {booking.packageSnapshot?.includesExpress && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-amber/20 text-brand-amber flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> VIP Express
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white">{parkName}</h3>
                  <p className="text-xs text-content-secondary">
                    {booking.packageSnapshot?.name}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-content-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                      {formatDate(booking.visitDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      {totalPasses} Ticket(s)
                    </span>
                    <span className="font-bold text-white">
                      ₹{totalRupees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {isCancelled && booking.cancellationDetails && (
                    <div className="pt-1 text-[11px] text-rose-400">
                      Cancelled on {new Date(booking.cancellationDetails.cancelledAt).toLocaleDateString('en-IN')}: {booking.cancellationDetails.reason} (Refund: {booking.cancellationDetails.refundPercentage}%)
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-border-subtle">
                  {(isConfirmed || booking.bookingStatus === 'CHECKED_IN') && (
                    <button
                      onClick={() => handleOpenTicket(booking)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-cyan text-slate-950 hover:bg-white transition-all shadow-glow-cyan"
                    >
                      <Ticket className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>View QR Pass</span>
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => setCancelModalBooking(booking)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                    >
                      Cancel Reservation
                    </button>
                  )}

                  {parkSlug && (
                    <Link
                      to={`/parks/${parkSlug}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-border-subtle transition-colors"
                    >
                      View Park Info
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-rose-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>Cancel Reservation</span>
              </h3>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="p-1 rounded-lg text-content-secondary hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-content-secondary">
              Are you sure you want to cancel booking <strong className="text-white">{cancelModalBooking.bookingReference}</strong> for {cancelModalBooking.park?.name}?
            </p>

            {/* Refund Estimate Preview */}
            {(() => {
              const refund = calculateRefundEstimate(
                cancelModalBooking.visitDate, 
                cancelModalBooking.priceBreakdown?.totalAmountPaise || 0
              );
              return (
                <div className="p-3.5 rounded-xl bg-white/5 border border-border-subtle space-y-1.5 text-xs">
                  <span className="block text-[10px] uppercase font-bold text-content-muted">
                    Automated Refund Eligibility:
                  </span>
                  <div className="flex justify-between font-semibold">
                    <span className="text-content-secondary">Refund Tier:</span>
                    <span className={refund.pct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {refund.pct}% Refund
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-white">
                    <span>Estimated Refund Amount:</span>
                    <span>₹{refund.rupees.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-content-muted pt-1">
                    * Policy: 100% refund if &gt;48h prior, 50% if 24-48h prior, non-refundable within 24h.
                  </p>
                </div>
              );
            })()}

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#080F1D] border border-border-subtle text-xs text-white focus:outline-none focus:border-rose-400"
              >
                <option value="Change of travel schedule">Change of travel schedule</option>
                <option value="Personal / family emergency">Personal / family emergency</option>
                <option value="Weather / rain disruption">Weather / rain disruption</option>
                <option value="Found alternative plan">Found alternative plan</option>
              </select>
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-content-secondary hover:text-white"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL QR TICKET MODAL */}
      {selectedTicketBooking && (
        <DigitalTicketModal
          isOpen={Boolean(selectedTicketBooking)}
          onClose={() => {
            setSelectedTicketBooking(null);
            setActiveTicket(null);
          }}
          ticket={activeTicket}
          booking={selectedTicketBooking}
        />
      )}
    </div>
  );
}