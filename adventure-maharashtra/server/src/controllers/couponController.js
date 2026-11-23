import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all public active coupons
// @route   GET /api/coupons
// @access  Public
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    validUntil: { $gte: new Date() }
  }).sort({ validUntil: 1 });

  res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons
  });
});

// @desc    Authoritatively validate a coupon and calculate discount
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotalPaise = 0, guestCount = 1, visitDate } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      valid: false,
      message: 'Please provide a coupon code to validate'
    });
  }

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    return res.status(404).json({
      success: false,
      valid: false,
      message: 'Invalid coupon code. Please check the code and try again.'
    });
  }

  // Check Expiry
  if (coupon.validUntil < new Date()) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: 'This coupon code has expired.'
    });
  }

  // Check Minimum Booking Amount
  if (coupon.minBookingAmountPaise && subtotalPaise < coupon.minBookingAmountPaise) {
    const minRs = coupon.minBookingAmountPaise / 100;
    return res.status(400).json({
      success: false,
      valid: false,
      message: `Coupon requires a minimum booking amount of ₹${minRs}.`
    });
  }

  // Check Minimum Guest Count
  if (coupon.minPassCount && guestCount < coupon.minPassCount) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: `Coupon requires a minimum of ${coupon.minPassCount} visitors in the booking.`
    });
  }

  // Check Applicable Day of Week if visitDate provided
  if (visitDate && coupon.applicableDays && !coupon.applicableDays.includes('All Days')) {
    const dateObj = new Date(visitDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const visitDay = dayNames[dateObj.getDay()];

    if (!coupon.applicableDays.includes(visitDay)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `This coupon is only valid for visits on ${coupon.applicableDays.join(', ')}.`
      });
    }
  }

  // Calculate discount in integer paise
  let discountPaise = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100);
    if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
      discountPaise = coupon.maxDiscountPaise;
    }
  } else if (coupon.discountType === 'FLAT_AMOUNT') {
    discountPaise = coupon.discountValue;
  }

  // Discount cannot exceed subtotal
  discountPaise = Math.min(discountPaise, subtotalPaise);
  const newTotalPaise = Math.max(0, subtotalPaise - discountPaise);

  res.status(200).json({
    success: true,
    valid: true,
    data: {
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountPaise,
      newTotalPaise,
      message: `Coupon '${coupon.code}' successfully applied!`
    }
  });
});