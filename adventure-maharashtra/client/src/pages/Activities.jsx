import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { getActivities, getActivityBySlug } from '../services/api';
import { ACTIVITIES_DATA } from '../data/activitiesData';
import { PARKS_DATA } from '../data/parksData';
import ParkCard from '../components/ParkCard';

export default function Activities() {
  const [activitiesList, setActivitiesList] = useState([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [matchingParks, setMatchingParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingParks, setLoadingParks] = useState(false);

  // Load all activities
  useEffect(() => {
    let isMounted = true;
    const fetchAllActivities = async () => {
      try {
        const res = await getActivities();
        if (isMounted && res && res.success && res.data.length > 0) {
          setActivitiesList(res.data);
          setActiveSlug(res.data[0].slug);
          setSelectedActivity(res.data[0]);
        } else {
          setActivitiesList(ACTIVITIES_DATA);
          setActiveSlug(ACTIVITIES_DATA[0].slug);
          setSelectedActivity(ACTIVITIES_DATA[0]);
        }
      } catch (err) {
        console.warn('Fallback to local activities:', err);
        if (isMounted) {
          setActivitiesList(ACTIVITIES_DATA);
          setActiveSlug(ACTIVITIES_DATA[0].slug);
          setSelectedActivity(ACTIVITIES_DATA[0]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAllActivities();
    return () => { isMounted = false; };
  }, []);

  // Fetch parks for the selected activity
  useEffect(() => {
    if (!activeSlug) return;
    let isMounted = true;
    const fetchActivityParks = async () => {
      setLoadingParks(true);
      try {
        const res = await getActivityBySlug(activeSlug);
        if (isMounted && res && res.success) {
          setSelectedActivity(res.data.activity);
          setMatchingParks(res.data.parks);
        } else {
          // Local fallback
          const localAct = ACTIVITIES_DATA.find((a) => a.slug === activeSlug) || ACTIVITIES_DATA[0];
          setSelectedActivity(localAct);
          setMatchingParks(PARKS_DATA.filter((p) => localAct.parks?.includes(p.slug)));
        }
      } catch (err) {
        console.warn('Fallback for activity parks:', err);
        const localAct = ACTIVITIES_DATA.find((a) => a.slug === activeSlug) || ACTIVITIES_DATA[0];
        if (isMounted) {
          setSelectedActivity(localAct);
          setMatchingParks(PARKS_DATA.filter((p) => localAct.parks?.includes(p.slug)));
        }
      } finally {
        if (isMounted) setLoadingParks(false);
      }
    };
    fetchActivityParks();
    return () => { isMounted = false; };
  }, [activeSlug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
        <p className="text-xs text-content-secondary">Loading adventures from database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-brand-amber uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Curated Thrills</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore by Activity & Thrill
        </h1>
        <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
          Select an adventure category to instantly discover verified parks and resorts in Maharashtra featuring that exact attraction.
        </p>
      </div>

      {/* Activity Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 justify-start sm:justify-center">
        {activitiesList.map((act) => {
          const isActive = act.slug === activeSlug;
          return (
            <button
              key={act._id || act.id}
              onClick={() => setActiveSlug(act.slug)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 border-brand-cyan shadow-glow-cyan/30'
                  : 'bg-[#101A2D] text-slate-300 border-border-subtle hover:bg-white/5'
              }`}
            >
              {act.name}
            </button>
          );
        })}
      </div>

      {/* Active Activity Spotlight */}
      {selectedActivity && (
        <div className="glass-card rounded-3xl overflow-hidden border border-border-subtle p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-amber/20 text-brand-amber border border-brand-amber/30">
                  {selectedActivity.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10">
                  {selectedActivity.intensity} Intensity
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                {selectedActivity.name}
              </h2>
              <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
                {selectedActivity.description}
              </p>
              <div className="text-xs text-brand-cyan font-semibold flex items-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Available at {matchingParks.length} certified destination(s) in Maharashtra</span>
              </div>
            </div>

            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={selectedActivity.image}
                alt={selectedActivity.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Relevant Parks Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            Parks Offering {selectedActivity?.name}
          </h3>
          <span className="text-xs text-content-muted">
            {loadingParks ? 'Fetching parks...' : `${matchingParks.length} Park(s) Found`}
          </span>
        </div>

        {loadingParks ? (
          <div className="py-12 text-center text-xs text-content-secondary">
            Loading matching destinations...
          </div>
        ) : matchingParks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingParks.map((park) => (
              <ParkCard key={park._id || park.id} park={park} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 rounded-2xl text-center text-xs text-content-secondary border border-border-subtle">
            No active parks currently listed for this activity.
          </div>
        )}
      </div>
    </div>
  );
}