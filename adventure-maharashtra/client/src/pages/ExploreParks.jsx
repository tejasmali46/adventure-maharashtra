import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, Frown, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import ParkCard from '../components/ParkCard';
import { CITIES, CATEGORIES } from '../data/parksData';
import { getParks } from '../services/api';

export default function ExploreParks() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All Cities');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [selectedRating, setSelectedRating] = useState('0');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedActivity, setSelectedActivity] = useState('All');
  const [showDirectOnly, setShowDirectOnly] = useState(false);

  // API response state
  const [parks, setParks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync from URL params on mount
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) setSelectedCity(cityParam);
    const catParam = searchParams.get('category');
    if (catParam) setSelectedCategory(catParam);
  }, [searchParams]);

  // Available activities list
  const commonActivities = [
    'All',
    'Water Rides & Wave Pools',
    'Mega Rollercoasters',
    'High-Altitude Zipline',
    'ATV & Quad Bike Off-Roading',
    '150ft Bungee Jumping & Swoop',
    'High Rope & Obstacle Courses',
    'Go-Karting Speedway',
    'Kids Wonderlands & Gentle Rides'
  ];

  // Fetch from Backend API
  const fetchParksData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCity !== 'All Cities') params.city = selectedCity;
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (selectedActivity !== 'All') params.activity = selectedActivity;
      if (showDirectOnly) params.isDirectOnly = true;
      if (Number(selectedRating) > 0) params.minRating = selectedRating;
      if (maxPrice < 5000) params.maxPrice = maxPrice;
      if (sortBy) params.sort = sortBy;

      const res = await getParks(params);
      if (res && res.success) {
        setParks(res.data);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch parks from API:', err);
      setError(err.message || 'Unable to connect to Adventure Maharashtra API server.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever filters change (with debounce on search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParksData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCity, selectedCategory, selectedRating, maxPrice, sortBy, selectedActivity, showDirectOnly]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCity('All Cities');
    setSelectedCategory('All Categories');
    setSelectedRating('0');
    setMaxPrice(5000);
    setSortBy('popularity');
    setSelectedActivity('All');
    setShowDirectOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Live Database Query Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Explore Adventure & Theme Parks
        </h1>
        <p className="text-sm sm:text-base text-content-secondary max-w-3xl">
          Discover verified amusement parks, wave worlds, and adventure destinations powered by real-time MongoDB queries and capacity verification.
        </p>
      </div>

      {/* Main Search Bar & Quick Toggles */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-border-subtle">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by park name, city, or ride..."
            className="w-full bg-[#101A2D] text-white pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-brand-cyan placeholder-content-muted transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Direct Partner Toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer bg-[#101A2D] px-3 py-2 rounded-xl border border-border-subtle hover:border-brand-cyan/40 transition-colors select-none">
            <input
              type="checkbox"
              checked={showDirectOnly}
              onChange={(e) => setShowDirectOnly(e.target.checked)}
              className="rounded bg-slate-800 border-border-subtle text-brand-cyan focus:ring-0 cursor-pointer"
            />
            <span>Direct Partners Only</span>
          </label>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-[#101A2D] px-3 py-2 rounded-xl border border-border-subtle text-xs">
            <span className="text-content-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="popularity" className="bg-[#101A2D]">Most Popular</option>
              <option value="rating" className="bg-[#101A2D]">Highest Rated</option>
              <option value="price-asc" className="bg-[#101A2D]">Price: Low to High</option>
              <option value="price-desc" className="bg-[#101A2D]">Price: High to Low</option>
            </select>
          </div>

          {/* Reset Action */}
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-content-secondary hover:text-white hover:bg-white/5 border border-border-subtle transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Left Sidebar Filters + Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 glass-card p-6 rounded-2xl border border-border-subtle space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-cyan" />
              <span>Filters</span>
            </h3>
            <span className="text-xs text-brand-cyan font-semibold">
              {loading ? 'Searching...' : `${totalCount} Destination(s)`}
            </span>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
              City / Region
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-brand-cyan cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-[#080F1D]">{c}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-brand-cyan cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#080F1D]">{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-content-secondary">
              <span className="uppercase tracking-wider">Max Pass Price</span>
              <span className="text-brand-cyan">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-cyan cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-content-muted">
              <span>₹500</span>
              <span>₹5,000+</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
              Minimum Rating
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['0', '4.0', '4.3', '4.5'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRating(r)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedRating === r
                      ? 'bg-brand-cyan text-slate-950 font-bold'
                      : 'bg-[#080F1D] text-slate-300 border border-border-subtle hover:bg-white/5'
                  }`}
                >
                  {r === '0' ? 'All' : `${r}+ ★`}
                </button>
              ))}
            </div>
          </div>

          {/* Activity / Ride Type */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
              Specific Attraction
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-brand-cyan cursor-pointer"
            >
              {commonActivities.map((act) => (
                <option key={act} value={act} className="bg-[#080F1D]">{act}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Right Park Cards Grid */}
        <main className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchParksData}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-5 border border-border-subtle animate-pulse space-y-4">
                  <div className="h-48 bg-slate-800/60 rounded-xl" />
                  <div className="h-5 bg-slate-800/60 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/40 rounded w-full" />
                  <div className="h-8 bg-slate-800/60 rounded-xl w-1/3" />
                </div>
              ))}
            </div>
          ) : parks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parks.map((park) => (
                <ParkCard key={park._id || park.id} park={park} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="glass-card p-12 rounded-3xl text-center space-y-4 border border-border-subtle my-8">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-content-muted">
                <Frown className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">No Matching Destinations</h3>
              <p className="text-sm text-content-secondary max-w-md mx-auto">
                No parks found in our database matching your current filter criteria. Try adjusting the city or increasing the maximum price.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan text-slate-950 hover:bg-sky-400 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}