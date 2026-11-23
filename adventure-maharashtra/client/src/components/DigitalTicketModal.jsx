import React, { useRef, useState } from 'react';
import { 
  Ticket, Calendar, Users, MapPin, CheckCircle2, AlertCircle, 
  Printer, X, ShieldCheck, Zap, Download, Sparkles, Copy, Check
} from 'lucide-react';

export default function DigitalTicketModal({ isOpen, onClose, ticket, booking }) {
  if (!isOpen || (!ticket && !booking)) return null;

  const [copied, setCopied] = useState(false);
  const ticketRef = ticket?.ticketReference || `TK-${booking?.bookingReference}`;
  const park = ticket?.park || booking?.park;
  const visitDate = ticket?.visitDate || booking?.visitDate;
  const packageSnapshot = ticket?.booking?.packageSnapshot || booking?.packageSnapshot;
  const customer = ticket?.booking?.customerDetails || booking?.customerDetails;
  const totalAdmissions = ticket?.totalAdmissions || (
    (booking?.visitorQuantities?.adults || 0) + 
    (booking?.visitorQuantities?.children || 0) + 
    (booking?.visitorQuantities?.seniors || 0)
  ) || 1;
  const admissionsRedeemed = ticket?.admissionsRedeemed || 0;
  const isFullyRedeemed = ticket?.isFullyRedeemed || (booking?.bookingStatus === 'CHECKED_IN');
  const qrCodeDataUrl = ticket?.qrCodeDataUrl;

  const dateFormatted = visitDate ? new Date(visitDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : 'Scheduled Date';

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
        
        {/* TOP SECURITY ACCENT */}
        <div className="h-2.5 bg-gradient-to-r from-brand-cyan via-purple-500 to-brand-amber animate-pulse" />

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-content-secondary hover:text-white transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* HEADER */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Turnstile Gate Pass</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">{park?.name || 'Adventure Park'}</h2>
            <p className="text-xs text-content-secondary flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-cyan" />
              <span>{park?.city || 'Maharashtra'}, India</span>
            </p>
          </div>

          {/* PASS CARD BODY */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 text-center relative overflow-hidden">
            
            {/* STATUS BADGE */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-content-secondary tracking-wider">
                {ticketRef}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                isFullyRedeemed 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : admissionsRedeemed > 0 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {isFullyRedeemed ? 'Fully Redeemed' : admissionsRedeemed > 0 ? `Admitted ${admissionsRedeemed}/${totalAdmissions}` : 'Valid Pass'}
              </span>
            </div>

            {/* QR CODE CONTAINER */}
            <div className="w-48 h-48 mx-auto p-3 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-brand-cyan/10">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Gate Pass ${ticketRef}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-2 text-center text-slate-800">
                  <Ticket className="w-10 h-10 text-slate-400 mb-1" />
                  <span className="text-[10px] font-mono font-bold">{ticketRef}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-content-secondary">
              Scan this QR code under turnstile readers for rapid optical gate admission.
            </p>

            {/* PASS METADATA GRID */}
            <div className="grid grid-cols-2 gap-3 text-left pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Visit Date</span>
                <span className="font-bold text-white">{dateFormatted}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Total Admissions</span>
                <span className="font-bold text-white">{totalAdmissions} Visitors</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Package Tier</span>
                <span className="font-bold text-brand-cyan truncate block">{packageSnapshot?.name || 'Standard Pass'}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Lead Guest</span>
                <span className="font-bold text-white truncate block">{customer?.name || 'Valued Guest'}</span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code Copied' : 'Copy Reference'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-cyan text-slate-950 hover:bg-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
