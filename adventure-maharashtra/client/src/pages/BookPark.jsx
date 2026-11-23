import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Users, Ticket, Plus, Minus, ArrowLeft, ArrowRight, 
  CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Zap, Tag, Clock, MapPin
} from 'lucide-react';
import { getParkBySlug, checkParkAvailability, calculateBookingPricing, createBooking, createPaymentOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const CURATED_ADDONS = [
  { id: 'addon-locker', name: 'Secure Electronic Locker Rental', priceRupees: 200, pricePaise: 20000, desc: 'Keyless RFID wristband locker' },
  { id: 'addon-meal', name: 'Multi-Cuisine Buffet Meal Voucher', priceRupees: 350, pricePaise: 35000, desc: 'Unlimited lunch & beverage pass' },
  { id: 'addon-photo', name: 'Action Rollercoaster Photo Pass', priceRupees: 150, pricePaise: 15000, desc: 'High-res digital download of on-ride photos' },
  { id: 'addon-swim', name: 'Certified Nylon Swimwear Rental', priceRupees: 120, pricePaise: 12000, desc: 'Hygienically sanitized park approved wear' }
];

export default function BookPark() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [park, setPark] = useState(null);
  const [loadingPark, setLoadingPark] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [visitDate, setVisitDate] = useState(defaultDateStr);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [quantities, setQuantities] = useState({ adults: 2, children: 0, seniors: 0 });

  // Addons: { [addonId]: quantity }
  const [selectedAddons, setSelectedAddons] = useState({});

  // Customer Contact
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Server Calculated Pricing
  const [pricing, setPricing] = useState(null);
  const [calculatingPricing, setCalculatingPricing] = useState(false);

  // Submitting / Created Booking & Payments
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // 1. Fetch Park Details
  useEffect(() => {
    const fetchPark = async () => {
      try {
        setLoadingPark(true);
        setError(null);
        const res = await getParkBySlug(slug);
        if (res.success && res.data) {
          setPark(res.data);
          if (res.data.packages && res.data.packages.length > 0) {
            setSelectedPackage(res.data.packages[0]);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load park details.');
      } finally {
        setLoadingPark(false);
      }
    };
    fetchPark();
  }, [slug]);

  // 2. Check Availability when Date Changes
  useEffect(() => {
    if (!slug || !visitDate) return;
    const verifyDate = async () => {
      try {
        setCheckingAvailability(true);
        const res = await checkParkAvailability(slug, visitDate);
        if (res.success) {
          setAvailability(res);
        }
      } catch (err) {
        console.error('Availability check failed:', err);
      } finally {
        setCheckingAvailability(false);
      }
    };
    verifyDate();
  }, [slug, visitDate]);

  // 3. Recalculate Pricing from Server
  const fetchPricing = async (couponToUse = appliedCoupon) => {
    if (!park || !selectedPackage || !visitDate) return;

    try {
      setCalculatingPricing(true);
      const addonsPayload = Object.entries(selectedAddons)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = CURATED_ADDONS.find((a) => a.id === id);
          return {
            name: item.name,
            pricePaise: item.pricePaise,
            quantity: qty
          };
        });

      const payload = {
        parkId: park._id,
        packageId: selectedPackage._id,
        visitDate,
        visitorQuantities: quantities,
        addons: addonsPayload,
        couponCode: couponToUse
      };

      const res = await calculateBookingPricing(payload);
      if (res.success) {
        setPricing(res.data);
      }
    } catch (err) {
      console.error('Pricing calculation error:', err);
    } finally {
      setCalculatingPricing(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [park, selectedPackage, visitDate, quantities, selectedAddons, appliedCoupon]);

  const handleQuantityChange = (category, delta) => {
    setQuantities((prev) => {
      const current = prev[category] || 0;
      const updated = Math.max(0, current + delta);
      // Ensure at least 1 total pass exists
      const newTotal = (category === 'adults' ? updated : prev.adults) + 
                       (category === 'children' ? updated : prev.children) + 
                       (category === 'seniors' ? updated : prev.seniors);
      if (newTotal === 0 && delta < 0) return prev;
      return { ...prev, [category]: updated };
    });
  };

  const handleAddonToggle = (addonId, delta) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [addonId]: next };
    });
  };

  const applyCouponCode = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      setAppliedCoupon(couponInput.trim().toUpperCase());
    }
  };

  const clearCoupon = () => {
    setAppliedCoupon('');
    setCouponInput('');
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const addonsPayload = Object.entries(selectedAddons)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = CURATED_ADDONS.find((a) => a.id === id);
          return {
            name: item.name,
            pricePaise: item.pricePaise,
            quantity: qty
          };
        });

      const payload = {
        parkId: park._id,
        packageId: selectedPackage._id,
        visitDate,
        visitorQuantities: quantities,
        addons: addonsPayload,
        customerDetails,
        couponCode: appliedCoupon
      };

      const res = await createBooking(payload);
      if (res.success && res.data) {
        const booking = res.data;
        setPendingBookingId(booking._id);
        
        // Initiate Razorpay / Sandbox Payment Order
        const orderRes = await createPaymentOrder({ bookingId: booking._id });
        if (orderRes.success && orderRes.data) {
          setCurrentOrderData(orderRes.data);
          setPaymentModalOpen(true);
        } else {
          throw new Error(orderRes.error || 'Failed to initiate payment gateway order.');
        }
      }
    } catch (err) {
      setError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (verifiedData) => {
    setPaymentResult(verifiedData);
    if (verifiedData.booking) {
      setConfirmedBooking(verifiedData.booking);
    }
    setPaymentModalOpen(false);
    setCurrentStep(5); // Receipt Step
  };
  if (loadingPark) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-content-secondary">Preparing booking gateway for destination...</p>
      </div>
    );
  }

  if (error && !park) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-lg mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Destination Not Found</h2>
        <p className="text-xs text-content-secondary mb-6">{error}</p>
        <Link to="/parks" className="px-5 py-2.5 rounded-xl bg-brand-cyan text-slate-950 font-bold text-xs">
          Browse Parks Catalog
        </Link>
      </div>
    );
  }

  // STEP 5: BOOKING RECEIPT & CONFIRMATION
  if (currentStep === 5 && confirmedBooking) {
    const totalRupees = Math.round(confirmedBooking.priceBreakdown.totalAmountPaise / 100);
    const dateFormatted = new Date(confirmedBooking.visitDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
      <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="glass-panel rounded-3xl border border-emerald-500/30 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-brand-cyan" />
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-glow-cyan">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Booking Confirmed &amp; Verified
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Adventure Awaits You!</h1>
          <p className="text-xs text-content-secondary max-w-md mx-auto mt-2">
            Your admission reservation has been confirmed. Present your booking reference or digital ticket at the entry gates.
          </p>

          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-border-subtle max-w-lg mx-auto text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <span className="text-[10px] uppercase font-bold text-content-muted">Booking Reference</span>
                <p className="text-xl font-mono font-extrabold text-brand-cyan tracking-wider">
                  {confirmedBooking.bookingReference}
                </p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {confirmedBooking.bookingStatus === 'confirmed' ? 'CONFIRMED' : 'PAYMENT VERIFIED'}
                </span>
                <span className="block text-[10px] text-content-muted mt-1">
                  Payment: {confirmedBooking.paymentStatus?.toUpperCase() || 'PAID'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Destination</span>
                <span className="font-bold text-white">{park?.name}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Date of Visit</span>
                <span className="font-bold text-white">{dateFormatted}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Pass Type</span>
                <span className="font-bold text-white">{confirmedBooking.packageSnapshot.name}</span>
              </div>
              <div>
                <span className="text-content-muted block text-[10px] uppercase font-semibold">Visitors</span>
                <span className="font-bold text-white">
                  {confirmedBooking.visitorQuantities.adults} Adults
                  {confirmedBooking.visitorQuantities.children > 0 ? `, ${confirmedBooking.visitorQuantities.children} Kids` : ''}
                  {confirmedBooking.visitorQuantities.seniors > 0 ? `, ${confirmedBooking.visitorQuantities.seniors} Seniors` : ''}
                </span>
              </div>
              {paymentResult?.payment?.paymentId && (
                <div className="col-span-2 pt-2 border-t border-border-subtle">
                  <span className="text-content-muted block text-[10px] uppercase font-semibold">Payment Transaction ID</span>
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">
                    {paymentResult.payment.paymentId} ({paymentResult.payment.method || 'GATEWAY'})
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
              <span className="text-xs text-content-secondary">Total Amount Paid:</span>
              <span className="text-xl font-extrabold text-white">₹{totalRupees.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/tickets/TK-${confirmedBooking.bookingReference}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white transition-all shadow-glow-cyan flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4 stroke-[2.5]" />
              <span>Open Digital QR Pass</span>
            </Link>
            <Link
              to="/my-bookings"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs bg-white/10 text-white hover:bg-white/20 transition-all border border-border-subtle"
            >
              View in My Bookings
            </Link>
            <Link
              to="/parks"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs bg-white/5 hover:bg-white/10 text-slate-200 border border-border-subtle transition-colors"
            >
              Explore More Parks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/parks/${park?.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {park?.name}</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white">Reserve Your Adventure Passes</h1>
        <p className="text-xs text-content-secondary mt-1">
          Instant booking with transparent pricing, official entry guarantees, and free cancellation up to 48 hours prior.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { num: 1, label: 'Date & Passes' },
          { num: 2, label: 'Add-ons & Perks' },
          { num: 3, label: 'Guest Details' },
          { num: 4, label: 'Review & Pay' }
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all ${
              currentStep === s.num
                ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan shadow'
                : currentStep > s.num
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-border-subtle text-content-muted'
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-wider">Step {s.num}</span>
            <span className="text-xs font-semibold">{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && (
            <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-cyan" />
                <span>Select Date of Visit</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    min={defaultDateStr}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="flex items-center">
                  {checkingAvailability ? (
                    <span className="text-xs text-content-secondary">Checking schedule...</span>
                  ) : availability ? (
                    <div className="p-3 rounded-xl bg-white/5 border border-border-subtle w-full text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>{availability.dayOfWeek} Schedule</span>
                      </div>
                      <span className="text-[11px] text-content-secondary block mt-0.5">
                        Hours: {availability.operatingHours?.open} - {availability.operatingHours?.close}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>Choose Your Pass Package</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {park.packages?.map((pkg) => {
                    const isSelected = selectedPackage?._id === pkg._id;
                    const priceRupees = Math.round(pkg.pricePaise / 100);

                    return (
                      <div
                        key={pkg._id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg'
                            : 'bg-white/5 border-border-subtle text-content-secondary hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-white">{pkg.name}</span>
                            {pkg.includesExpress && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-brand-amber/20 text-brand-amber">
                                EXPRESS
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-content-muted line-clamp-2">{pkg.description}</p>
                        </div>

                        <div className="mt-4 pt-2 border-t border-white/10 flex items-baseline justify-between">
                          <span className="text-[10px] text-content-muted">Base Rate:</span>
                          <span className="text-base font-extrabold text-white">
                            ₹{priceRupees.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-cyan" />
                  <span>Select Number of Visitors</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border-subtle">
                    <div>
                      <span className="font-bold text-xs text-white block">Adults</span>
                      <span className="text-[10px] text-content-muted">Above 4.5ft height / General</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange('adults', -1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm text-white w-4 text-center">{quantities.adults}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange('adults', 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border-subtle">
                    <div>
                      <span className="font-bold text-xs text-white block">Children</span>
                      <span className="text-[10px] text-content-muted">Between 3.3ft - 4.5ft (25% off)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange('children', -1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm text-white w-4 text-center">{quantities.children}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange('children', 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border-subtle">
                    <div>
                      <span className="font-bold text-xs text-white block">Senior Citizens</span>
                      <span className="text-[10px] text-content-muted">Ages 60+ with photo ID (30% off)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange('seniors', -1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm text-white w-4 text-center">{quantities.seniors}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange('seniors', 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-white transition-colors"
                >
                  <span>Continue to Add-ons</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-amber" />
                <span>Enhance Your Park Experience</span>
              </h2>

              <div className="space-y-3">
                {CURATED_ADDONS.map((addon) => {
                  const qty = selectedAddons[addon.id] || 0;
                  return (
                    <div
                      key={addon.id}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                        qty > 0 ? 'bg-brand-cyan/10 border-brand-cyan/30 text-white' : 'bg-white/5 border-border-subtle text-content-secondary'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{addon.name}</span>
                          <span className="font-bold text-xs text-brand-cyan">₹{addon.priceRupees}</span>
                        </div>
                        <p className="text-[11px] text-content-muted mt-0.5">{addon.desc}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddonToggle(addon.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-xs text-white w-4 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleAddonToggle(addon.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-content-secondary hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-white transition-colors"
                >
                  <span>Continue to Guest Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-blue" />
                <span>Primary Guest Contact Information</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                    Lead Passenger Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    placeholder="Enter full name as per Govt. ID"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                      Email for Digital Ticket <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                      Mobile Number (SMS Updates) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-content-secondary hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-white transition-colors"
                >
                  <span>Review &amp; Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Review &amp; Confirm Reservation</span>
              </h2>

              <div className="p-4 rounded-xl bg-white/5 border border-border-subtle space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-content-secondary">Destination:</span>
                  <span className="font-bold text-white">{park?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-secondary">Visit Date:</span>
                  <span className="font-bold text-white">{visitDate} ({pricing?.dayName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-secondary">Pass Package:</span>
                  <span className="font-bold text-white">{selectedPackage?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-secondary">Lead Passenger:</span>
                  <span className="font-bold text-white">{customerDetails.name} ({customerDetails.phone})</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-border-subtle">
                <span className="block text-xs font-semibold text-content-secondary mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Have a Promotional Voucher or Student Code?</span>
                </span>
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <span className="font-bold">Code "{appliedCoupon}" Applied!</span>
                    <button
                      type="button"
                      onClick={clearCoupon}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={applyCouponCode} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. STUDENT20, ADVENTURE25, GROUP500"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-border-subtle text-xs text-white uppercase focus:outline-none focus:border-brand-cyan"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-content-secondary hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Initiating Gateway...' : 'Proceed to Secure Payment'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: REAL-TIME PRICING BREAKDOWN */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-border-subtle sticky top-28 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-border-subtle">
              Fare Summary
            </h3>

            {calculatingPricing ? (
              <div className="py-8 text-center text-xs text-content-secondary">
                <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Computing real-time fare...</span>
              </div>
            ) : pricing ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-content-secondary">
                  <span>Passes ({pricing.totalPasses} visitors):</span>
                  <span className="font-semibold text-white">
                    ₹{Math.round(pricing.basePassesPaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                {pricing.isWeekend && pricing.weekendSurgePaise > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Weekend Surge (10%):
                    </span>
                    <span className="font-semibold">
                      +₹{Math.round(pricing.weekendSurgePaise / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {pricing.addonsPaise > 0 && (
                  <div className="flex justify-between text-content-secondary">
                    <span>Add-ons &amp; Perks:</span>
                    <span className="font-semibold text-white">
                      +₹{Math.round(pricing.addonsPaise / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {pricing.discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount ({pricing.couponApplied?.code}):</span>
                    <span>-₹{Math.round(pricing.discountPaise / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-content-secondary pt-2 border-t border-border-subtle">
                  <span>GST (18% Statutory Tax):</span>
                  <span className="font-semibold text-white">
                    +₹{Math.round(pricing.taxPaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-baseline justify-between">
                  <span className="text-sm font-bold text-white">Grand Total:</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-brand-cyan">
                      ₹{pricing.formatted.totalRupees.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-content-muted block">Includes all taxes &amp; fees</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-border-subtle text-[11px] text-content-muted space-y-1">
              <p className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>100% Refundable up to 48 hours</span>
              </p>
              <p className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-brand-cyan" />
                <span>Instant QR pass confirmation</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECURE PAYMENT MODAL */}
      {paymentModalOpen && currentOrderData && (
        <PaymentModal
          isOpen={paymentModalOpen}
          orderData={currentOrderData}
          bookingId={pendingBookingId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentModalOpen(false)}
        />
      )}
    </div>
  );
}