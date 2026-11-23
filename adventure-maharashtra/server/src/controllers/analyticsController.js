import Park from '../models/Park.js';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get comprehensive business analytics for park operators
// @route   GET /api/analytics/partner
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const getPartnerAnalytics = asyncHandler(async (req, res) => {
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const { parkId } = req.query;

  // Determine target parks
  let parkFilter = {};
  if (parkId) {
    parkFilter = { _id: parkId };
    if (!isSuperAdmin) {
      parkFilter.owner = req.user._id;
    }
  } else if (!isSuperAdmin) {
    parkFilter = { owner: req.user._id };
  }

  const ownedParks = await Park.find(parkFilter).select('_id name slug city startingPricePaise rating reviewCount');
  const parkIds = ownedParks.map((p) => p._id);

  if (parkIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        parksCount: 0,
        financials: { grossRevenueRupees: 0, netRevenueRupees: 0, totalOrders: 0 },
        bookingsVolume: { total: 0, confirmed: 0, cancelled: 0, checkedIn: 0, cancellationRatePct: 0 },
        visitorDemographics: { totalVisitors: 0, adults: 0, children: 0, seniors: 0 },
        packagePerformance: [],
        turnstileOperations: { totalExpected: 0, admitted: 0, remaining: 0, admissionRatePct: 0 },
        guestSentiment: { averageRating: 0, totalReviews: 0 }
      }
    });
  }

  // 1. Fetch Bookings for owned parks
  const bookings = await Booking.find({ park: { $in: parkIds } })
    .populate('park', 'name')
    .sort({ createdAt: -1 });

  let grossRevenuePaise = 0;
  let refundedPaise = 0;
  let totalBookings = bookings.length;
  let confirmedCount = 0;
  let checkedInCount = 0;
  let cancelledCount = 0;

  let totalAdults = 0;
  let totalChildren = 0;
  let totalSeniors = 0;

  const packageMap = {};

  bookings.forEach((b) => {
    const totalPaise = b.priceBreakdown?.totalAmountPaise || 0;
    if (b.bookingStatus !== 'CANCELLED') {
      grossRevenuePaise += totalPaise;
    }
    if (b.bookingStatus === 'CONFIRMED') confirmedCount += 1;
    if (b.bookingStatus === 'CHECKED_IN') checkedInCount += 1;
    if (b.bookingStatus === 'CANCELLED') {
      cancelledCount += 1;
      refundedPaise += (b.cancellationDetails?.refundAmountPaise || 0);
    }

    // Demographics
    const adults = b.visitorQuantities?.adults || 0;
    const children = b.visitorQuantities?.children || 0;
    const seniors = b.visitorQuantities?.seniors || 0;
    totalAdults += adults;
    totalChildren += children;
    totalSeniors += seniors;

    // Package breakdown
    const pkgName = b.packageSnapshot?.name || 'Standard Pass';
    if (!packageMap[pkgName]) {
      packageMap[pkgName] = { name: pkgName, count: 0, revenuePaise: 0, express: Boolean(b.packageSnapshot?.includesExpress) };
    }
    packageMap[pkgName].count += 1;
    if (b.bookingStatus !== 'CANCELLED') {
      packageMap[pkgName].revenuePaise += totalPaise;
    }
  });

  const totalVisitors = totalAdults + totalChildren + totalSeniors;
  const netRevenuePaise = grossRevenuePaise - refundedPaise;
  const cancellationRatePct = totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0;

  const packagePerformance = Object.values(packageMap).map((pkg) => ({
    ...pkg,
    revenueRupees: Math.round(pkg.revenuePaise / 100)
  }));

  // 2. Turnstile Gate Operations
  const tickets = await Ticket.find({ park: { $in: parkIds } });
  let totalExpectedAdmissions = 0;
  let totalAdmittedNow = 0;

  tickets.forEach((t) => {
    totalExpectedAdmissions += t.totalAdmissions || 0;
    totalAdmittedNow += t.admissionsRedeemed || 0;
  });

  const remainingAdmissions = Math.max(0, totalExpectedAdmissions - totalAdmittedNow);
  const admissionRatePct = totalExpectedAdmissions > 0 
    ? Math.round((totalAdmittedNow / totalExpectedAdmissions) * 100) 
    : 0;

  // 3. Guest Sentiment (Reviews)
  const reviews = await Review.find({ park: { $in: parkIds }, moderationStatus: 'APPROVED' });
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  res.status(200).json({
    success: true,
    data: {
      parksCount: ownedParks.length,
      parks: ownedParks,
      financials: {
        grossRevenuePaise,
        grossRevenueRupees: Math.round(grossRevenuePaise / 100),
        refundedRupees: Math.round(refundedPaise / 100),
        netRevenueRupees: Math.round(netRevenuePaise / 100),
        totalOrders: totalBookings - cancelledCount
      },
      bookingsVolume: {
        total: totalBookings,
        confirmed: confirmedCount,
        checkedIn: checkedInCount,
        cancelled: cancelledCount,
        cancellationRatePct
      },
      visitorDemographics: {
        totalVisitors,
        adults: totalAdults,
        adultsPct: totalVisitors > 0 ? Math.round((totalAdults / totalVisitors) * 100) : 0,
        children: totalChildren,
        childrenPct: totalVisitors > 0 ? Math.round((totalChildren / totalVisitors) * 100) : 0,
        seniors: totalSeniors,
        seniorsPct: totalVisitors > 0 ? Math.round((totalSeniors / totalVisitors) * 100) : 0
      },
      packagePerformance,
      turnstileOperations: {
        totalExpected: totalExpectedAdmissions,
        admitted: totalAdmittedNow,
        remaining: remainingAdmissions,
        admissionRatePct
      },
      guestSentiment: {
        averageRating: avgRating,
        totalReviews
      }
    }
  });
});

// @desc    Get platform-wide analytics for Super Admins
// @route   GET /api/analytics/platform
// @access  Private (SUPER_ADMIN)
export const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalParks,
    activeParks,
    pendingParks,
    totalBookings,
    allSuccessfulBookings
  ] = await Promise.all([
    User.countDocuments(),
    Park.countDocuments(),
    Park.countDocuments({ status: 'ACTIVE' }),
    Park.countDocuments({ approvalStatus: 'PENDING' }),
    Booking.countDocuments(),
    Booking.find({ paymentStatus: 'SUCCESS' }).select('priceBreakdown.totalAmountPaise')
  ]);

  const platformGMVPaise = allSuccessfulBookings.reduce(
    (sum, b) => sum + (b.priceBreakdown?.totalAmountPaise || 0), 0
  );

  res.status(200).json({
    success: true,
    data: {
      platformGMVRupees: Math.round(platformGMVPaise / 100),
      totalUsers,
      totalParks,
      activeParks,
      pendingParks,
      totalBookings
    }
  });
});