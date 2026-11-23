import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Park from '../models/Park.js';
import Package from '../models/Package.js';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';

let server;
let baseUrl;
let customerCookie = '';
let staffCookie = '';
let testParkId = '';
let wrongParkId = '';
let testBookingId = '';
let testTicket = null;

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
  if (custCookies) {
    customerCookie = custCookies.split(';')[0];
  }

  // 2. Authenticate Park Admin / Staff
  const staffRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner.imagicaa@adventuremaharashtra.in', password: 'Password@123' })
  });
  const staffCookies = staffRes.headers.get('set-cookie');
  if (staffCookies) {
    staffCookie = staffCookies.split(';')[0];
  }

  // 3. Obtain Parks
  let park1 = await Park.findOne({ slug: 'imagicaa-theme-park' });
  let park2 = await Park.findOne({ slug: 'wet-n-joy-water-park' });

  if (!park1) {
    const staffUser = await User.findOne({ email: 'owner.imagicaa@adventuremaharashtra.in' });
    park1 = await Park.create({
      name: `Thunder Park ${Date.now()}`,
      slug: `thunder-park-${Date.now()}`,
      tagline: 'High Speed Gate Adrenaline',
      description: 'Premier test park for turnstile validation',
      category: 'Theme Park',
      city: 'Pune',
      address: 'Turnstile Way',
      location: { type: 'Point', coordinates: [73.85, 18.52] },
      heroImage: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9',
      startingPricePaise: 120000,
      owner: staffUser._id,
      status: 'ACTIVE'
    });
  }
  testParkId = park1._id.toString();

  if (!park2) {
    const staffUser = await User.findOne({ email: 'owner.imagicaa@adventuremaharashtra.in' });
    park2 = await Park.create({
      name: `Splash Island ${Date.now()}`,
      slug: `splash-island-${Date.now()}`,
      tagline: 'Waterpark Cross Check',
      description: 'Second park for cross-park test',
      category: 'Water Park',
      city: 'Lonavala',
      address: 'Splash Blvd',
      location: { type: 'Point', coordinates: [73.40, 18.75] },
      heroImage: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9',
      startingPricePaise: 100000,
      owner: staffUser._id,
      status: 'ACTIVE'
    });
  }
  wrongParkId = park2._id.toString();

  // 4. Create Package and Booking
  const pkg = await Package.create({
    park: park1._id,
    name: 'Turnstile Express Pass',
    description: 'Instant turnstile gate test pass',
    pricePaise: 150000,
    includesExpress: true,
    status: 'ACTIVE'
  });

  const custUser = await User.findOne({ email: 'aarav@example.com' });
  const todayStr = new Date().toISOString().split('T')[0];

  const booking = await Booking.create({
    bookingReference: `AM-TKT-${Date.now().toString().slice(-6)}`,
    user: custUser._id,
    park: park1._id,
    package: pkg._id,
    packageSnapshot: {
      name: pkg.name,
      pricePaise: pkg.pricePaise,
      includesExpress: true
    },
    visitDate: new Date(todayStr),
    visitorQuantities: { adults: 2, children: 1, seniors: 0 },
    customerDetails: {
      name: custUser.name,
      email: custUser.email,
      phone: custUser.phone
    },
    priceBreakdown: {
      subtotalPaise: 337500,
      basePassesPaise: 337500,
      addonsPaise: 0,
      discountPaise: 0,
      taxPaise: 60750,
      totalAmountPaise: 398250
    },
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'SUCCESS'
  });
  testBookingId = booking._id.toString();

  // 5. Create Digital Ticket
  testTicket = await Ticket.create({
    ticketReference: `TK-${booking.bookingReference}`,
    booking: booking._id,
    park: park1._id,
    visitDate: booking.visitDate,
    qrToken: `qr_token_test_${Date.now()}`,
    totalAdmissions: 3,
    admissionsRedeemed: 0,
    isFullyRedeemed: false,
    redemptionHistory: []
  });
});

test.after(async () => {
  if (testTicket) await Ticket.findByIdAndDelete(testTicket._id);
  if (testBookingId) await Booking.findByIdAndDelete(testBookingId);
  if (server) await server.close();
  await mongoose.disconnect();
});

test('GET /api/tickets/booking/:bookingId returns tickets with generated QR Code Data URL', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/booking/${testBookingId}`, {
    headers: { Cookie: customerCookie }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.equal(data.data.length, 1);
  assert.ok(data.data[0].qrCodeDataUrl.startsWith('data:image/png;base64,'));
  assert.equal(data.data[0].totalAdmissions, 3);
});

test('GET /api/tickets/ref/:ticketReference returns single ticket with venue and package details', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/ref/${testTicket.ticketReference}`, {
    headers: { Cookie: customerCookie }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.ticketReference, testTicket.ticketReference);
  assert.ok(data.data.park.name);
  assert.ok(data.data.qrCodeDataUrl);
});

test('POST /api/tickets/scan rejects unauthenticated turnstile scan with 401', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken: testTicket.qrToken, parkId: testParkId })
  });
  assert.equal(res.status, 401);
});

test('POST /api/tickets/scan rejects CUSTOMER role trying to scan with 403', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({ qrToken: testTicket.qrToken, parkId: testParkId })
  });
  assert.equal(res.status, 403);
});

test('POST /api/tickets/scan rejects cross-park ticket scans with 400', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
    body: JSON.stringify({
      qrToken: testTicket.qrToken,
      parkId: wrongParkId,
      gateNumber: 'Turnstile A'
    })
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.code, 'CROSS_PARK_REJECTION');
});

test('POST /api/tickets/scan successfully admits visitors and tracks gate history', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
    body: JSON.stringify({
      qrToken: testTicket.qrToken,
      parkId: testParkId,
      gateNumber: 'Main Gate 01',
      countToRedeem: 2,
      bypassDateCheck: true
    })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'ADMITTED');
  assert.equal(data.data.admittedNow, 2);
  assert.equal(data.data.remainingAdmissions, 1);
  assert.equal(data.data.isFullyRedeemed, false);
});

test('POST /api/tickets/scan redeems final admission and marks pass as fully redeemed', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
    body: JSON.stringify({
      qrToken: testTicket.qrToken,
      parkId: testParkId,
      gateNumber: 'Main Gate 02',
      countToRedeem: 1,
      bypassDateCheck: true
    })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.remainingAdmissions, 0);
  assert.equal(data.data.isFullyRedeemed, true);
});

test('POST /api/tickets/scan rejects replay attack on already redeemed pass with 400', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
    body: JSON.stringify({
      qrToken: testTicket.qrToken,
      parkId: testParkId,
      gateNumber: 'Turnstile B',
      countToRedeem: 1,
      bypassDateCheck: true
    })
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.code, 'ALREADY_REDEEMED');
  assert.ok(data.message.includes('Pass Already Used'));
});

test('GET /api/tickets/history/:parkId returns turnstile admissions audit log', async () => {
  const res = await fetch(`${baseUrl}/api/tickets/history/${testParkId}`, {
    headers: { Cookie: staffCookie }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data.recentScans.length >= 2);
  assert.equal(data.data.recentScans[0].ticketReference, testTicket.ticketReference);
});