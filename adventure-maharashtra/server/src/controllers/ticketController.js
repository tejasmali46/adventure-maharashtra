import qrcode from 'qrcode';
import Ticket from '../models/Ticket.js';
import Booking from '../models/Booking.js';
import Park from '../models/Park.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get ticket by ticketReference or ID with dynamic QR code Data URL
// @route   GET /api/tickets/ref/:ticketReference
// @access  Private (Owner, Park Staff, Super Admin)
export const getTicketByReference = asyncHandler(async (req, res) => {
  const { ticketReference } = req.params;

  const ticket = await Ticket.findOne({
    $or: [{ ticketReference: ticketReference.toUpperCase() }, { _id: ticketReference.match(/^[0-9a-fA-F]{24}$/) ? ticketReference : null }]
  })
    .populate({
      path: 'booking',
      select: 'bookingReference customerDetails packageSnapshot visitorQuantities addons priceBreakdown bookingStatus paymentStatus visitDate'
    })
    .populate('park', 'name slug city location category operatingHours images contact');

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Digital ticket not found.'
    });
  }

  // Authorization: must be ticket owner, park owner, or super admin
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const isParkOwner = ticket.park.owner && ticket.park.owner.toString() === req.user._id.toString();
  const isBookingOwner = ticket.booking && ticket.booking.customerDetails && ticket.booking.customerDetails.email === req.user.email;

  if (!isSuperAdmin && !isParkOwner && !isBookingOwner && req.user.role !== 'PARK_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this ticket.'
    });
  }

  // Generate high-resolution scannable QR Code Data URL
  const qrCodeDataUrl = await qrcode.toDataURL(ticket.qrToken, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 1,
    width: 320,
    color: {
      dark: '#030712',
      light: '#ffffff'
    }
  });

  res.status(200).json({
    success: true,
    data: {
      ...ticket.toObject(),
      qrCodeDataUrl
    }
  });
});

// @desc    Get all digital tickets for a specific booking
// @route   GET /api/tickets/booking/:bookingId
// @access  Private
export const getTicketsForBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate('park');
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking reservation not found.'
    });
  }

  // Check ownership
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const isBookingOwner = booking.user && booking.user.toString() === req.user._id.toString();
  const isEmailMatch = booking.customerDetails && booking.customerDetails.email === req.user.email;
  const isParkOwner = booking.park && booking.park.owner && booking.park.owner.toString() === req.user._id.toString();

  if (!isSuperAdmin && !isBookingOwner && !isEmailMatch && !isParkOwner && req.user.role !== 'PARK_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied for this booking tickets.'
    });
  }

  let tickets = await Ticket.find({ booking: booking._id }).populate('park');

  // If no ticket exists yet and booking is confirmed, lazily create one
  if (tickets.length === 0 && (booking.bookingStatus === 'CONFIRMED' || booking.paymentStatus === 'SUCCESS')) {
    const totalAdmissions =
      (booking.visitorQuantities?.adults || 0) +
      (booking.visitorQuantities?.children || 0) +
      (booking.visitorQuantities?.seniors || 0);

    const { randomBytes } = await import('crypto');
    const qrToken = randomBytes(24).toString('hex');
    const newTicket = new Ticket({
      ticketReference: `TK-${booking.bookingReference}`,
      booking: booking._id,
      park: booking.park._id,
      visitDate: booking.visitDate,
      qrToken,
      totalAdmissions: Math.max(1, totalAdmissions),
      admissionsRedeemed: 0,
      isFullyRedeemed: false
    });
    await newTicket.save();
    tickets = [await Ticket.findById(newTicket._id).populate('park')];
  }

  const ticketsWithQRs = await Promise.all(
    tickets.map(async (t) => {
      const qrCodeDataUrl = await qrcode.toDataURL(t.qrToken, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 320,
        color: {
          dark: '#030712',
          light: '#ffffff'
        }
      });
      return {
        ...t.toObject(),
        qrCodeDataUrl,
        bookingSnapshot: {
          reference: booking.bookingReference,
          packageSnapshot: booking.packageSnapshot,
          visitorQuantities: booking.visitorQuantities,
          customerDetails: booking.customerDetails,
          bookingStatus: booking.bookingStatus
        }
      };
    })
  );

  res.status(200).json({
    success: true,
    data: ticketsWithQRs
  });
});
// @desc    Scan and validate gate pass at park turnstiles
// @route   POST /api/tickets/scan
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const scanGateTicket = asyncHandler(async (req, res) => {
  const {
    qrToken,
    ticketReference,
    parkId,
    gateNumber = 'Turnstile Gate 1',
    countToRedeem = 1,
    bypassDateCheck = false
  } = req.body;

  if (!qrToken && !ticketReference) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_PAYLOAD',
      message: 'Please provide either a QR token or Ticket Reference.'
    });
  }

  if (!parkId) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_PARK_ID',
      message: 'Venue Park ID is required for turnstile validation.'
    });
  }

  // 1. Locate Ticket
  const query = qrToken ? { qrToken: qrToken.trim() } : { ticketReference: ticketReference.trim().toUpperCase() };
  const ticket = await Ticket.findOne(query)
    .populate('park', 'name slug owner')
    .populate({
      path: 'booking',
      select: 'bookingReference customerDetails packageSnapshot visitorQuantities bookingStatus paymentStatus'
    });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      code: 'TICKET_NOT_FOUND',
      message: 'Invalid Gate Pass: No active reservation matches this scan.'
    });
  }

  // 2. Validate Venue Matching (Cannot scan an Imagicaa pass at Wet n Joy)
  if (ticket.park._id.toString() !== parkId.toString()) {
    return res.status(400).json({
      success: false,
      code: 'CROSS_PARK_REJECTION',
      message: `Destination Mismatch: This pass is valid for "${ticket.park.name}", not for this destination.`,
      data: {
        intendedPark: ticket.park.name,
        ticketReference: ticket.ticketReference
      }
    });
  }

  // 3. Date Validation (Check if visit date is today)
  if (!bypassDateCheck) {
    const today = new Date();
    const todayYMD = today.toISOString().split('T')[0];
    const ticketYMD = new Date(ticket.visitDate).toISOString().split('T')[0];

    if (ticketYMD > todayYMD) {
      return res.status(400).json({
        success: false,
        code: 'FUTURE_DATE_REJECTION',
        message: `Pass Not Yet Active: This reservation is scheduled for ${ticketYMD}. Admission not permitted today.`,
        data: {
          scheduledDate: ticketYMD,
          today: todayYMD,
          ticketReference: ticket.ticketReference
        }
      });
    }

    // Check if expired (> 24h past visit date)
    const ticketDateTime = new Date(ticket.visitDate).getTime();
    const diffDays = (today.getTime() - ticketDateTime) / (1000 * 60 * 60 * 24);
    if (diffDays > 1.5) {
      return res.status(400).json({
        success: false,
        code: 'EXPIRED_PASS',
        message: `Pass Expired: This pass expired on ${ticketYMD}. Please visit the guest relations kiosk.`,
        data: {
          scheduledDate: ticketYMD,
          ticketReference: ticket.ticketReference
        }
      });
    }
  }

  // 4. Replay Protection: Check if already fully redeemed
  if (ticket.isFullyRedeemed || ticket.admissionsRedeemed >= ticket.totalAdmissions) {
    const lastRedemption = ticket.redemptionHistory && ticket.redemptionHistory.length > 0
      ? ticket.redemptionHistory[ticket.redemptionHistory.length - 1]
      : null;

    const timeStr = lastRedemption?.redeemedAt
      ? new Date(lastRedemption.redeemedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : 'earlier today';

    return res.status(400).json({
      success: false,
      code: 'ALREADY_REDEEMED',
      message: `Pass Already Used: All ${ticket.totalAdmissions} admission(s) were redeemed at ${timeStr} at ${lastRedemption?.gateNumber || 'Turnstile'}.`,
      data: {
        ticketReference: ticket.ticketReference,
        totalAdmissions: ticket.totalAdmissions,
        admissionsRedeemed: ticket.admissionsRedeemed,
        lastRedemption
      }
    });
  }

  // 5. Calculate and Process Admissions
  const availableToRedeem = ticket.totalAdmissions - ticket.admissionsRedeemed;
  const numToRedeem = Math.min(Math.max(1, countToRedeem), availableToRedeem);

  ticket.admissionsRedeemed += numToRedeem;
  if (ticket.admissionsRedeemed >= ticket.totalAdmissions) {
    ticket.isFullyRedeemed = true;
  }

  ticket.redemptionHistory.push({
    redeemedAt: new Date(),
    redeemedCount: numToRedeem,
    staffId: req.user._id,
    gateNumber
  });

  await ticket.save();

  // If fully redeemed, update booking status to CHECKED_IN
  if (ticket.isFullyRedeemed && ticket.booking) {
    await Booking.findByIdAndUpdate(ticket.booking._id, { bookingStatus: 'CHECKED_IN' });
  }

  // 6. Return Admission Result for Turnstile Audio & Visual UI
  res.status(200).json({
    success: true,
    message: `Access Granted! Welcome ${ticket.booking?.customerDetails?.name || 'Visitor'}.`,
    data: {
      status: 'ADMITTED',
      ticketReference: ticket.ticketReference,
      visitorName: ticket.booking?.customerDetails?.name || 'Primary Guest',
      packageName: ticket.booking?.packageSnapshot?.name || 'Standard Pass',
      includesExpress: Boolean(ticket.booking?.packageSnapshot?.includesExpress),
      admittedNow: numToRedeem,
      totalAdmissions: ticket.totalAdmissions,
      admissionsRedeemed: ticket.admissionsRedeemed,
      remainingAdmissions: ticket.totalAdmissions - ticket.admissionsRedeemed,
      isFullyRedeemed: ticket.isFullyRedeemed,
      gateNumber,
      scannedAt: new Date(),
      parkName: ticket.park.name
    }
  });
});

// @desc    Get real-time turnstile scanning audit history for a park
// @route   GET /api/tickets/history/:parkId
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const getParkScanHistory = asyncHandler(async (req, res) => {
  const { parkId } = req.params;

  const park = await Park.findById(parkId);
  if (!park) {
    return res.status(404).json({ success: false, message: 'Park not found.' });
  }

  // Verify ownership or super admin
  if (req.user.role !== 'SUPER_ADMIN' && park.owner && park.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied for this park scan history.' });
  }

  const redeemedTickets = await Ticket.find({
    park: parkId,
    admissionsRedeemed: { $gt: 0 }
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .populate({
      path: 'booking',
      select: 'bookingReference customerDetails packageSnapshot'
    })
    .populate('redemptionHistory.staffId', 'name email');

  // Format flattened audit log events
  const auditLogs = [];
  redeemedTickets.forEach((t) => {
    t.redemptionHistory.forEach((r) => {
      auditLogs.push({
        ticketReference: t.ticketReference,
        visitorName: t.booking?.customerDetails?.name || 'Visitor',
        packageName: t.booking?.packageSnapshot?.name || 'Pass',
        includesExpress: Boolean(t.booking?.packageSnapshot?.includesExpress),
        redeemedCount: r.redeemedCount,
        gateNumber: r.gateNumber,
        redeemedAt: r.redeemedAt,
        staffName: r.staffId?.name || 'Turnstile Staff',
        isFullyRedeemed: t.isFullyRedeemed
      });
    });
  });

  // Sort latest first
  auditLogs.sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt));

  res.status(200).json({
    success: true,
    data: {
      parkName: park.name,
      totalScansToday: auditLogs.length,
      recentScans: auditLogs.slice(0, 30)
    }
  });
});