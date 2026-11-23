import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Clock, ShieldCheck, Ticket, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { getCoupons, validateCoupon } from '../services/api';
import { formatDate, formatPrice } from '../utils/formatters';
import { OFFERS_DATA } from '../data/offersData';

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  // Interactive coupon tester state
  const [testCode, setTestCode] = useState('ADVENTURE25');
  const [testAmountRs, setTestAmountRs] = useState(2000);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOffers = async () => {
      try {
        const res = await getCoupons();
        if (isMounted && res && res.success && res.data.length > 0) {
          setCoupons(res.data);
        } else {
          setCoupons(OFFERS_DATA);
        }
      } catch (err) {
        console.warn('Fallback to local offers data:', err);
        if (isMounted) setCoupons(OFFERS_DATA);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOffers();
    return () => { isMounted = false; };
  }, []);

  const handleCopy = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTestCode(code);
      setTimeout(() => setCopiedCode(''), 2500);
    }
  };

  const handleValidateTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await validateCoupon({
        code: testCode,
        subtotalPaise: testAmountRs * 100,
        guestCount: 2,
        visitDate: new Date().toISOString()
      });
      setTestResult(res);
    } catch (err) {
      setTestResult({
        valid: false,
        message: err.message || 'Coupon verification failed.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-brand-amber uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Tag className="w-4 h-4" />
          <span>Active Discounts & Coupons</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Special Offers & Promotional Deals
        </h1>
        <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
          Save on theme parks, water slides, and extreme adventure passes across Maharashtra. All coupons are verified authoritatively by our server to guarantee your discount.
        </p>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {coupons.map((offer) => (
          <div
            key={offer._id || offer.id}
            className="glass-card rounded-3xl border border-border-subtle hover:border-brand-cyan/40 p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-amber/20 text-brand-amber border border-brand-amber/30">
                  {offer.badge || 'Verified Deal'}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-content-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Valid till {formatDate(offer.validUntil)}</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white group-hover:text-brand-cyan transition-colors">
                {offer.title}
              </h3>
              <p className="text-sm font-semibold text-brand-cyan">
                {offer.tagline || (offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% Instant Discount` : `Flat ₹${(offer.discountValue || 0)/100} Off`)}
              </p>
              <p className="text-xs text-content-secondary leading-relaxed">
                {offer.description}
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle space-y-4">
              {/* Coupon Code Box */}
              <div className="flex items-center justify-between gap-3 bg-[#080F1D] p-3 rounded-2xl border border-dashed border-border-subtle">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-content-muted">Coupon Code</span>
                  <span className="text-lg font-black tracking-widest text-white">{offer.code}</span>
                </div>

                <button
                  onClick={() => handleCopy(offer.code)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-slate-950 transition-all flex items-center gap-1.5 border border-brand-cyan/30"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-content-muted leading-relaxed">
                <span className="font-medium text-slate-400">Terms: </span>
                {offer.terms || 'Valid on confirmed online bookings. Subject to standard park terms.'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Server Coupon Calculator */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle max-w-3xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider block">
            Interactive Verification
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Test Coupon Eligibility
          </h2>
          <p className="text-xs text-content-secondary mt-1">
            Validate coupon terms against subtotal amount directly with our server pricing API.
          </p>
        </div>

        <form onSubmit={handleValidateTest} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-content-muted uppercase">Promo Code</label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              placeholder="e.g. ADVENTURE25"
              className="w-full bg-[#101A2D] text-white uppercase font-mono px-3.5 py-2.5 rounded-xl border border-border-subtle text-xs focus:outline-none focus:border-brand-cyan font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-content-muted uppercase">Cart Subtotal (₹)</label>
            <input
              type="number"
              value={testAmountRs}
              onChange={(e) => setTestAmountRs(Number(e.target.value))}
              min={100}
              step={100}
              className="w-full bg-[#101A2D] text-white px-3.5 py-2.5 rounded-xl border border-border-subtle text-xs focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <button
            type="submit"
            disabled={testing}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white transition-all shadow-glow-cyan/20 disabled:opacity-50"
          >
            {testing ? 'Verifying...' : 'Validate Discount'}
          </button>
        </form>

        {testResult && (
          <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            testResult.valid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {testResult.valid ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <span className="font-bold block">
                {testResult.valid ? 'Coupon Applied Successfully!' : 'Coupon Ineligible'}
              </span>
              <p>{testResult.message}</p>
              {testResult.valid && (
                <div className="pt-2 text-white font-semibold flex items-center justify-between">
                  <span>Discount Amount:</span>
                  <span className="text-brand-amber font-mono text-sm">
                    {formatPrice(testResult.data?.discountAmountPaise || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
