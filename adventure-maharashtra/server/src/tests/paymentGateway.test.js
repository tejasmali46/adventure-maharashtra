import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import Park from '../models/Park.js';
import Package from '../models/Package.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import { computeGatewaySignature, generateSandboxPaymentPayload } from '../services/paymentGateway.js';

let serverInstance;
let baseUrl;

let customerCookie = '';
let testPark;
let testPackage;
let testBooking;
let testOrderId = '';
let testPaymentPayload;

test.before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });

  // Login as CUSTOMER
  const customerRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aarav@example.com',
      password: 'Password@123'
    })
  });
  assert.equal(customerRes.status, 200);
  const rawCustCookie = customerRes.headers.get('set-cookie');
  customerCookie = rawCustCookie ? rawCustCookie.split(';')[0] : '';

  // Get test park and package
  testPark = await Park.findOne({ slug: 'imagicaa-theme-park' });
  testPackage = await Package.findOne({ park: testPark._id });

  // Create an initial booking for payment testing
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 20);

  const bookingRes = await fetch(`${baseUrl}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie
    },
    body: JSON.stringify({
      parkId: testPark._id.toString(),
      packageId: testPackage._id.toString(),
      visitDate: futureDate.toISOString().split('T')[0],
      visitorQuantities: { adults: 2, children: 0, seniors: 0 },
      customerDetails: {
        name: 'Aarav Deshmukh',
        email: 'aarav@example.com',
        phone: '+91 98765 43210'
      }
    })
  });
  assert.equal(bookingRes.status, 201);
  const bookingJson = await bookingRes.json();
  testBooking = bookingJson.data;
  assert.ok(testBooking._id, 'testBooking must be created');
});

test.after(async () => {
  if (testBooking?._id) {
    await Booking.findByIdAndDelete(testBooking._id);
    await Payment.deleteMany({ booking: testBooking._id });
    await Ticket.deleteMany({ booking: testBooking._id });
  }
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await mongoose.disconnect();
});

test('POST /api/payments/create-order rejects unauthenticated requests with 401', async () => {
  const res = await fetch(`${baseUrl}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: testBooking._id })
  });
  assert.equal(res.status, 401);
});

test('POST /api/payments/create-order creates gateway order in integer paise', async () => {
  const res = await fetch(`${baseUrl}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie
    },
    body: JSON.stringify({ bookingId: testBooking._id })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.orderId);
  assert.equal(json.data.amountPaise, testBooking.priceBreakdown.totalAmountPaise);
  assert.equal(json.data.currency, 'INR');

  testOrderId = json.data.orderId;
  testPaymentPayload = generateSandboxPaymentPayload(testOrderId);
});

test('POST /api/payments/verify rejects fraudulent signature with 400', async () => {
  const forgedPayload = {
    bookingId: testBooking._id,
    razorpay_order_id: testOrderId,
    razorpay_payment_id: 'pay_fraud_12345',
    razorpay_signature: 'invalid_forged_signature_hash_xyz'
  };

  const res = await fetch(`${baseUrl}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie
    },
    body: JSON.stringify(forgedPayload)
  });

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
});

test('POST /api/payments/verify validates genuine HMAC SHA-256 signature and issues digital ticket', async () => {
  const validPayload = {
    bookingId: testBooking._id,
    razorpay_order_id: testPaymentPayload.razorpay_order_id,
    razorpay_payment_id: testPaymentPayload.razorpay_payment_id,
    razorpay_signature: testPaymentPayload.razorpay_signature,
    method: 'UPI',
    idempotencyKey: `idemp_${testOrderId}`
  };

  const res = await fetch(`${baseUrl}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie
    },
    body: JSON.stringify(validPayload)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.payment.status, 'SUCCESS');
  assert.equal(json.data.booking.paymentStatus, 'SUCCESS');
  assert.equal(json.data.booking.bookingStatus, 'CONFIRMED');

  // Verify digital ticket generation
  assert.ok(json.data.ticket, 'Digital ticket must be generated');
  assert.ok(json.data.ticket.ticketReference.startsWith('TK-'));
  assert.ok(json.data.ticket.qrToken, 'QR token must be issued');
  assert.equal(json.data.ticket.totalAdmissions, 2);
});

test('POST /api/payments/verify enforces idempotency on duplicate verification calls', async () => {
  const duplicatePayload = {
    bookingId: testBooking._id,
    razorpay_order_id: testPaymentPayload.razorpay_order_id,
    razorpay_payment_id: testPaymentPayload.razorpay_payment_id,
    razorpay_signature: testPaymentPayload.razorpay_signature,
    idempotencyKey: `idemp_${testOrderId}`
  };

  const res = await fetch(`${baseUrl}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie
    },
    body: JSON.stringify(duplicatePayload)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.isIdempotentReplay, true, 'Must identify idempotent replay');
});

test('POST /api/payments/webhook idempotently handles gateway event callbacks', async () => {
  const webhookBody = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: testPaymentPayload.razorpay_payment_id,
          order_id: testPaymentPayload.razorpay_order_id,
          amount: testBooking.priceBreakdown.totalAmountPaise,
          status: 'captured'
        }
      }
    }
  };

  const res = await fetch(`${baseUrl}/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookBody)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.received, true);
});

test('POST /api/payments/:bookingId/refund processes refund for cancelled booking', async () => {
  // First cancel booking to make it eligible for refund
  const cancelRes = await fetch(`${baseUrl}/bookings/${testBooking._id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie
    },
    body: JSON.stringify({ reason: 'Trip rescheduled' })
  });
  assert.equal(cancelRes.status, 200);

  // Now process refund
  const refundRes = await fetch(`${baseUrl}/payments/${testBooking._id}/refund`, {
    method: 'POST',
    headers: { Cookie: customerCookie }
  });

  assert.equal(refundRes.status, 200);
  const json = await refundRes.json();
  assert.equal(json.success, true);
  assert.equal(json.data.refundStatus, 'PROCESSED');
  assert.ok(json.data.refundEligiblePaise > 0);
});