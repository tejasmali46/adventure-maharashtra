import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { getDestinations } from '../services/api';
import { DESTINATIONS_DATA } from '../data/destinationsData';

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDests = async () => {
      try {
        const res = await getDestinations();
        if (isMounted && res && res.success && res.data.length > 0) {
          setDestinations(res.data);
        } else {
          setDestinations(DESTINATIONS_DATA);
        }
      } catch (err) {
        console.warn('Fallback to local destination data:', err);
        if (isMounted) setDestinations(DESTINATIONS_DATA);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDests();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider flex items-center justify-center gap-1.5">
          <MapPin className="w-4 h-4" />
          <span>Regional Gateways</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore Destinations in Maharashtra
        </h1>
        <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
          From mist-covered mountain valleys in Lonavala to dam-side vineyards in Nashik and coastal wave parks in Mumbai, discover destination corridors across the state.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
          <p className="text-xs text-content-secondary">Loading regional hubs from database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <div
              key={dest._id || dest.id}
              className="glass-card rounded-3xl overflow-hidden border border-border-subtle hover:border-brand-cyan/40 transition-all flex flex-col justify-between group"
            >
              <div className="relative h-60 overflow-hidden bg-slate-900">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-black/30" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-cyan border border-white/10">
                  {dest.parkCount || 1} Destinations
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-brand-cyan transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs font-medium text-brand-amber">
                    {dest.tagline}
                  </p>
                  <p className="text-xs text-content-secondary line-clamp-3 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-subtle space-y-3">
                  <div className="text-[11px] text-content-muted">
                    <span className="font-semibold text-slate-300">Top Activities: </span>
                    {dest.popularActivities ? dest.popularActivities.join(' • ') : 'Water Sports, Coasters'}
                  </div>

                  <Link
                    to={`/destinations/${dest.slug}`}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-brand-cyan hover:text-slate-950 text-white transition-all flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <span>Explore {dest.name} Parks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
