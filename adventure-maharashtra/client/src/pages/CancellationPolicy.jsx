import React from 'react';
import { RotateCcw, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CancellationPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider flex items-center justify-center gap-1.5">
          <RotateCcw className="w-4 h-4" />
          <span>Fair & Transparent</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Cancellation & Refund Policy
        </h1>
        <p className="text-sm sm:text-base text-content-secondary max-w-xl mx-auto">
          We understand travel plans can shift. Review our standard tiered cancellation rules and refund processing timelines.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tier Table */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
          <h3 className="text-xl font-bold text-white">Standard Cancellation Tiers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-content-muted uppercase tracking-wider text-[11px]">
                  <th className="pb-3">Cancellation Timing</th>
                  <th className="pb-3">Refund Percentage</th>
                  <th className="pb-3">Processing Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-slate-200">
                <tr>
                  <td className="py-3.5 font-semibold text-white">More than 48 hours before visit date</td>
                  <td className="py-3.5 text-emerald-400 font-bold">100% Refund</td>
                  <td className="py-3.5 text-content-muted">Nil (Full Refund)</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-white">Between 24 to 48 hours before visit date</td>
                  <td className="py-3.5 text-brand-amber font-bold">50% Refund</td>
                  <td className="py-3.5 text-content-muted">50% park retention</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold text-white">Less than 24 hours / No Show</td>
                  <td className="py-3.5 text-rose-400 font-bold">Non-Refundable</td>
                  <td className="py-3.5 text-content-muted">100% non-refundable</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Inclement Weather */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-3">
          <h3 className="text-lg font-bold text-white">Inclement Weather & Force Majeure</h3>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            In the event that severe monsoon weather, thunder, or power interruptions require a park to cease ride operations for over 4 continuous hours, visitors holding confirmed digital passes will be issued a complimentary raincheck pass valid for 60 calendar days.
          </p>
        </div>

        {/* Processing Timelines */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-3">
          <h3 className="text-lg font-bold text-white">Refund Processing Channels</h3>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Approved refunds are credited directly to the original payment source (UPI, Netbanking, or Card) within 3 to 5 business days in accordance with Reserve Bank of India and payment gateway turnaround guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
