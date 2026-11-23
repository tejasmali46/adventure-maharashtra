import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-cyan/10 border border-brand-cyan/20 mx-auto flex items-center justify-center text-brand-cyan shadow-glow-cyan/20">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>
        
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-amber uppercase tracking-widest">404 - Off The Trail</span>
          <h1 className="text-4xl font-black text-white">Destination Not Found</h1>
          <p className="text-sm text-content-secondary leading-relaxed">
            Looks like you took an uncharted path in Maharashtra. The page you are looking for has either moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-sky-400 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/parks"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore All Parks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
