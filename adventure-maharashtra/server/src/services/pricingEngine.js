import Coupon from '../models/Coupon.js';

/**
 * Robust server-side pricing engine for Adventure Maharashtra bookings
 * Operates strictly with integer minor units (paise) to eliminate floating-point currency inaccuracies.
 */
export async function calculateBookingPricing({
  park,
  packageDoc,
  visitDate,
  visitorQuantities = {},
  addons = [],
  couponCode = null
}) {
  const dateObj = new Date(visitDate);
  const dayIndex = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayIndex];
  const isWeekend = dayIndex === 0 || dayIndex === 6;

  // 1. Determine Tier Prices from Package Categories
  let adultPricePaise = packageDoc.pricePaise;
  let childPricePaise = Math.round(packageDoc.pricePaise * 0.75);
  let seniorPricePaise = Math.round(packageDoc.pricePaise * 0.70);

  if (packageDoc.visitorCategories && packageDoc.visitorCategories.length > 0) {
    const adultCat = packageDoc.visitorCategories.find((c) => /adult/i.test(c.type));
    if (adultCat) adultPricePaise = adultCat.pricePaise;

    const childCat = packageDoc.visitorCategories.find((c) => /child|kid/i.test(c.type));
    if (childCat) childPricePaise = childCat.pricePaise;

    const seniorCat = packageDoc.visitorCategories.find((c) => /senior|elder/i.test(c.type));
    if (seniorCat) seniorPricePaise = seniorCat.pricePaise;
  }

  // 2. Count Visitors
  const adults = Math.max(0, parseInt(visitorQuantities.adults || 0, 10));
  const children = Math.max(0, parseInt(visitorQuantities.children || 0, 10));
  const seniors = Math.max(0, parseInt(visitorQuantities.seniors || 0, 10));
  const totalPasses = adults + children + seniors;

  if (totalPasses <= 0) {
    throw new Error('At least one admission pass (Adult, Child, or Senior) is required.');
  }

  // 3. Base Passes Cost
  const basePassesPaise = 
    (adults * adultPricePaise) + 
    (children * childPricePaise) + 
    (seniors * seniorPricePaise);

  // 4. Weekend Surge (10% on Saturdays & Sundays)
  let weekendSurgePaise = 0;
  if (isWeekend) {
    weekendSurgePaise = Math.round(basePassesPaise * 0.10);
  }

  const subtotalPaise = basePassesPaise + weekendSurgePaise;

  // 5. Add-ons Calculation
  let addonsPaise = 0;
  const processedAddons = [];
  if (Array.isArray(addons) && addons.length > 0) {
    for (const item of addons) {
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      const price = Math.max(0, parseInt(item.pricePaise || 0, 10));
      const itemTotal = price * qty;
      addonsPaise += itemTotal;
      processedAddons.push({
        name: item.name,
        pricePaise: price,
        quantity: qty
      });
    }
  }

  // 6. Promotional Coupon Validation & Calculation
  let discountPaise = 0;
  let couponApplied = null;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (coupon) {
      const now = new Date();
      const isValidDate = !coupon.validUntil || new Date(coupon.validUntil) >= now;
      const grossAmount = subtotalPaise + addonsPaise;
      const meetsMinBooking = !coupon.minBookingAmountPaise || grossAmount >= coupon.minBookingAmountPaise;

      let isDayApplicable = true;
      if (coupon.applicableDays && coupon.applicableDays.length > 0) {
        isDayApplicable = coupon.applicableDays.some(
          (d) => d.toLowerCase() === dayName.toLowerCase() || 
                 d.toLowerCase() === 'all days' || 
                 d.toLowerCase() === 'all'
        );
      }

      if (isValidDate && meetsMinBooking && isDayApplicable) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountPaise = Math.round((grossAmount * coupon.discountValue) / 100);
          if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
            discountPaise = coupon.maxDiscountPaise;
          }
        } else if (coupon.discountType === 'FLAT_AMOUNT' || coupon.discountType === 'FIXED_AMOUNT') {
          discountPaise = coupon.discountValue;
        }

        // Cap discount so total doesn't become negative
        if (discountPaise > grossAmount) {
          discountPaise = grossAmount;
        }

        couponApplied = {
          code: coupon.code,
          title: coupon.title,
          discountValue: coupon.discountValue,
          discountType: coupon.discountType
        };
      }
    }
  }

  // 7. Net Taxable Amount & 18% GST (9% CGST + 9% SGST)
  const taxableAmountPaise = Math.max(0, subtotalPaise + addonsPaise - discountPaise);
  const taxPaise = Math.round(taxableAmountPaise * 0.18);
  const totalAmountPaise = taxableAmountPaise + taxPaise;

  return {
    dayName,
    isWeekend,
    totalPasses,
    tierBreakdown: {
      adults: { count: adults, pricePaise: adultPricePaise, totalPaise: adults * adultPricePaise },
      children: { count: children, pricePaise: childPricePaise, totalPaise: children * childPricePaise },
      seniors: { count: seniors, pricePaise: seniorPricePaise, totalPaise: seniors * seniorPricePaise }
    },
    basePassesPaise,
    weekendSurgePaise,
    subtotalPaise,
    addons: processedAddons,
    addonsPaise,
    discountPaise,
    couponApplied,
    taxableAmountPaise,
    taxPaise, // 18% GST
    totalAmountPaise,
    // Human-friendly rupees for instant display
    formatted: {
      subtotalRupees: Math.round(subtotalPaise / 100),
      addonsRupees: Math.round(addonsPaise / 100),
      discountRupees: Math.round(discountPaise / 100),
      taxRupees: Math.round(taxPaise / 100),
      totalRupees: Math.round(totalAmountPaise / 100)
    }
  };
}

export default calculateBookingPricing;