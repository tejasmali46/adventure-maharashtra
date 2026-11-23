import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Layers, Search, ArrowRight } from 'lucide-react';
import { CITIES, CATEGORIES } from '../data/parksData';

export default function SearchWidget({ initialCity = '', initialCategory = '' }) {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialCity || 'All Cities');
  const [category, setCategory] = useState(initialCategory || 'All Categories');
  
  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState(defaultDateStr);
  const [guests, setGuests] = useState('2');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city && city !== 'All Cities') params.set('city', city);
    if (category && category !== 'All Categories') params.set('category', category);
    if (visitDate) params.set('date', visitDate);
    if (guests) params.set('guests', guests);

    navigate(`/parks?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl max-w-5xl mx-auto border border-border-subtle relative z-20"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination / City */}
        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-muted flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Destination</span>
          </label>
          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-cyan transition-colors appearance-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-[#101A2D] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-amber" />
            <span>Park Category</span>
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-cyan transition-colors appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#101A2D] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visit Date */}
        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-muted flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Visit Date</span>
          </label>
          <input
            type="date"
            value={visitDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-cyan transition-colors cursor-pointer"
          />
        </div>

        {/* Guests Count */}
        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-muted flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-blue" />
            <span>Visitors</span>
          </label>
          <div className="relative">
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-cyan transition-colors appearance-none cursor-pointer"
            >
              <option value="1" className="bg-[#101A2D]">1 Solo Explorer</option>
              <option value="2" className="bg-[#101A2D]">2 Duo Explorers</option>
              <option value="4" className="bg-[#101A2D]">4 Squad / Family</option>
              <option value="6" className="bg-[#101A2D]">6+ Group Pass</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-content-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time availability enabled for direct partners</span>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan via-sky-400 to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <Search className="w-4 h-4" />
          <span>EXPLORE EXPERIENCES</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  );
}
