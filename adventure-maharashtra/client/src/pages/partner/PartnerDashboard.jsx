import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Ticket, CheckCircle2, Clock, AlertCircle, 
  ChevronRight, ExternalLink, Edit3, ShieldAlert, Sparkles, Filter, Eye, Scan, BarChart3
} from 'lucide-react';
import { getMyParks, updateParkStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchParks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyParks();
      if (res.success) {
        setParks(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load park listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParks();
  }, []);

  const handleStatusChange = async (parkId, newStatus) => {
    try {
      setActionSuccess(null);
      await updateParkStatus(parkId, { approvalStatus: newStatus });
      setActionSuccess(`Listing status successfully updated to ${newStatus}`);
      fetchParks();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleToggleActive = async (parkId, currentActive) => {
    try {
      setActionSuccess(null);
      await updateParkStatus(parkId, { isActive: !currentActive });
      setActionSuccess(`Park visibility toggled to ${!currentActive ? 'Active' : 'Inactive'}`);
      fetchParks();
    } catch (err) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  // KPI calculations
  const totalParks = parks.length;
  const approvedParks = parks.filter((p) => p.approvalStatus === 'APPROVED' && p.isActive).length;
  const pendingParks = parks.filter((p) => p.approvalStatus === 'PENDING').length;
  const totalPackages = parks.reduce((acc, p) => acc + (p.packages?.length || 0), 0);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-cyan uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Partner Operations Portal</span>
            {user?.role === 'SUPER_ADMIN' && (
              <span className="bg-brand-amber/20 text-brand-amber px-2 py-0.5 rounded text-[10px]">
                Super Admin Privilege
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Park & Package Management
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Publish adventure destinations, configure tiered entry passes, and monitor listing status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/partner/analytics"
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white border border-border-subtle transition-all"
          >
            <BarChart3 className="w-4 h-4 text-brand-cyan" />
            <span>Analytics &amp; Yield</span>
          </Link>
          <Link
            to="/partner/scanner"
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-brand-cyan border border-brand-cyan/30 transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>Turnstile Scanner</span>
          </Link>
          <Link
            to="/partner/parks/new"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Park</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="glass-panel p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between text-content-muted mb-2">
            <span className="text-xs font-semibold">Managed Parks</span>
            <Building2 className="w-5 h-5 text-brand-cyan" />
          </div>
          <p className="text-3xl font-extrabold text-white">{loading ? '...' : totalParks}</p>
          <span className="text-[11px] text-content-secondary mt-1 block">Total partner properties</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between text-content-muted mb-2">
            <span className="text-xs font-semibold">Live on Portal</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{loading ? '...' : approvedParks}</p>
          <span className="text-[11px] text-content-secondary mt-1 block">Approved & accepting bookings</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between text-content-muted mb-2">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock className="w-5 h-5 text-brand-amber" />
          </div>
          <p className="text-3xl font-extrabold text-brand-amber">{loading ? '...' : pendingParks}</p>
          <span className="text-[11px] text-content-secondary mt-1 block">Under compliance verification</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between text-content-muted mb-2">
            <span className="text-xs font-semibold">Active Packages</span>
            <Ticket className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-purple-400">{loading ? '...' : totalPackages}</p>
          <span className="text-[11px] text-content-secondary mt-1 block">Configured visitor passes</span>
        </div>
      </div>

      {/* Park Listings Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Your Adventure Parks</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-content-secondary">
              {parks.length}
            </span>
          </h2>
          <Link
            to="/partner/parks"
            className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1"
          >
            <span>View All Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : parks.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-border-subtle p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Parks Listed Yet</h3>
            <p className="text-xs text-content-secondary max-w-md mx-auto mt-1 mb-6">
              Get started by listing your theme park, water park, or mountain adventure zone to reach thousands of travelers across Maharashtra.
            </p>
            <Link
              to="/partner/parks/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Park</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {parks.map((park) => {
              const startingRupees = Math.round(park.startingPricePaise / 100);
              const isApproved = park.approvalStatus === 'APPROVED';
              const isPending = park.approvalStatus === 'PENDING';
              const isRejected = park.approvalStatus === 'REJECTED';

              return (
                <div
                  key={park._id}
                  className="glass-panel rounded-2xl border border-border-subtle p-5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4">
                    <img
                      src={park.heroImage}
                      alt={park.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-white/10"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-blue/20 text-brand-cyan">
                          {park.category}
                        </span>

                        {/* Approval Status Badge */}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                            <AlertCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}

                        {park.isDirectManaged && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan">
                            Direct Managed
                          </span>
                        )}

                        {!park.isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                            Deactivated
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors">
                        {park.name}
                      </h3>
                      <p className="text-xs text-content-secondary">
                        {park.city}, {park.state} &bull; {park.operatingHours?.open} - {park.operatingHours?.close}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Metrics & Pricing */}
                  <div className="flex items-center gap-6 text-xs text-content-secondary border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-content-muted">Passes</span>
                      <span className="text-sm font-bold text-white">
                        {park.packages?.length || 0} Tier(s)
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-content-muted">Starts At</span>
                      <span className="text-sm font-bold text-brand-cyan">
                        ₹{startingRupees.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle">
                    {/* Super Admin Quick Controls */}
                    {user?.role === 'SUPER_ADMIN' && (
                      <div className="flex items-center gap-1 mr-2 border-r border-border-subtle pr-3">
                        {isPending && (
                          <button
                            onClick={() => handleStatusChange(park._id, 'APPROVED')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Approve this listing"
                          >
                            Approve
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            onClick={() => handleStatusChange(park._id, 'REJECTED')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Reject listing"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(park._id, park.isActive)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            park.isActive 
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          }`}
                          title="Toggle active status"
                        >
                          {park.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}

                    <Link
                      to={`/partner/parks/${park._id}/packages`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-purple-300 border border-purple-500/20 transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Passes ({park.packages?.length || 0})</span>
                    </Link>

                    <Link
                      to={`/partner/parks/${park._id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-border-subtle transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    {isApproved && park.isActive && (
                      <Link
                        to={`/parks/${park.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-content-secondary hover:text-white border border-border-subtle transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}