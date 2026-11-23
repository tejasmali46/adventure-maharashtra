import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Ticket, 
  CheckCircle2, AlertCircle, ArrowLeft, Star, ShieldCheck, 
  RotateCcw, Sparkles, Building, Filter, Scan
} from 'lucide-react';
import { getPartnerAnalytics } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PartnerAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParkId, setSelectedParkId] = useState('');

  const fetchAnalytics = async (parkId = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPartnerAnalytics(parkId ? { parkId } : {});
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load business analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedParkId);
  }, [selectedParkId]);

  if (loading && !data) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-content-secondary">Aggregating business performance intelligence...</p>
      </div>
    );
  }

  const financials = data?.financials || {};
  const bookings = data?.bookingsVolume || {};
  const demographics = data?.visitorDemographics || {};
  const turnstiles = data?.turnstileOperations || {};
  const sentiment = data?.guestSentiment || {};
  const packages = data?.packagePerformance || [];
  const parks = data?.parks || [];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* HEADER & VENUE FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Business Intelligence &amp; Yield</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Partner Revenue &amp; Footfall Analytics
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Real-time admissions yield, pass tier velocity, turnstile check-in rates, and guest sentiment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {parks.length > 1 && (
            <div className="flex items-center gap-2 bg-white/5 border border-border-subtle rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-cyan" />
              <select
                value={selectedParkId}
                onChange={(e) => setSelectedParkId(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                <option value="" className="bg-slate-900">All Destinations Combined</option>
                {parks.map((p) => (
                  <option key={p._id} value={p._id} className="bg-slate-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Link
            to="/partner/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-border-subtle text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Partner Hub</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* GROSS REVENUE */}
        <div className="glass-panel p-5 rounded-2xl border border-border-subtle relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-muted">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">
              ₹{(financials.grossRevenueRupees || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-content-secondary block mt-0.5">
              Net: ₹{(financials.netRevenueRupees || 0).toLocaleString('en-IN')} (₹{(financials.refundedRupees || 0).toLocaleString('en-IN')} refunded)
            </span>
          </div>
        </div>

        {/* BOOKINGS VOLUME */}
        <div className="glass-panel p-5 rounded-2xl border border-border-subtle relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-muted">Total Reservations</span>
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 text-brand-cyan flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{bookings.total || 0}</span>
            <span className="text-[10px] text-content-secondary block mt-0.5">
              {bookings.confirmed || 0} Active • {bookings.cancelled || 0} Cancelled ({bookings.cancellationRatePct || 0}%)
            </span>
          </div>
        </div>

        {/* TURNSTILE CHECK-IN RATE */}
        <div className="glass-panel p-5 rounded-2xl border border-border-subtle relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-muted">Gate Check-in Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{turnstiles.admissionRatePct || 0}%</span>
            <span className="text-[10px] text-content-secondary block mt-0.5">
              {turnstiles.admitted || 0} Admitted of {turnstiles.totalExpected || 0} Passes
            </span>
          </div>
        </div>

        {/* GUEST RATING */}
        <div className="glass-panel p-5 rounded-2xl border border-border-subtle relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-muted">Guest Satisfaction</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{sentiment.averageRating || 0} / 5.0</span>
            <span className="text-[10px] text-content-secondary block mt-0.5">
              From {sentiment.totalReviews || 0} Verified Guest Reviews
            </span>
          </div>
        </div>
      </div>

      {/* DETAILED INSIGHTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* VISITOR DEMOGRAPHICS */}
        <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-cyan" />
            <span>Visitor Tier Demographics ({demographics.totalVisitors || 0} Total Guests)</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-white">Adult Visitors (General Admission)</span>
                <span className="font-bold text-brand-cyan">{demographics.adults || 0} ({demographics.adultsPct || 0}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-brand-cyan transition-all duration-500"
                  style={{ width: `${demographics.adultsPct || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-white">Child Pass Holders (Height Concession)</span>
                <span className="font-bold text-purple-400">{demographics.children || 0} ({demographics.childrenPct || 0}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-purple-400 transition-all duration-500"
                  style={{ width: `${demographics.childrenPct || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-white">Senior Citizens (Age 60+ Concession)</span>
                <span className="font-bold text-brand-amber">{demographics.seniors || 0} ({demographics.seniorsPct || 0}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-brand-amber transition-all duration-500"
                  style={{ width: `${demographics.seniorsPct || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TURNSTILE OPERATIONS BREAKDOWN */}
        <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Scan className="w-4 h-4 text-purple-400" />
            <span>Turnstile Check-in Status</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white/5 border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Admitted &amp; Verified</span>
              <span className="text-3xl font-extrabold text-white">{turnstiles.admitted || 0}</span>
              <span className="text-[10px] text-content-muted block mt-1">Processed at Optical Gates</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-brand-cyan block mb-1">Passes Remaining</span>
              <span className="text-3xl font-extrabold text-white">{turnstiles.remaining || 0}</span>
              <span className="text-[10px] text-content-muted block mt-1">Pending Gate Admission</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-xs text-brand-cyan flex items-center justify-between">
            <span className="text-[11px] text-content-secondary">
              Turnstile Gates Online: <strong className="text-white">Active (SSL Encrypted)</strong>
            </span>
            <Link to="/partner/scanner" className="text-xs font-bold text-brand-cyan hover:underline">
              Open Scanner &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* PASS TIER VELOCITY & SALES TABLE */}
      <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Ticket className="w-4 h-4 text-brand-cyan" />
            <span>Pass Tier Performance &amp; Revenue Velocity</span>
          </h2>
          <span className="text-xs text-content-muted">{packages.length} Packages Sold</span>
        </div>

        {packages.length === 0 ? (
          <div className="py-8 text-center text-xs text-content-muted">
            No pass tier sales data recorded yet for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-content-muted border-b border-border-subtle">
                <tr>
                  <th className="pb-2.5 font-bold">Pass Package</th>
                  <th className="pb-2.5 font-bold">Express Status</th>
                  <th className="pb-2.5 font-bold">Reservations Sold</th>
                  <th className="pb-2.5 font-bold">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-medium text-slate-300">
                {packages.map((pkg, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 text-white font-bold">{pkg.name}</td>
                    <td className="py-3">
                      {pkg.express ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400/20 text-amber-400">
                          VIP EXPRESS
                        </span>
                      ) : (
                        <span className="text-[10px] text-content-muted">Standard</span>
                      )}
                    </td>
                    <td className="py-3 font-semibold text-white">{pkg.count} Orders</td>
                    <td className="py-3 font-extrabold text-emerald-400">
                      ₹{pkg.revenueRupees.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}