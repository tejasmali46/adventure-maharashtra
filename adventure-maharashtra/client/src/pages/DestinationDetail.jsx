import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { getDestinationBySlug } from '../services/api';
import { DESTINATIONS_DATA } from '../data/destinationsData';
import { PARKS_DATA } from '../data/parksData';
import ParkCard from '../components/ParkCard';

export default function DestinationDetail() {
  const { slug } = useParams();

  const [destination, setDestination] = useState(null);
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDestinationBySlug(slug);
        if (isMounted && res && res.success) {
          setDestination(res.data.destination);
          setParks(res.data.parks);
        } else {
          // Local fallback
          const localDest = DESTINATIONS_DATA.find((d) => d.slug === slug) || DESTINATIONS_DATA[0];
          setDestination(localDest);
          setParks(PARKS_DATA.filter((p) => localDest.parks?.includes(p.slug)));
        }
      } catch (err) {
        console.warn('Fallback to local destination:', err);
        const localDest = DESTINATIONS_DATA.find((d) => d.slug === slug) || DESTINATIONS_DATA[0];
        if (isMounted) {
          setDestination(localDest);
          setParks(PARKS_DATA.filter((p) => localDest.parks?.includes(p.slug)));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDest();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
        <p className="text-sm text-content-secondary">Loading regional destinations and parks...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Region Not Found</h2>
        <Link to="/destinations" className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-brand-cyan text-slate-950">
          Back to All Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden flex items-end">
        <img
          src={destination.image}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full space-y-3">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Destinations</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-amber uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Maharashtra Regional Hub</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            {destination.name}
          </h1>
          <p className="text-base text-slate-200 max-w-2xl">
            {destination.tagline}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Destination Guide Overview */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-lg font-bold text-white">About {destination.name}</h3>
            <p className="text-sm text-content-secondary leading-relaxed">
              {destination.description}
            </p>
          </div>
          <div className="space-y-3 p-4 rounded-2xl bg-[#080F1D] border border-border-subtle text-xs">
            <div className="flex items-center gap-2 text-brand-cyan font-bold">
              <Calendar className="w-4 h-4" />
              <span>Best Time to Visit:</span>
            </div>
            <p className="text-slate-200 font-medium pl-6">
              {destination.bestTimeToVisit || 'October to March'}
            </p>
            <div className="text-[11px] text-content-muted pt-2 border-t border-border-subtle">
              Direct highway and expressway access from major transit hubs.
            </div>
          </div>
        </div>

        {/* Available Parks in Destination */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Parks & Attractions in {destination.name}
            </h2>
            <span className="text-xs text-brand-cyan font-semibold">
              {parks.length} Verified Listing(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parks.map((park) => (
              <ParkCard key={park._id || park.id} park={park} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}