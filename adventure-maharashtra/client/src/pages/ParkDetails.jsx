import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Clock, Calendar, ShieldCheck, Check, AlertTriangle, 
  Phone, Mail, Globe, Share2, Ticket, ChevronRight, CheckCircle2, 
  Info, Loader2, AlertCircle, MessageSquare, ThumbsUp, X
} from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { getParkBySlug, checkParkAvailability, getParkReviews, createReview } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ParkDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active gallery image
  const [activeImage, setActiveImage] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  
  // Booking panel state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [bookingDate, setBookingDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);

  const { user } = useAuth();
  const [reviewsData, setReviewsData] = useState({ reviews: [], stats: { averageRating: 0, totalReviews: 0, breakdown: [] } });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState(null);

  const fetchReviews = async (parkId) => {
    try {
      setLoadingReviews(true);
      const res = await getParkReviews(parkId);
      if (res.success && res.data) {
        setReviewsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (park?._id) {
      fetchReviews(park._id);
    }
  }, [park?._id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !park?._id) return;
    try {
      setSubmittingReview(true);
      setReviewErrorMsg(null);
      setReviewSuccessMsg(null);
      const res = await createReview({
        parkId: park._id,
        rating: ratingInput,
        comment: commentInput.trim()
      });
      if (res.success) {
        setReviewSuccessMsg(res.message);
        setCommentInput('');
        fetchReviews(park._id);
        setTimeout(() => setReviewModalOpen(false), 1500);
      }
    } catch (err) {
      setReviewErrorMsg(err.response?.data?.message || err.message || 'Review submission failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Fetch Park from Backend
  useEffect(() => {
    let isMounted = true;
    const fetchPark = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getParkBySlug(slug);
        if (isMounted && res && res.success) {
          setPark(res.data);
          setActiveImage(res.data.heroImage);
          if (res.data.packages && res.data.packages.length > 0) {
            setSelectedPackageId(res.data.packages[0]._id || res.data.packages[0].id);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to load destination details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPark();
    return () => { isMounted = false; };
  }, [slug]);

  // Check live availability when booking date changes
  useEffect(() => {
    if (!slug || !bookingDate) return;
    const verifyDate = async () => {
      try {
        const res = await checkParkAvailability(slug, bookingDate);
        if (res && res.success) {
          setAvailabilityInfo(res);
        }
      } catch (err) {
        console.warn('Availability check warning:', err);
      }
    };
    verifyDate();
  }, [slug, bookingDate]);

  // Active package details
  const activePackage = useMemo(() => {
    if (!park || !park.packages || park.packages.length === 0) return null;
    return park.packages.find((pkg) => (pkg._id || pkg.id) === selectedPackageId) || park.packages[0];
  }, [park, selectedPackageId]);

  // Calculate live booking estimate
  const estimatedTotalPaise = useMemo(() => {
    if (!activePackage) return 0;
    const adultPrice = activePackage.visitorCategories?.[0]?.pricePaise || activePackage.pricePaise;
    const childPrice = activePackage.visitorCategories?.[1]?.pricePaise || Math.round(adultPrice * 0.8);
    return (adultCount * adultPrice) + (childCount * childPrice);
  }, [activePackage, adultCount, childCount]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
        <p className="text-sm text-content-secondary">Loading verified park details from database...</p>
      </div>
    );
  }

  if (error || !park) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Destination Not Found</h2>
        <p className="text-sm text-content-secondary">{error || 'The requested park could not be found.'}</p>
        <Link
          to="/parks"
          className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan text-slate-950 hover:bg-sky-400 transition-colors"
        >
          Explore All Parks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-content-muted">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/parks" className="hover:text-white transition-colors">Parks</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white font-medium">{park.name}</span>
      </div>

      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              {park.category}
            </span>
            {park.isDirectManaged ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Direct Platform Partner
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/15">
                Authorized Representative Listing
              </span>
            )}
            <div className="flex items-center gap-1 text-xs font-bold text-brand-amber bg-brand-amber/10 px-2.5 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 fill-brand-amber text-brand-amber" />
              <span>{park.rating?.toFixed(1) || '4.5'}</span>
              <span className="text-content-muted font-normal">({park.reviewCount || 0} Reviews)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {park.name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-content-secondary">
            <MapPin className="w-4 h-4 text-brand-cyan flex-shrink-0" />
            <span>{park.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-border-subtle text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Destination'}</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="relative h-80 sm:h-[480px] rounded-3xl overflow-hidden glass-card border border-border-subtle">
          <img
            src={activeImage || park.heroImage}
            alt={park.name}
            className="w-full h-full object-cover transition-all duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <span className="text-sm text-slate-200 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              {park.tagline}
            </span>
          </div>
        </div>

        {/* Thumbnail Selector */}
        {park.gallery && park.gallery.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveImage(park.heroImage)}
              className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                activeImage === park.heroImage ? 'border-brand-cyan scale-105' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={park.heroImage}
                alt="thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </button>
            {park.gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImage === imgUrl ? 'border-brand-cyan scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`gallery ${idx}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Layout: Left Details + Right Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Two Columns */}
        <div className="lg:col-span-2 space-y-10">
          {/* About Park */}
          <section className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-4">
            <h2 className="text-xl font-bold text-white">About Destination</h2>
            <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
              {park.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[11px] uppercase font-semibold text-content-muted">Operating Hours</span>
                  <span className="text-sm font-bold text-white">{park.operatingHours?.open || '10:00 AM'} - {park.operatingHours?.close || '07:00 PM'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[11px] uppercase font-semibold text-content-muted">Operating Days</span>
                  <span className="text-sm font-bold text-white">{park.operatingHours?.days || 'Monday to Sunday'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Ticket Packages */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Available Passes & Packages</h2>
                <p className="text-xs text-content-secondary">Choose a package to configure visitors and check privileges.</p>
              </div>
            </div>

            <div className="space-y-4">
              {park.packages && park.packages.map((pkg) => {
                const pkgId = pkg._id || pkg.id;
                const isSelected = pkgId === selectedPackageId;
                return (
                  <div
                    key={pkgId}
                    onClick={() => setSelectedPackageId(pkgId)}
                    className={`p-6 rounded-2xl glass-card cursor-pointer border transition-all ${
                      isSelected
                        ? 'border-brand-cyan bg-[#101A2D] shadow-glow-cyan/20'
                        : 'border-border-subtle hover:border-brand-cyan/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                          {pkg.includesExpress && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-amber/20 text-brand-amber border border-brand-amber/30">
                              VIP Express Access
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-content-secondary">{pkg.description}</p>
                      </div>

                      <div className="text-right sm:flex-shrink-0">
                        <span className="block text-[10px] text-content-muted uppercase font-semibold">Starting At</span>
                        <div className="text-xl font-extrabold text-white">
                          {formatPrice(pkg.pricePaise)}
                          <span className="text-xs font-normal text-content-muted"> / guest</span>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    {pkg.features && (
                      <div className="mt-4 pt-4 border-t border-border-subtle flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
                        {pkg.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Activities & Attractions */}
          {park.activityNames && park.activityNames.length > 0 && (
            <section className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-4">
              <h2 className="text-xl font-bold text-white">Signature Rides & Activities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {park.activityNames.map((act, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-cyan" />
                    <span className="text-sm font-medium text-slate-200">{act}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Facilities & Amenities */}
          {park.facilities && park.facilities.length > 0 && (
            <section className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-4">
              <h2 className="text-xl font-bold text-white">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-content-secondary">
                {park.facilities.map((fac, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#080F1D] border border-border-subtle flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Safety & Cancellation Policies */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-amber" />
                <span>Safety Guidelines</span>
              </h3>
              <ul className="space-y-2 text-xs text-content-secondary leading-relaxed">
                {park.safetyGuidelines && park.safetyGuidelines.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-brand-amber font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-cyan" />
                <span>Cancellation Policy</span>
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                {park.cancellationPolicy}
              </p>
              <div className="pt-2 text-[11px] text-content-muted">
                Refunds are processed automatically via authorized payment gateways in 3-5 business days.
              </div>
            </div>
          </section>

          {/* Contact Details */}
          {park.contact && (
            <section className="glass-card p-6 rounded-2xl border border-border-subtle space-y-3">
              <h3 className="text-sm font-bold text-white">Destination Contact & Verification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-content-secondary">
                {park.contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>{park.contact.phone}</span>
                  </div>
                )}
                {park.contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>{park.contact.email}</span>
                  </div>
                )}
                {park.contact.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-brand-cyan" />
                    <a href={park.contact.website} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline truncate">
                      {park.contact.website}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Customer Reviews & Verified Ratings (Phase 8) */}
          <section className="glass-card p-6 rounded-2xl border border-border-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>Verified Guest Reviews &amp; Ratings</span>
                </h3>
                <p className="text-xs text-content-secondary mt-0.5">
                  Authentic guest experiences verified against booking references.
                </p>
              </div>

              {user ? (
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-cyan text-slate-950 hover:bg-white transition-colors"
                >
                  Write a Review
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-semibold text-brand-cyan hover:underline"
                >
                  Sign in to leave a review
                </Link>
              )}
            </div>

            {/* Score & Breakdown Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 rounded-xl bg-white/5 border border-border-subtle items-center">
              <div className="text-center sm:border-r sm:border-border-subtle sm:pr-6">
                <span className="text-4xl font-extrabold text-white">
                  {reviewsData.stats?.averageRating || park.rating || '4.8'}
                </span>
                <div className="flex items-center justify-center gap-1 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(reviewsData.stats?.averageRating || park.rating || 5)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-content-muted block">
                  Based on {reviewsData.stats?.totalReviews || park.reviewCount || 0} reviews
                </span>
              </div>

              <div className="sm:col-span-2 space-y-1.5 text-xs">
                {(reviewsData.stats?.breakdown || [
                  { stars: 5, percentage: 75, count: 0 },
                  { stars: 4, percentage: 18, count: 0 },
                  { stars: 3, percentage: 5, count: 0 },
                  { stars: 2, percentage: 2, count: 0 },
                  { stars: 1, percentage: 0, count: 0 }
                ]).map((b) => (
                  <div key={b.stars} className="flex items-center gap-2">
                    <span className="w-12 text-[11px] text-content-secondary font-semibold">{b.stars} Stars</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-[11px] text-content-muted text-right">{b.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review List */}
            {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-xl bg-white/5 border border-border-subtle space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-cyan/20 text-brand-cyan font-bold flex items-center justify-center text-[11px]">
                          {rev.user?.name ? rev.user.name[0] : 'V'}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{rev.user?.name || 'Visitor'}</span>
                          <span className="text-[10px] text-content-muted">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {rev.isVerifiedBooking && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Booking</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-content-secondary leading-relaxed pt-1">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-content-muted">
                No reviews yet. Be the first adventurer to share your experience!
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Booking Panel */}
        <div className="lg:col-span-1 lg:sticky lg:top-28 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-border-subtle shadow-2xl space-y-6">
            <div>
              <span className="text-[11px] uppercase font-bold text-brand-amber tracking-wider block">
                Reserve Your Adventure
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {activePackage?.name || 'General Entry Pass'}
              </h3>
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Select Visit Date
              </label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-cyan cursor-pointer"
              />
              {availabilityInfo && (
                <div className={`text-[11px] flex items-center gap-1.5 pt-1 ${
                  availabilityInfo.isAvailable ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${availabilityInfo.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>
                    {availabilityInfo.isAvailable
                      ? `Open on ${availabilityInfo.dayOfWeek} (${availabilityInfo.operatingHours.open} - ${availabilityInfo.operatingHours.close})`
                      : `Park is scheduled closed on ${availabilityInfo.dayOfWeek}`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Visitor Counts */}
            <div className="space-y-3 pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-white">Adults</span>
                  <span className="text-[11px] text-content-muted">
                    {formatPrice(activePackage?.visitorCategories?.[0]?.pricePaise || activePackage?.pricePaise || 0)} each
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center border border-border-subtle"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">{adultCount}</span>
                  <button
                    onClick={() => setAdultCount(adultCount + 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center border border-border-subtle"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-white">Children (Below 4.5ft)</span>
                  <span className="text-[11px] text-content-muted">
                    {formatPrice(activePackage?.visitorCategories?.[1]?.pricePaise || Math.round((activePackage?.pricePaise || 0) * 0.8))} each
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center border border-border-subtle"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">{childCount}</span>
                  <button
                    onClick={() => setChildCount(childCount + 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center border border-border-subtle"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Estimated Total Price breakdown */}
            <div className="pt-4 border-t border-border-subtle space-y-2">
              <div className="flex justify-between text-xs text-content-secondary">
                <span>Total Visitors:</span>
                <span className="text-white font-semibold">{adultCount + childCount} Guest(s)</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-content-muted uppercase tracking-wider">
                  Estimated Total
                </span>
                <div className="text-2xl font-black text-brand-cyan">
                  {formatPrice(estimatedTotalPaise)}
                </div>
              </div>
              <p className="text-[10px] text-content-muted">
                Server authoritative calculation applied on booking creation. Includes all applicable amusement taxes.
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              disabled={availabilityInfo && !availabilityInfo.isAvailable}
              onClick={() => {
                navigate(`/book/${park.slug}`);
              }}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                availabilityInfo && !availabilityInfo.isAvailable
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-cyan via-sky-400 to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan hover:shadow-lg'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{availabilityInfo && !availabilityInfo.isAvailable ? 'CLOSED ON THIS DATE' : 'BOOK THIS PASS'}</span>
            </button>

            <div className="text-center text-[11px] text-content-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified MongoDB pricing & guaranteed admission</span>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEW SUBMISSION MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-content-secondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Review {park.name}</h3>
            
            {reviewSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {reviewErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingInput(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= ratingInput ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-amber-400 font-bold ml-2">{ratingInput} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Your Experience Feedback
                </label>
                <textarea
                  required
                  rows={4}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Tell fellow travelers about the attractions, queuing times, food, and staff..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-content-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !commentInput.trim()}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-white disabled:opacity-50 transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}