import React, { useState } from 'react';
import { 
  ShieldCheck, CreditCard, Smartphone, Building, 
  X, CheckCircle2, AlertCircle, Lock, Zap, ArrowRight, Loader2
} from 'lucide-react';
import { verifyPayment } from '../services/api';

export default function PaymentModal({
  isOpen,
  onClose,
  orderData,
  bookingId,
  onSuccess
}) {
  if (!isOpen || !orderData) return null;

  const [activeMethod, setActiveMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('traveler@oksbi');
  const [cardData, setCardData] = useState({
    number: '4532 •••• •••• 8821',
    name: 'AARAV DESHMUKH',
    expiry: '09/28',
    cvv: '821'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const amountRupees = Math.round(orderData.amountPaise / 100);

  const handlePay = async (simulateFailure = false) => {
    setProcessing(true);
    setError(null);

    try {
      const idempotencyKey = `idemp_${orderData.orderId}_${Date.now()}`;
      
      let payload;
      if (simulateFailure) {
        payload = {
          bookingId,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_fraud_${Date.now()}`,
          razorpay_signature: 'invalid_tampered_signature_hash',
          method: activeMethod,
          idempotencyKey
        };
      } else if (orderData.sandboxTestCredentials) {
        payload = {
          bookingId,
          ...orderData.sandboxTestCredentials,
          method: activeMethod,
          idempotencyKey
        };
      } else {
        payload = {
          bookingId,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'mock_sig',
          method: activeMethod,
          idempotencyKey
        };
      }

      await new Promise((r) => setTimeout(r, 650));

      const res = await verifyPayment(payload);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Payment authorization failed. Please try an alternate method.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/20 p-6 max-h-[95vh] overflow-y-auto space-y-5 shadow-2xl relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan p-0.5 flex items-center justify-center shadow-glow-cyan">
              <div className="w-full h-full bg-[#080F1D] rounded-[10px] flex items-center justify-center text-brand-cyan">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Secure Payment Gateway</h2>
              <span className="text-[10px] text-content-muted block">
                Ref: {orderData.bookingReference} &bull; Order: {orderData.orderId.slice(0, 18)}...
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount to Pay Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-blue/20 via-brand-cyan/15 to-transparent border border-brand-cyan/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-cyan tracking-wider block">
              Total Amount Due
            </span>
            <div className="text-2xl font-black text-white">
              ₹{amountRupees.toLocaleString('en-IN')}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            256-Bit SSL
          </span>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'UPI', label: 'Instant UPI', icon: Smartphone },
            { id: 'CARD', label: 'Debit / Credit', icon: CreditCard },
            { id: 'NET_BANKING', label: 'NetBanking', icon: Building }
          ].map((m) => {
            const Icon = m.icon;
            const isActive = activeMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setActiveMethod(m.id);
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isActive
                    ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan shadow-sm font-bold'
                    : 'border-border-subtle bg-white/5 text-content-secondary hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Form per Payment Method */}
        <div className="p-4 rounded-2xl bg-[#080F1D]/80 border border-border-subtle space-y-3">
          {activeMethod === 'UPI' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-content-muted block mb-1">
                  Virtual Payment Address (VPA / UPI ID)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div className="flex gap-2">
                {['@okhdfcbank', '@okaxis', '@paytm'].map((suf) => (
                  <button
                    key={suf}
                    type="button"
                    onClick={() => {
                      setUpiId((prev) => prev.split('@')[0] + suf);
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                  >
                    {suf}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMethod === 'CARD' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-content-muted block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-content-muted block mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-content-muted block mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength="4"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>
            </div>
          )}

          {activeMethod === 'NET_BANKING' && (
            <div>
              <label className="text-[11px] font-semibold text-content-muted block mb-1">Select Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full bg-[#101A2D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-cyan"
              >
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            disabled={processing}
            onClick={() => handlePay(false)}
            className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-brand-cyan via-sky-400 to-brand-blue text-slate-950 hover:text-white transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Payment...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>PAY ₹{amountRupees.toLocaleString('en-IN')} INSTANTLY</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={() => handlePay(true)}
            className="w-full py-2 rounded-xl text-[11px] font-semibold text-content-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            [Test Mode] Simulate Failed Signature Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
