import Booking from '../models/Booking.js';
import Park from '../models/Park.js';
import Package from '../models/Package.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateBookingPricing } from '../services/pricingEngine.js';

// Helper to generate unique booking reference: AM-YYYYMMDD-XXXXX
function generateBookingReference() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `AM-${dateStr}-${randomSuffix}`;
}

// @desc    Calculate dynamic booking pricing with tax, coupons, add-ons & surge
// @route   POST /api/bookings/calculate
// @access  Public
export const calculatePricing = asyncHandler(async (req, res) => {
  const { parkId, packageId, visitDate, visitorQuantities, addons, couponCode } = req.body;

  if (!parkId || !packageId || !visitDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide parkId, packageId, and visitDate.'
    });
  }

  const park = await Park.findById(parkId);
  if (!park) {
    return res.status(404).json({ success: false, message: 'Park not found' });
  }

  const packageDoc = await Package.findById(packageId);
  if (!packageDoc) {
    return res.status(404).json({ success: false, message: 'Package not found' });
  }

  try {
    const pricing = await calculateBookingPricing({
      park,
      packageDoc,
      visitDate,
      visitorQuantities,
      addons,
      couponCode
    });

    res.status(200).json({
      success: true,
      data: pricing
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Create new booking with real-time capacity and pricing verification
// @route   POST /api/bookings
// @access  Private (Logged-in Customer, Park Admin, or Super Admin)
export const createBooking = asyncHandler(async (req, res) => {
  const {
    parkId,
    packageId,
    visitDate,
    visitorQuantities = { adults: 1, children: 0, seniors: 0 },
    addons = [],
    customerDetails,
    couponCode
  } = req.body;

  if (!parkId || !packageId || !visitDate) {
    return res.status(400).json({
      success: false,
      message: 'Missing mandatory booking parameters: parkId, packageId, or visitDate.'
    });
  }

  const park = await Park.findById(parkId);
  if (!park || !park.isActive) {
    return res.status(404).json({ success: false, message: 'Park is inactive or does not exist.' });
  }

  const packageDoc = await Package.findById(packageId);
  if (!packageDoc || packageDoc.status !== 'ACTIVE') {
    return res.status(404).json({ success: false, message: 'Selected pass package is currently unavailable.' });
  }

  // Check operating day availability
  const dateObj = new Date(visitDate);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dateObj.getDay()];

  if (park.operatingHours?.days && park.operatingHours.days.toLowerCase().includes(`closed ${dayName.toLowerCase()}`)) {
    return res.status(400).json({
      success: false,
      message: `Destination is closed on ${dayName}s.`
    });
  }

  // Calculate pricing server-side
  let pricing;
  try {
    pricing = await calculateBookingPricing({
      park,
      packageDoc,
      visitDate,
      visitorQuantities,
      addons,
      couponCode
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Real-Time Daily Capacity Verification
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await Booking.find({
    park: park._id,
    visitDate: { $gte: startOfDay, $lte: endOfDay },
    bookingStatus: { $in: ['CONFIRMED', 'PENDING_PAYMENT'] }
  });

  const bookedPasses = existingBookings.reduce((sum, b) => {
    const q = b.visitorQuantities || {};
    return sum + (q.adults || 0) + (q.children || 0) + (q.seniors || 0);
  }, 0);

  const maxCapacity = packageDoc.availabilityRules?.maxDailyPasses || 500;
  if (bookedPasses + pricing.totalPasses > maxCapacity) {
    const remaining = Math.max(0, maxCapacity - bookedPasses);
    return res.status(400).json({
      success: false,
      message: `Capacity limit reached for ${dateObj.toISOString().split('T')[0]}. Only ${remaining} passes remaining for this date.`
    });
  }

  // Customer Contact Fallback
  const finalCustomerDetails = {
    name: customerDetails?.name || req.user?.name || 'Valued Guest',
    email: customerDetails?.email || req.user?.email || 'guest@example.com',
    phone: customerDetails?.phone || req.user?.phone || '+91 99999 99999'
  };

  // Unique Booking Reference
  let bookingReference = generateBookingReference();
  while (await Booking.findOne({ bookingReference })) {
    bookingReference = generateBookingReference();
  }

  // Construct New Booking Document
  const booking = new Booking({
    bookingReference,
    user: req.user?._id,
    park: park._id,
    visitDate: dateObj,
    packageSnapshot: {
      packageId: packageDoc._id,
      name: packageDoc.name,
      pricePaise: packageDoc.pricePaise,
      includesExpress: packageDoc.includesExpress
    },
    visitorQuantities: {
      adults: Math.max(0, parseInt(visitorQuantities.adults || 0, 10)),
      children: Math.max(0, parseInt(visitorQuantities.children || 0, 10)),
      seniors: Math.max(0, parseInt(visitorQuantities.seniors || 0, 10))
    },
    addons: pricing.addons,
    customerDetails: finalCustomerDetails,
    priceBreakdown: {
      basePassesPaise: pricing.basePassesPaise,
      weekendSurgePaise: pricing.weekendSurgePaise,
      subtotalPaise: pricing.subtotalPaise,
      addonsPaise: pricing.addonsPaise,
      discountPaise: pricing.discountPaise,
      taxPaise: pricing.taxPaise,
      totalAmountPaise: pricing.totalAmountPaise
    },
    couponApplied: pricing.couponApplied,
    bookingStatus: 'CONFIRMED', // Confirmed booking in Phase 5 flow
    paymentStatus: 'SUCCESS'
  });

  const savedBooking = await booking.save();
  const populatedBooking = await Booking.findById(savedBooking._id)
    .populate('park', 'name slug heroImage city address operatingHours contact');

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully!',
    data: populatedBooking
  });
});

// @desc    Get current user's bookings with filter & sorting
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id };

  if (status && status !== 'ALL') {
    filter.bookingStatus = status.toUpperCase();
  }

  const bookings = await Booking.find(filter)
    .populate('park', 'name slug heroImage city state rating contact')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking by ID or reference code
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let booking;
  if (id.startsWith('AM-')) {
    booking = await Booking.findOne({ bookingReference: id.toUpperCase() })
      .populate('park')
      .populate('user', 'name email phone');
  } else {
    booking = await Booking.findById(id)
      .populate('park')
      .populate('user', 'name email phone');
  }

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Authorization check
  const isOwner = booking.user && booking.user._id.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const isParkAdmin = req.user.role === 'PARK_ADMIN' && booking.park?.owners?.includes(req.user._id);

  if (!isOwner && !isSuperAdmin && !isParkAdmin) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this booking.'
    });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking with automated refund calculation based on cancellation window
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason = 'Cancelled by guest request' } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Authorization check
  const isOwner = booking.user && booking.user.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  if (!isOwner && !isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to cancel this booking.'
    });
  }

  if (booking.bookingStatus === 'CANCELLED') {
    return res.status(400).json({
      success: false,
      message: 'This booking is already cancelled.'
    });
  }

  // Refund policy window calculation
  const visitDateTime = new Date(booking.visitDate).getTime();
  const currentDateTime = Date.now();
  const hoursUntilVisit = (visitDateTime - currentDateTime) / (1000 * 60 * 60);

  let refundPercentage = 0;
  if (hoursUntilVisit >= 48) {
    refundPercentage = 100; // Free cancellation > 48 hrs
  } else if (hoursUntilVisit >= 24) {
    refundPercentage = 50;  // 50% refund between 24-48 hrs
  } else {
    refundPercentage = 0;   // Non-refundable within 24 hrs
  }

  const totalPaise = booking.priceBreakdown.totalAmountPaise;
  const refundEligiblePaise = Math.round((totalPaise * refundPercentage) / 100);

  booking.bookingStatus = 'CANCELLED';
  booking.paymentStatus = refundPercentage === 100 ? 'REFUNDED' : (refundPercentage > 0 ? 'PARTIALLY_REFUNDED' : 'SUCCESS');
  booking.cancellationDetails = {
    cancelledAt: new Date(),
    reason,
    refundPercentage,
    refundEligiblePaise,
    refundStatus: refundEligiblePaise > 0 ? 'PENDING' : 'NONE'
  };

  const updatedBooking = await booking.save();

  res.status(200).json({
    success: true,
    message: `Booking cancelled successfully. Refund eligibility: ${refundPercentage}% (₹${Math.round(refundEligiblePaise / 100).toLocaleString('en-IN')})`,
    data: updatedBooking
  });
});