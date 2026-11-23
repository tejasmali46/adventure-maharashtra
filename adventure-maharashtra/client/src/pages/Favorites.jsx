import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, Loader2, Sparkles, Frown } from 'lucide-react';
import { getFavorites, removeFavorite } from '../services/api';
import { formatPrice } from '../utils/formatters';

export default function Favorites() {
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavs = async () => {
    try {
      const res = await getFavorites();
      if (res && res.success) {
        setFavoriteParks(res.data);
      }
    } catch (err) {
      console.warn('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavs();
  }, []);

  const handleRemove = async (parkId) => {
    try {
      await removeFavorite(parkId);
      setFavoriteParks(prev => prev.filter(p => (p._id || p.id) !== parkId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>Saved Getaways</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          My Favorite Destinations
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary max-w-xl">
          Quickly access and compare your saved parks, theme rides, and water resorts across Maharashtra.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
          <p className="text-xs text-content-secondary">Loading saved destinations...</p>
        </div>
      ) : favoriteParks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteParks.map((park) => {
            const parkId = park._id || park.id;
            return (
              <div
                key={parkId}
                className="glass-card rounded-2xl overflow-hidden border border-border-subtle hover:border-brand-cyan/40 transition-all flex flex-col justify-between group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={park.heroImage}
                    alt={park.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-black/30" />
                  
                  <button
                    onClick={() => handleRemove(parkId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-slate-300 hover:text-rose-400 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-3 text-xs text-slate-200 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
                    {park.city}, Maharashtra
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors line-clamp-1">
                      {park.name}
                    </h3>
                    <p className="text-xs text-content-secondary line-clamp-2 mt-1">
                      {park.tagline || park.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] text-content-muted uppercase">From</span>
                      <span className="text-base font-extrabold text-white">
                        {formatPrice(park.startingPricePaise)}
                      </span>
                    </div>

                    <Link
                      to={`/parks/${park.slug}`}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-brand-cyan hover:text-slate-950 text-white transition-all flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 rounded-3xl border border-border-subtle text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-white/5 mx-auto flex items-center justify-center text-content-muted">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No Saved Favorites Yet</h3>
          <p className="text-xs text-content-secondary leading-relaxed">
            Whenever you discover an amusement park or water slide you love, tap the heart icon on any card to save it here for fast booking.
          </p>
          <Link
            to="/parks"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan text-slate-950 hover:bg-sky-400 transition-colors"
          >
            Explore Destinations
          </Link>
        </div>
      )}
    </div>
  );
}