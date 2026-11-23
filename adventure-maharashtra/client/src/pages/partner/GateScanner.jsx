import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, CheckCircle2, AlertCircle, ShieldCheck, Zap, 
  MapPin, Clock, Users, ArrowRight, RotateCcw, Volume2, VolumeX, Sparkles
} from 'lucide-react';
import { getMyParks, scanGateTicket, getParkScanHistory } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function GateScanner() {
  const { user } = useAuth();
  const [parks, setParks] = useState([]);
  const [selectedParkId, setSelectedParkId] = useState('');
  const [gateNumber, setGateNumber] = useState('Gate 01 - Main Turnstile');
  const [countToRedeem, setCountToRedeem] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scan input
  const [scanInput, setScanInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // History feed
  const [scanHistory, setScanHistory] = useState([]);
  const [totalScansToday, setTotalScansToday] = useState(0);

  const inputRef = useRef(null);

  // Audio synthesis for turnstile auditory confirmation
  const playSound = (isSuccess) => {
    if (!soundEnabled || typeof window === 'undefined' || !window.AudioContext) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio playback fallback
    }
  };

  // 1. Fetch Parks for current user / partner
  useEffect(() => {
    const fetchParks = async () => {
      try {
        const res = await getMyParks();
        if (res.success && res.data && res.data.length > 0) {
          setParks(res.data);
          setSelectedParkId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load partner parks:', err);
      }
    };
    fetchParks();
  }, []);

  // 2. Fetch Scan History when park changes
  const fetchHistory = async (parkId) => {
    if (!parkId) return;
    try {
      const res = await getParkScanHistory(parkId);
      if (res.success && res.data) {
        setScanHistory(res.data.recentScans || []);
        setTotalScansToday(res.data.totalScansToday || 0);
      }
    } catch (err) {
      console.error('Failed to load scan history:', err);
    }
  };

  useEffect(() => {
    if (selectedParkId) {
      fetchHistory(selectedParkId);
    }
  }, [selectedParkId]);
  const handleScan = async (overridePayload = null) => {
    const rawVal = overridePayload?.token || scanInput.trim();
    if (!rawVal || !selectedParkId) return;

    setProcessing(true);
    setScanResult(null);
    setScanError(null);

    try {
      const isToken = rawVal.startsWith('qr_token_') || rawVal.length > 20;
      const payload = {
        qrToken: isToken ? rawVal : undefined,
        ticketReference: !isToken ? rawVal : undefined,
        parkId: overridePayload?.parkId || selectedParkId,
        gateNumber,
        countToRedeem: overridePayload?.count || countToRedeem,
        bypassDateCheck: true
      };

      const res = await scanGateTicket(payload);
      if (res.success) {
        setScanResult(res.data);
        playSound(true);
        setScanInput('');
        fetchHistory(selectedParkId);
      }
    } catch (err) {
      const errData = err.response?.data;
      setScanError({
        code: errData?.code || 'SCAN_ERROR',
        message: errData?.message || err.message || 'Validation failed.',
        data: errData?.data
      });
      playSound(false);
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan();
    }
  };

  const currentPark = parks.find((p) => p._id === selectedParkId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan uppercase tracking-wider">
            <Scan className="w-4 h-4" />
            <span>Turnstile Gate Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Turnstile QR Admissions Scanner
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Real-time optical ticket verification, multi-visitor check-in, and instant replay fraud prevention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              soundEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-border-subtle text-content-muted'
            }`}
            title="Toggle Turnstile Audio Chimes"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Audio {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <div className="px-4 py-2 rounded-xl bg-white/5 border border-border-subtle text-right">
            <span className="text-[10px] uppercase font-bold text-content-muted block">Admitted Today</span>
            <span className="text-lg font-mono font-extrabold text-brand-cyan">{totalScansToday}</span>
          </div>
        </div>
      </div>

      {/* GATE CONTROLS CONFIG BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-border-subtle">
        <div>
          <label className="block text-[11px] font-bold text-content-secondary uppercase mb-1">
            Destination Venue
          </label>
          <select
            value={selectedParkId}
            onChange={(e) => setSelectedParkId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
          >
            {parks.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.city})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-content-secondary uppercase mb-1">
            Turnstile Lane
          </label>
          <select
            value={gateNumber}
            onChange={(e) => setGateNumber(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
          >
            <option value="Gate 01 - Main North Turnstile">Gate 01 - Main North Turnstile</option>
            <option value="Gate 02 - Express VIP Lane">Gate 02 - Express VIP Lane</option>
            <option value="Gate 03 - Family &amp; Concessions">Gate 03 - Family &amp; Concessions</option>
            <option value="Gate 04 - East Turnstile">Gate 04 - East Turnstile</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-content-secondary uppercase mb-1">
            Guests Per Scan
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 4, 10].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setCountToRedeem(qty)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  countToRedeem === qty
                    ? 'bg-brand-cyan text-slate-950 font-extrabold shadow-glow-cyan'
                    : 'bg-slate-900 text-content-secondary hover:text-white border border-border-subtle'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SCANNER INPUT & VISUAL MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: SCANNER INPUT */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scan className="w-5 h-5 text-brand-cyan" />
              <span>Barcode / Optical QR Reader</span>
            </h2>

            <div className="space-y-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  placeholder="Scan QR token or type TK-AM-XXXXX-XXXX..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={processing}
                  className="w-full pl-4 pr-24 py-3.5 rounded-xl bg-slate-900 border border-brand-cyan/40 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
                <button
                  type="button"
                  onClick={() => handleScan()}
                  disabled={processing || !scanInput.trim()}
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-brand-cyan text-slate-950 font-bold text-xs hover:bg-white transition-colors disabled:opacity-50"
                >
                  {processing ? 'Validating...' : 'Verify'}
                </button>
              </div>
              <p className="text-[11px] text-content-muted">
                Tip: USB &amp; Bluetooth 2D barcode scanners transmit automatically on Enter key press.
              </p>
            </div>

            {/* QUICK TEST EMULATION BUTTONS */}
            <div className="pt-4 border-t border-border-subtle">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-2">
                Simulate Scans (Sandbox Emulation)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (scanHistory.length > 0) {
                      setScanInput(scanHistory[0].ticketReference);
                    } else {
                      setScanInput('TK-AM-20261025-DEMO');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-content-secondary hover:text-white border border-border-subtle"
                >
                  Load Recent Pass Ref
                </button>
                <button
                  type="button"
                  onClick={() => handleScan({ token: 'INVALID_FRAUDULENT_TOKEN' })}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-semibold text-rose-400 border border-rose-500/30"
                >
                  Simulate Fraud Pass
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME SCAN DECISION DISPLAY */}
        <div>
          {scanResult ? (
            <div className="p-8 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500 text-center space-y-4 shadow-glow-cyan animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                  Turnstile Unlocked • Access Granted
                </span>
                <h3 className="text-3xl font-black text-white mt-1">
                  Welcome, {scanResult.visitorName}!
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-xs text-left grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <div>
                  <span className="text-content-muted block text-[10px] uppercase font-semibold">Pass Type</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    {scanResult.packageName}
                    {scanResult.includesExpress && (
                      <span className="text-[9px] font-extrabold px-1 rounded bg-amber-400/20 text-amber-400">
                        EXPRESS VIP
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-content-muted block text-[10px] uppercase font-semibold">Admitted Now</span>
                  <span className="font-bold text-emerald-400">+{scanResult.admittedNow} Guest(s)</span>
                </div>
                <div>
                  <span className="text-content-muted block text-[10px] uppercase font-semibold">Remaining</span>
                  <span className="font-bold text-white">{scanResult.remainingAdmissions} Guests</span>
                </div>
                <div>
                  <span className="text-content-muted block text-[10px] uppercase font-semibold">Turnstile</span>
                  <span className="font-bold text-white truncate block">{scanResult.gateNumber}</span>
                </div>
              </div>
            </div>
          ) : scanError ? (
            <div className="p-8 rounded-3xl bg-rose-500/10 border-2 border-rose-500 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto shadow-lg">
                <AlertCircle className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block">
                  Access Denied • Turnstile Locked
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {scanError.code === 'ALREADY_REDEEMED' ? 'Pass Already Redeemed!' : 'Invalid Gate Pass'}
                </h3>
                <p className="text-xs text-rose-300 max-w-md mx-auto mt-2 leading-relaxed">
                  {scanError.message}
                </p>
              </div>

              {scanError.data?.lastRedemption && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30 text-xs text-left max-w-sm mx-auto text-content-secondary">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">Previous Admission</span>
                  <span>Gate: {scanError.data.lastRedemption.gateNumber}</span>
                  <span className="block mt-0.5">
                    Time: {new Date(scanError.data.lastRedemption.redeemedAt).toLocaleTimeString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-border-subtle text-center text-content-muted">
              <Scan className="w-16 h-16 mb-3 opacity-30 text-brand-cyan" />
              <h3 className="text-sm font-bold text-slate-300">Ready to Scan</h3>
              <p className="text-xs max-w-xs mt-1">
                Scan barcode or enter ticket reference to activate turnstile admission.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RECENT ADMISSIONS AUDIT FEED */}
      <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-cyan" />
            <span>Turnstile Admissions Audit Log</span>
          </h2>
          <span className="text-xs text-content-muted">Showing latest gate check-ins</span>
        </div>

        {scanHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-content-muted">
            No gate admissions recorded yet today for this destination.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-content-muted border-b border-border-subtle">
                <tr>
                  <th className="pb-2.5 font-bold">Ticket Ref</th>
                  <th className="pb-2.5 font-bold">Visitor Name</th>
                  <th className="pb-2.5 font-bold">Pass Tier</th>
                  <th className="pb-2.5 font-bold">Admissions</th>
                  <th className="pb-2.5 font-bold">Turnstile Gate</th>
                  <th className="pb-2.5 font-bold">Time</th>
                  <th className="pb-2.5 font-bold">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-medium text-slate-300">
                {scanHistory.map((scan, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-mono text-brand-cyan font-bold">{scan.ticketReference}</td>
                    <td className="py-2.5 text-white font-semibold">{scan.visitorName}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1">
                        {scan.packageName}
                        {scan.includesExpress && (
                          <span className="text-[9px] font-bold px-1 rounded bg-amber-400/20 text-amber-400">VIP</span>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">+{scan.redeemedCount}</td>
                    <td className="py-2.5 text-content-secondary">{scan.gateNumber}</td>
                    <td className="py-2.5 text-content-muted">
                      {new Date(scan.redeemedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 text-content-muted">{scan.staffName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}