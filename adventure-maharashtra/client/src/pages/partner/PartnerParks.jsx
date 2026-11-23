import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Plus, Search, Filter, CheckCircle2, Clock, 
  AlertCircle, Edit3, Ticket, ExternalLink, MapPin, Star
} from 'lucide-react';
import { getMyParks } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PartnerParks() {
  const { user } = useAuth();
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchParks = async () => {
      try {
        setLoading(true);
        const res = await getMyParks();
        if (res.success) {
          setParks(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch parks.');
      } finally {
        setLoading(false);
      }
    };
    fetchParks();
  }, []);

  const filteredParks = parks.filter((park) => {
    const matchesSearch = 
      park.name.toLowerCase().includes(search.toLowerCase()) ||
      park.city.toLowerCase().includes(search.toLowerCase()) ||
      park.category.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && park.approvalStatus === statusFilter;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-cyan uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Listing Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Managed Adventure Destinations</h1>
          <p className="text-sm text-content-secondary mt-1">
            View, filter, and configure all listed adventure parks and passes.
          </p>
        </div>

        <Link
          to="/partner/parks/new"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-white transition-colors shadow-glow-cyan"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Park Listing</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-border-subtle w-full sm:w-auto">
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-brand-cyan text-slate-950 shadow'
                  : 'text-content-secondary hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Parks' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, city, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
          />
        </div>
      </div>

      {/* Parks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredParks.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-border-subtle p-12 text-center mt-8">
          <Building2 className="w-12 h-12 text-content-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Matching Parks Found</h3>
          <p className="text-xs text-content-secondary mt-1">
            Try adjusting your search criteria or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredParks.map((park) => {
            const startingRupees = Math.round(park.startingPricePaise / 100);
            return (
              <div
                key={park._id}
                className="glass-panel rounded-2xl border border-border-subtle overflow-hidden hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Status Badge */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={park.heroImage}
                      alt={park.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-brand-cyan border border-white/10">
                        {park.category}
                      </span>
                      {park.isDirectManaged && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand-cyan/90 text-slate-950">
                          Direct
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      {park.approvalStatus === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {park.approvalStatus === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {park.approvalStatus === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/90 text-white backdrop-blur-md">
                          <AlertCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-bold bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-md text-amber-300">
                      <Star className="w-3 h-3 fill-amber-300 stroke-none" />
                      <span>{park.rating ? park.rating.toFixed(1) : 'New'}</span>
                      <span className="text-[10px] text-content-muted">({park.reviewCount || 0})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white line-clamp-1">{park.name}</h3>
                    <p className="text-xs text-content-secondary flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
                      <span>{park.city}, {park.district || park.state}</span>
                    </p>

                    <p className="text-xs text-content-muted mt-2.5 line-clamp-2">
                      {park.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                      <span className="text-content-muted">Base Pass:</span>
                      <span className="font-bold text-white text-sm">
                        ₹{startingRupees.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    to={`/partner/parks/${park._id}/packages`}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Passes ({park.packages?.length || 0})</span>
                  </Link>

                  <Link
                    to={`/partner/parks/${park._id}/edit`}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-border-subtle transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Park</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}