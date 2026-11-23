import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function ParkCard({ park }) {
  const { toggleFavorite, isParkFavorite, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const parkId = park._id || park.id;
  const isFavorite = isParkFavorite(parkId);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    await toggleFavorite(parkId);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-border-subtle hover:border-brand-cyan/40">
      {/* Park Image & Overlays */}
      <div className="relative h-56 overflow-hidden bg-slate-900">
        <img
          src={park.heroImage}
          alt={park.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-black/40" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-cyan/90 text-slate-950 backdrop-blur-md shadow-md">
            {park.category}
          </span>
          {park.isDirectManaged && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3 h-3" />
              Direct Partner
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-500/30 text-rose-400 border border-rose-500/40 shadow-glow-rose'
              : 'bg-black/50 text-white hover:text-rose-400 hover:bg-black/70'
          }`}
          title={isFavorite ? 'Remove from saved favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* City Location Tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-slate-200 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
          <MapPin className="w-3.5 h-3.5 text-brand-cyan" />
          <span>{park.city}, {park.state || 'Maharashtra'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors line-clamp-1">
              {park.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-semibold text-brand-amber bg-brand-amber/10 px-2 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-brand-amber text-brand-amber" />
              <span>{park.rating ? park.rating.toFixed(1) : '4.5'}</span>
              <span className="text-content-muted font-normal">({park.reviewCount || 0})</span>
            </div>
          </div>
          <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">
            {park.tagline || park.description}
          </p>

          {/* Activities Preview */}
          {park.activityNames && park.activityNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {park.activityNames.slice(0, 3).map((act, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300"
                >
                  {act}
                </span>
              ))}
              {park.activityNames.length > 3 && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-content-muted">
                  +{park.activityNames.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-content-muted tracking-wider">
              Passes From
            </span>
            <div className="text-lg font-extrabold text-white flex items-baseline gap-1">
              <span>{formatPrice(park.startingPricePaise)}</span>
              <span className="text-xs font-normal text-content-secondary">/ guest</span>
            </div>
          </div>

          <Link
            to={`/parks/${park.slug}`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-brand-cyan hover:text-slate-950 text-white transition-all flex items-center gap-1 group/btn"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
