import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="bg-brand-amber/10 border-b border-brand-amber/20 px-4 py-2 text-xs text-brand-amber flex items-center justify-center gap-2 text-center">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
      <span>
        <strong>Demo Preview Mode:</strong> Displaying curated Maharashtra park experiences with simulated live pricing & availability.
      </span>
    </div>
  );
}
