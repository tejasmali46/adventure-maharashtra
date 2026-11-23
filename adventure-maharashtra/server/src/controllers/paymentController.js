import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import asyncHandler from '../utils/asyncHandler.js';
import { 
  createGatewayOrder, 
  verifyGatewaySignature, 
  generateSandboxPaymentPayload 
} from '../services/paymentGateway.js';

// @desc    Create payment order for booking
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required.' });
  }

  const booking = await Booking.findById(bookingId).populate('park', 'name');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Ownership verification
  if (booking.user && booking.user.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'You are not authorized to pay for this booking.' });
  }

  // Idempotency: If already paid and confirmed, return existing payment info
  if (booking.paymentStatus === 'SUCCESS' && booking.paymentReference) {
    const existingPayment = await Payment.findById(booking.paymentReference);
    return res.status(200).json({
      success: true,
      message: 'Booking is already paid and confirmed.',
      data: {
        alreadyPaid: true,
        orderId: existingPayment?.orderId,
        paymentId: existingPayment?.paymentId,
        amountPaise: booking.priceBreakdown.totalAmountPaise,
        bookingReference: booking.bookingReference
      }
    });
  }

  // Create gateway order
  const order = await createGatewayOrder({
    amountPaise: booking.priceBreakdown.totalAmountPaise,
    currency: 'INR',
    receipt: booking.bookingReference
  });

  // Create initial payment tracking record
  const payment = new Payment({
    booking: booking._id,
    provider: order.provider,
    orderId: order.orderId,
    amountPaise: order.amountPaise,
    currency: order.currency,
    status: 'PENDING'
  });
  await payment.save();

  // Link payment reference to booking
  booking.paymentReference = payment._id;
  await booking.save();

  // If Sandbox mode, generate helper test credentials for 1-click test payments in frontend
  const sandboxTestCredentials = order.provider === 'MOCK_SANDBOX' 
    ? generateSandboxPaymentPayload(order.orderId) 
    : null;

  res.status(200).json({
    success: true,
    data: {
      orderId: order.orderId,
      amountPaise: order.amountPaise,
      currency: order.currency,
      keyId: order.keyId,
      provider: order.provider,
      bookingReference: booking.bookingReference,
      sandboxTestCredentials
    }
  });
});

// @desc    Verify payment signature, enforce idempotency & issue digital ticket
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    method = 'UPI',
    idempotencyKey
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing payment signature verification parameters.'
    });
  }

  // 1. Idempotency Check via idempotencyKey or existing paymentId
  if (idempotencyKey) {
    const idempotentPayment = await Payment.findOne({ idempotencyKey, status: 'SUCCESS' })
      .populate('booking');
    if (idempotentPayment) {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed (Idempotent replay).',
        data: {
          isIdempotentReplay: true,
          payment: idempotentPayment,
          booking: idempotentPayment.booking
        }
      });
    }
  }

  const existingPaid = await Payment.findOne({ paymentId: razorpay_payment_id, status: 'SUCCESS' });
  if (existingPaid) {
    return res.status(200).json({
      success: true,
      message: 'Payment transaction already recorded.',
      data: { isIdempotentReplay: true, payment: existingPaid }
    });
  }

  // 2. Cryptographic HMAC SHA-256 Signature Verification
  const isValidSignature = verifyGatewaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValidSignature) {
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: 'FAILED', paymentId: razorpay_payment_id, signature: razorpay_signature }
    );
    return res.status(400).json({
      success: false,
      message: 'Cryptographic signature verification failed. Transaction rejected.'
    });
  }

  // 3. Find and update Payment
  const payment = await Payment.findOne({ orderId: razorpay_order_id });
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment order record not found.' });
  }

  payment.paymentId = razorpay_payment_id;
  payment.signature = razorpay_signature;
  payment.method = method;
  payment.idempotencyKey = idempotencyKey || null;
  payment.status = 'SUCCESS';
  await payment.save();

  // 4. Update Booking to CONFIRMED & SUCCESS
  const targetBookingId = bookingId || payment.booking;
  const booking = await Booking.findById(targetBookingId).populate('park');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Associated booking not found.' });
  }

  booking.bookingStatus = 'CONFIRMED';
  booking.paymentStatus = 'SUCCESS';
  booking.paymentReference = payment._id;

  // 5. Automatic Digital Ticket Generation (Phase 7 bridge)
  let ticket = await Ticket.findOne({ booking: booking._id });
  if (!ticket) {
    const totalAdmissions = 
      (booking.visitorQuantities?.adults || 0) + 
      (booking.visitorQuantities?.children || 0) + 
      (booking.visitorQuantities?.seniors || 0);

    const qrToken = crypto.randomBytes(24).toString('hex');
    ticket = new Ticket({
      ticketReference: `TK-${booking.bookingReference}`,
      booking: booking._id,
      park: booking.park._id,
      visitDate: booking.visitDate,
      qrToken,
      totalAdmissions: Math.max(1, totalAdmissions),
      admissionsRedeemed: 0,
      isFullyRedeemed: false
    });
    await ticket.save();
    booking.ticketReference = ticket._id;
  }

  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Payment verified and digital admission pass issued!',
    data: {
      payment: {
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        status: payment.status,
        amountPaise: payment.amountPaise,
        method: payment.method
      },
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        visitDate: booking.visitDate
      },
      ticket: {
        ticketReference: ticket.ticketReference,
        qrToken: ticket.qrToken,
        totalAdmissions: ticket.totalAdmissions
      }
    }
  });
});

// @desc    Process refund for an eligible cancelled booking
// @route   POST /api/payments/:bookingId/refund
// @access  Private
export const processBookingRefund = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Authorization check
  const isOwner = booking.user && booking.user.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  if (!isOwner && !isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  if (booking.bookingStatus !== 'CANCELLED') {
    return res.status(400).json({
      success: false,
      message: 'Only cancelled bookings are eligible for refund processing.'
    });
  }

  const refundPaise = booking.cancellationDetails?.refundEligiblePaise || 0;
  if (refundPaise <= 0) {
    return res.status(400).json({
      success: false,
      message: 'This cancellation is outside the refund eligibility window.'
    });
  }

  // Update payment status
  const payment = await Payment.findOne({ booking: booking._id, status: 'SUCCESS' });
  if (payment) {
    payment.status = refundPaise === payment.amountPaise ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    await payment.save();
  }

  booking.cancellationDetails.refundStatus = 'PROCESSED';
  await booking.save();

  res.status(200).json({
    success: true,
    message: `Refund of ₹${Math.round(refundPaise / 100).toLocaleString('en-IN')} processed successfully.`,
    data: {
      bookingReference: booking.bookingReference,
      refundEligiblePaise: refundPaise,
      refundStatus: 'PROCESSED'
    }
  });
});

// @desc    Webhook receiver for gateway event callbacks
// @route   POST /api/payments/webhook
// @access  Public
export const handleGatewayWebhook = asyncHandler(async (req, res) => {
  const event = req.body?.event;
  const payload = req.body?.payload;

  console.log(`[PaymentWebhook]: Received event '${event}'`);

  if (event === 'payment.captured' && payload?.payment?.entity) {
    const { order_id, id: payment_id } = payload.payment.entity;
    await Payment.findOneAndUpdate(
      { orderId: order_id },
      { status: 'SUCCESS', paymentId: payment_id }
    );
  }

  res.status(200).json({ status: 'ok', received: true });
});