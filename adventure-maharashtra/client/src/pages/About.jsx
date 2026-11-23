import React from 'react';
import { Compass, ShieldCheck, Target, Globe, Users, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Intro */}
      <div className="text-center space-y-4">
        <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider">
          Our Vision & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          About Adventure Maharashtra
        </h1>
        <p className="text-base text-content-secondary max-w-2xl mx-auto leading-relaxed">
          Connecting thrill seekers, families, and outdoor enthusiasts with Maharashtra's premier recreational destinations on one seamless, transparent platform.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">One Centralized Hub</h3>
          <p className="text-xs text-content-secondary leading-relaxed">
            No more hunting through fragmented websites. Compare verified ticket packages, operating schedules, and ride restrictions in a single unified interface.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Honest Partner Listings</h3>
          <p className="text-xs text-content-secondary leading-relaxed">
            We explicitly distinguish directly managed partner parks from authorized third-party listings. Only verified pricing and live availability are guaranteed.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Engineered for Scale</h3>
          <p className="text-xs text-content-secondary leading-relaxed">
            Designed from day one to handle heavy weekend booking concurrency, multi-gate QR validation, and future expansion beyond Maharashtra.
          </p>
        </div>
      </div>

      {/* Listing Distinction Disclosure */}
      <div className="glass-card p-8 rounded-3xl border border-border-subtle space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-amber" />
          <span>Our Business Integrity & Listing Policy</span>
        </h2>
        <div className="space-y-3 text-sm text-content-secondary leading-relaxed">
          <p>
            To ensure complete transparency for travelers across India:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-slate-300">
            <li>
              <strong>Directly Managed Parks:</strong> Partner destinations where Adventure Maharashtra operates the live booking engine, real-time turnstile inventory, and instant QR verification.
            </li>
            <li>
              <strong>Authorized Representative Listings:</strong> Parks featured with verified operational hours, package guides, and official contact pathways, clearly marked as third-party listings.
            </li>
          </ul>
          <p className="text-xs text-content-muted pt-2">
            We do not claim fictional platform affiliations or fabricate business statistics. All data presented during development is explicitly tagged.
          </p>
        </div>
      </div>
    </div>
  );
}
