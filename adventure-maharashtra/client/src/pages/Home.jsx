import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Sparkles, ShieldCheck, Ticket, ArrowRight, Zap, Loader2 } from 'lucide-react';
import SearchWidget from '../components/SearchWidget';
import ParkCard from '../components/ParkCard';
import { getFeaturedParks, getDestinations, getActivities } from '../services/api';
import { PARKS_DATA } from '../data/parksData';
import { DESTINATIONS_DATA } from '../data/destinationsData';
import { ACTIVITIES_DATA } from '../data/activitiesData';

export default function Home() {
  const [featuredParks, setFeaturedParks] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [parksRes, destsRes, actsRes] = await Promise.allSettled([
          getFeaturedParks(),
          getDestinations(),
          getActivities()
        ]);

        if (isMounted) {
          if (parksRes.status === 'fulfilled' && parksRes.value?.data?.length > 0) {
            setFeaturedParks(parksRes.value.data.slice(0, 3));
          } else {
            setFeaturedParks(PARKS_DATA.filter((p) => p.isFeatured).slice(0, 3));
          }

          if (destsRes.status === 'fulfilled' && destsRes.value?.data?.length > 0) {
            setDestinations(destsRes.value.data);
          } else {
            setDestinations(DESTINATIONS_DATA);
          }

          if (actsRes.status === 'fulfilled' && actsRes.value?.data?.length > 0) {
            setActivities(actsRes.value.data);
          } else {
            setActivities(ACTIVITIES_DATA);
          }
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Cinematic Backdrop Image & Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=2000&q=85"
            alt="Adventure Coasters in Maharashtra"
            className="w-full h-full object-cover object-center filter brightness-[0.35] scale-105 transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-brand-cyan uppercase">
              One Platform. Every Adventure.
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] uppercase font-sans"
          >
            YOUR NEXT ADVENTURE <br />
            <span className="bg-gradient-to-r from-brand-cyan via-sky-300 to-brand-blue bg-clip-text text-transparent">
              STARTS HERE.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-content-secondary max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Discover Maharashtra's most exciting amusement parks, water parks, and adventure destinations—all in one place.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/parks"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan hover:shadow-lg transition-all duration-300 transform active:scale-95"
            >
              EXPLORE PARKS
            </Link>
            <Link
              to="/activities"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md transition-all duration-300"
            >
              PLAN YOUR ADVENTURE
            </Link>
          </motion.div>

          {/* Quick Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-6"
          >
            <SearchWidget />
          </motion.div>
        </div>
      </section>

      {/* FEATURED PARKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold text-brand-amber uppercase tracking-wider">
              Handpicked Destinations
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Featured Adventure Parks
            </h2>
          </div>
          <Link
            to="/parks"
            className="text-sm font-semibold text-brand-cyan hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All Parks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredParks.map((park) => (
            <ParkCard key={park._id || park.id} park={park} />
          ))}
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider">
              Regional Getaways
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Popular Maharashtra Destinations
            </h2>
          </div>
          <Link
            to="/destinations"
            className="text-sm font-semibold text-brand-cyan hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Explore All Regions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Link
              key={dest._id || dest.id}
              to={`/destinations/${dest.slug}`}
              className="group relative h-72 rounded-2xl overflow-hidden glass-card border border-border-subtle hover:border-brand-cyan/40"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/40 to-transparent" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-brand-cyan border border-white/10">
                {dest.parkCount || 1} Destinations
              </div>
              <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                <h3 className="text-xl font-bold text-white group-hover:text-brand-cyan transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-content-secondary line-clamp-1">
                  {dest.tagline}
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-brand-amber font-medium">
                  <span>Top: {dest.popularActivities?.slice(0, 2).join(' • ') || 'Adventure Sports'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ACTIVITIES SHOWCASE */}
      <section className="bg-[#080F1D] py-16 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-brand-amber uppercase tracking-wider">
              Adrenaline By Activity
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Find Your Rush
            </h2>
            <p className="text-sm text-content-secondary">
              From soaring 1,200ft above valleys to braving monster wave pools, select your style of adventure.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {activities.slice(0, 8).map((act) => (
              <Link
                key={act._id || act.id}
                to={`/activities`}
                className="p-4 rounded-xl glass-card flex flex-col justify-between space-y-3 group border border-border-subtle hover:border-brand-cyan/40"
              >
                <div className="relative h-28 rounded-lg overflow-hidden bg-slate-900">
                  <img
                    src={act.image}
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-brand-cyan">
                    {act.intensity} Intensity
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors">
                    {act.name}
                  </h4>
                  <p className="text-[11px] text-content-muted mt-0.5">
                    {act.parkCount || 1} Participating Parks
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/activities"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
            >
              <span>View All Adventure Activities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW BOOKING WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider">
            Seamless Experience
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            How Booking Works
          </h2>
          <p className="text-sm text-content-secondary">
            From instant discovery to turnstile scanning in 4 easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Discover & Compare', desc: 'Filter by city, category, thrill intensity, and verified amenities.', icon: Compass },
            { step: '02', title: 'Configure Your Pass', desc: 'Select visit dates, family or express combos, and custom activity add-ons.', icon: Ticket },
            { step: '03', title: 'Secure Online Payment', desc: 'Instant booking confirmation via official payment gateway with transparent pricing.', icon: ShieldCheck },
            { step: '04', title: 'Digital QR Entry', desc: 'Show your digital QR ticket directly on your smartphone at the park gate.', icon: Zap }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card p-6 rounded-2xl relative border border-border-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-white/10">{item.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-white">{item.title}</h4>
                <p className="text-xs text-content-secondary leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
