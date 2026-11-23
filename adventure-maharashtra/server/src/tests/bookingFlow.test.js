import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import Park from '../models/Park.js';
import Package from '../models/Package.js';
import Booking from '../models/Booking.js';

let serverInstance;
let baseUrl;

let customerCookie = '';
let testPark;
let testPackage;
let createdBookingId = '';
let createdBookingRef = '';

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

  // Get test park (Imagicaa) and its package
  testPark = await Park.findOne({ slug: 'imagicaa-theme-park' });
  assert.ok(testPark, 'Imagicaa park must exist from seed');
  testPackage = await Package.findOne({ park: testPark._id });
  assert.ok(testPackage, 'Imagicaa package must exist from seed');
});

test.after(async () => {
  if (createdBookingId) {
    await Booking.findByIdAndDelete(createdBookingId);
  }
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await mongoose.disconnect();
});

test('POST /api/bookings/calculate validates pricing with GST and add-ons', async () => {
  // Use a future Saturday for weekend surge test
  const futureSaturday = new Date();
  futureSaturday.setDate(futureSaturday.getDate() + ((6 - futureSaturday.getDay() + 7) % 7 || 7));
  const dateStr = futureSaturday.toISOString().split('T')[0];

  const payload = {
    parkId: testPark._id.toString(),
    packageId: testPackage._id.toString(),
    visitDate: dateStr,
    visitorQuantities: { adults: 2, children: 1, seniors: 0 },
    addons: [
      { name: 'Electronic Locker Rental', pricePaise: 20000, quantity: 1 },
      { name: 'Buffet Meal Voucher', pricePaise: 35000, quantity: 2 }
    ]
  };

  const res = await fetch(`${baseUrl}/bookings/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.totalPasses, 3);
  assert.equal(json.data.isWeekend, true);
  assert.ok(json.data.weekendSurgePaise > 0, 'Weekend surge must apply on Saturday');
  assert.equal(json.data.addonsPaise, 20000 + (35000 * 2)); // 90000 paise
  assert.ok(json.data.taxPaise > 0, '18% GST must be computed');
  assert.equal(
    json.data.totalAmountPaise, 
    json.data.taxableAmountPaise + json.data.taxPaise, 
    'Total must equal taxable amount + 18% GST'
  );
});

test('POST /api/bookings/calculate applies coupon discount successfully', async () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const dateStr = futureDate.toISOString().split('T')[0];

  const payload = {
    parkId: testPark._id.toString(),
    packageId: testPackage._id.toString(),
    visitDate: dateStr,
    visitorQuantities: { adults: 2, children: 0, seniors: 0 },
    couponCode: 'STUDENT20'
  };

  const res = await fetch(`${baseUrl}/bookings/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.discountPaise > 0, 'Discount must be applied for STUDENT20');
  assert.equal(json.data.couponApplied.code, 'STUDENT20');
});

test('POST /api/bookings rejects unauthenticated request with 401', async () => {
  const res = await fetch(`${baseUrl}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parkId: testPark._id, packageId: testPackage._id, visitDate: '2026-11-20' })
  });
  assert.equal(res.status, 401);
});

test('POST /api/bookings creates confirmed booking with unique reference', async () => {
  const futureVisitDate = new Date();
  futureVisitDate.setDate(futureVisitDate.getDate() + 14); // 14 days in future
  const dateStr = futureVisitDate.toISOString().split('T')[0];

  const bookingPayload = {
    parkId: testPark._id.toString(),
    packageId: testPackage._id.toString(),
    visitDate: dateStr,
    visitorQuantities: { adults: 2, children: 1, seniors: 0 },
    addons: [{ name: 'Locker Rental', pricePaise: 20000, quantity: 1 }],
    customerDetails: {
      name: 'Aarav Deshmukh',
      email: 'aarav@example.com',
      phone: '+91 98765 43210'
    },
    couponCode: 'STUDENT20'
  };

  const res = await fetch(`${baseUrl}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie
    },
    body: JSON.stringify(bookingPayload)
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.bookingReference.startsWith('AM-'));
  assert.equal(json.data.bookingStatus, 'CONFIRMED');
  assert.equal(json.data.paymentStatus, 'SUCCESS');
  assert.equal(json.data.customerDetails.name, 'Aarav Deshmukh');

  createdBookingId = json.data._id;
  createdBookingRef = json.data.bookingReference;
});

test('GET /api/bookings/my-bookings returns user bookings', async () => {
  const res = await fetch(`${baseUrl}/bookings/my-bookings`, {
    headers: { Cookie: customerCookie }
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 1);
  const found = json.data.some((b) => b._id === createdBookingId);
  assert.ok(found, 'Created booking must be present in user bookings list');
});

test('GET /api/bookings/:id retrieves booking by reference code', async () => {
  const res = await fetch(`${baseUrl}/bookings/${createdBookingRef}`, {
    headers: { Cookie: customerCookie }
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.bookingReference, createdBookingRef);
});

test('PUT /api/bookings/:id/cancel calculates full refund for visit > 48h away', async () => {
  const res = await fetch(`${baseUrl}/bookings/${createdBookingId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie
    },
    body: JSON.stringify({ reason: 'Trip rescheduled due to work' })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.bookingStatus, 'CANCELLED');
  assert.equal(json.data.cancellationDetails.refundPercentage, 100);
  assert.ok(json.data.cancellationDetails.refundEligiblePaise > 0);
  assert.equal(json.data.cancellationDetails.refundStatus, 'PENDING');
});