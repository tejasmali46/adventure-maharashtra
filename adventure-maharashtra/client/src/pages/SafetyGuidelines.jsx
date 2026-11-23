import React from 'react';
import { ShieldCheck, AlertCircle, HeartPulse, HardHat, Waves, UserCheck } from 'lucide-react';

export default function SafetyGuidelines() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold text-brand-amber uppercase tracking-wider flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Guest Well-being</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Safety & Health Guidelines
        </h1>
        <p className="text-sm sm:text-base text-content-secondary max-w-xl mx-auto">
          Adventures are thrilling when safety comes first. Review the standardized protocols enforced across all partner parks in Maharashtra.
        </p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Waves className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Water Parks & Wave Pool Protocols</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-content-secondary pl-4 list-disc">
            <li>Appropriate swimwear (100% Lycra or Synthetic Nylon) is strictly mandatory on all slides. Cotton apparel is banned on water chutes due to friction and drainage hazards.</li>
            <li>Life jackets are provided free of charge and are compulsory for non-swimmers and children in deep wave pool sections.</li>
            <li>Certified lifeguards are stationed at all slide exits and pool basins; guest compliance with whistle commands is mandatory.</li>
          </ul>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
              <HardHat className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">High-Altitude & Extreme Adventures (Zipline, Bungee, Ropes)</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-content-secondary pl-4 list-disc">
            <li>Enclosed sports footwear with non-slip rubber soles is compulsory. Sandals, flip-flops, crocs, or loose jewelry are prohibited.</li>
            <li>All harnesses, carabiners, and dual-pulley systems are rated to CE/UIAA international climbing standards and undergo daily pre-opening inspection.</li>
            <li>Weight limits for aerial activities typically range from 35 kg minimum to 110 kg maximum.</li>
          </ul>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Medical Conditions & Ride Restrictions</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-content-secondary pl-4 list-disc">
            <li>Expectant mothers and individuals with high blood pressure, neck or back injuries, or recent surgeries must avoid high-G rollercoasters and drop towers.</li>
            <li>First-aid and emergency paramedic teams equipped with AEDs are present on-site during operational hours.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
