import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Park from '../models/Park.js';
import Package from '../models/Package.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

let server;
let baseUrl;
let customerCookie = '';
let staffCookie = '';
let superAdminCookie = '';
let testParkId = '';
let testBookingId = '';
let createdReviewId = '';

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adventure_maharashtra');
  }

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  // 1. Authenticate Customer
  const custRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav@example.com', password: 'Password@123' })
  });
  const custCookies = custRes.headers.get('set-cookie');
  if (custCookies) customerCookie = custCookies.split(';')[0];

  // 2. Authenticate Park Admin / Staff
  const staffRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner.imagicaa@adventuremaharashtra.in', password: 'Password@123' })
  });
  const staffCookies = staffRes.headers.get('set-cookie');
  if (staffCookies) staffCookie = staffCookies.split(';')[0];

  // 3. Authenticate Super Admin
  const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@adventuremaharashtra.in', password: 'Admin@12345' })
  });
  const adminCookies = adminRes.headers.get('set-cookie');
  if (adminCookies) superAdminCookie = adminCookies.split(';')[0];

  // 4. Setup Test Park
  const staffUser = await User.findOne({ email: 'owner.imagicaa@adventuremaharashtra.in' });
  const custUser = await User.findOne({ email: 'aarav@example.com' });

  let park = await Park.findOne({ slug: 'imagicaa-theme-park' });
  if (!park) {
    park = await Park.create({
      name: `Review Horizon Park ${Date.now()}`,
      slug: `review-horizon-${Date.now()}`,
      tagline: 'Scenic vistas and thrills',
      description: 'Analytics test destination',
      category: 'Theme Park',
      city: 'Lonavala',
      address: 'Khopoli Hills',
      location: { type: 'Point', coordinates: [73.40, 18.75] },
      heroImage: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9',
      startingPricePaise: 150000,
      owner: staffUser._id,
      status: 'ACTIVE'
    });
  }
  testParkId = park._id.toString();

  // 5. Create Confirmed Booking for Customer (to guarantee Verified Booking badge)
  const pkg = await Package.findOne({ park: park._id }) || await Package.create({
    park: park._id,
    name: 'Standard Fun Pass',
    pricePaise: 150000,
    status: 'ACTIVE'
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const booking = await Booking.create({
    bookingReference: `AM-REV-${Date.now().toString().slice(-6)}`,
    user: custUser._id,
    park: park._id,
    package: pkg._id,
    packageSnapshot: { name: pkg.name, pricePaise: pkg.pricePaise, includesExpress: false },
    visitDate: new Date(todayStr),
    visitorQuantities: { adults: 2, children: 0, seniors: 0 },
    customerDetails: { name: custUser.name, email: custUser.email, phone: custUser.phone },
    priceBreakdown: {
      subtotalPaise: 300000,
      basePassesPaise: 300000,
      addonsPaise: 0,
      discountPaise: 0,
      taxPaise: 54000,
      totalAmountPaise: 354000
    },
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'SUCCESS'
  });
  testBookingId = booking._id.toString();
});

test.after(async () => {
  if (createdReviewId) await Review.findByIdAndDelete(createdReviewId);
  if (testBookingId) await Booking.findByIdAndDelete(testBookingId);
  if (server) await server.close();
  await mongoose.disconnect();
});
test('GET /api/reviews/park/:parkId returns reviews and rating breakdown stats', async () => {
  const res = await fetch(`${baseUrl}/api/reviews/park/${testParkId}`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data.reviews));
  assert.ok(data.data.stats);
  assert.ok(Array.isArray(data.data.stats.breakdown));
});

test('POST /api/reviews rejects unauthenticated submission with 401', async () => {
  const res = await fetch(`${baseUrl}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parkId: testParkId, rating: 5, comment: 'Amazing experience!' })
  });
  assert.equal(res.status, 401);
});

test('POST /api/reviews rejects invalid rating values with 400', async () => {
  const res = await fetch(`${baseUrl}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({ parkId: testParkId, rating: 6, comment: 'Invalid star count' })
  });
  assert.equal(res.status, 400);
});

test('POST /api/reviews successfully creates review with Verified Visitor badge', async () => {
  const res = await fetch(`${baseUrl}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({
      parkId: testParkId,
      rating: 5,
      comment: 'Top-tier rollercoaster rides and pristine park cleanliness. Truly loved the experience!'
    })
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.review.rating, 5);
  assert.equal(data.data.review.isVerifiedBooking, true);
  assert.ok(data.data.parkRating);
  createdReviewId = data.data.review._id;
});

test('GET /api/analytics/partner rejects unauthenticated access with 401', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/partner`);
  assert.equal(res.status, 401);
});

test('GET /api/analytics/partner rejects CUSTOMER role with 403', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/partner`, {
    headers: { Cookie: customerCookie }
  });
  assert.equal(res.status, 403);
});

test('GET /api/analytics/partner returns business metrics for PARK_ADMIN', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/partner`, {
    headers: { Cookie: staffCookie }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data.financials);
  assert.ok(typeof data.data.financials.grossRevenueRupees === 'number');
  assert.ok(data.data.bookingsVolume);
  assert.ok(data.data.visitorDemographics);
  assert.ok(Array.isArray(data.data.packagePerformance));
  assert.ok(data.data.turnstileOperations);
  assert.ok(data.data.guestSentiment);
});

test('GET /api/analytics/platform returns platform metrics for SUPER_ADMIN', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/platform`, {
    headers: { Cookie: superAdminCookie }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(typeof data.data.platformGMVRupees === 'number');
  assert.ok(typeof data.data.totalParks === 'number');
  assert.ok(typeof data.data.totalUsers === 'number');
});

test('DELETE /api/reviews/:id allows author to delete review', async () => {
  if (!createdReviewId) return;
  const res = await fetch(`${baseUrl}/api/reviews/${createdReviewId}`, {
    method: 'DELETE',
    headers: { Cookie: customerCookie }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  createdReviewId = null;
});