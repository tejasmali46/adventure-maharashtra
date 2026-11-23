import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Ticket, Calendar, Users, MapPin, CheckCircle2, AlertCircle, 
  Printer, ArrowLeft, ShieldCheck, Zap, Download, Sparkles, Copy, Check
} from 'lucide-react';
import { getTicketByReference } from '../services/api';

export default function DigitalTicket() {
  const { ticketRef } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getTicketByReference(ticketRef);
        if (res.success) {
          setTicket(res.data);
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve ticket pass.');
      } finally {
        setLoading(false);
      }
    };
    if (ticketRef) fetchTicket();
  }, [ticketRef]);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket?.ticketReference || ticketRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-content-secondary">Generating secure turnstile pass...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-md mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Gate Pass Unavailable</h2>
        <p className="text-xs text-content-secondary mb-6">{error || 'Ticket not found'}</p>
        <Link to="/my-bookings" className="px-5 py-2.5 rounded-xl bg-brand-cyan text-slate-950 font-bold text-xs">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  const park = ticket.park;
  const booking = ticket.booking;
  const isFullyRedeemed = ticket.isFullyRedeemed;
  const totalAdmissions = ticket.totalAdmissions;
  const admissionsRedeemed = ticket.admissionsRedeemed || 0;
  const dateFormatted = new Date(ticket.visitDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Bookings</span>
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-border-subtle text-xs font-semibold"
        >
          <Printer className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Print Pass</span>
        </button>
      </div>

      <div className="rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl relative">
        <div className="h-2.5 bg-gradient-to-r from-brand-cyan via-purple-500 to-brand-amber" />

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Turnstile Gate Pass</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{park?.name}</h1>
            <p className="text-xs text-content-secondary flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-cyan" />
              <span>{park?.city}, Maharashtra</span>
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 text-center">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-content-secondary tracking-wider">
                {ticket.ticketReference}
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

            <div className="w-52 h-52 mx-auto p-3 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-brand-cyan/10">
              {ticket.qrCodeDataUrl ? (
                <img
                  src={ticket.qrCodeDataUrl}
                  alt={`QR Gate Pass ${ticket.ticketReference}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-2 text-center text-slate-800">
                  <Ticket className="w-10 h-10 text-slate-400 mb-1" />
                  <span className="text-[10px] font-mono font-bold">{ticket.ticketReference}</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-content-muted">
              Scan this QR code under turnstile scanners for automated optical gate admission.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-left text-xs">
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Pass Tier</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {booking?.packageSnapshot?.name || 'Standard Pass'}
                  {booking?.packageSnapshot?.includesExpress && (
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  )}
                </span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Valid On</span>
                <span className="font-bold text-white">{dateFormatted}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Admissions</span>
                <span className="font-bold text-white">{totalAdmissions} Visitors</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Lead Passenger</span>
                <span className="font-bold text-white truncate block">{booking?.customerDetails?.name || 'Valued Guest'}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-xs text-brand-cyan flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-content-secondary leading-relaxed">
              <strong className="text-white">Gate Admission Rules:</strong> Present this pass at Turnstile Lanes. Government-issued photo ID of lead guest may be required for senior or youth concessions.
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Reference Copied' : 'Copy Reference'}</span>
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
