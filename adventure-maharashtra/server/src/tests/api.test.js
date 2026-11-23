import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';

let serverInstance;
let baseUrl;

test.before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await mongoose.disconnect();
});

test('GET /api/health returns healthy status', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'healthy');
  assert.equal(data.service, 'Adventure Maharashtra API');
});

test('GET /api/parks returns full list with pagination', async () => {
  const res = await fetch(`${baseUrl}/parks`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.count >= 7, 'Expected at least 7 parks');
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data[0].name);
  assert.ok(json.data[0].startingPricePaise > 0);
});

test('GET /api/parks filters by city correctly', async () => {
  const res = await fetch(`${baseUrl}/parks?city=Lonavala`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.count >= 3);
  for (const park of json.data) {
    assert.equal(park.city.toLowerCase(), 'lonavala');
  }
});

test('GET /api/parks filters by category correctly', async () => {
  const res = await fetch(`${baseUrl}/parks?category=Water%20Park`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  for (const park of json.data) {
    assert.equal(park.category, 'Water Park');
  }
});

test('GET /api/parks filters by maxPrice correctly', async () => {
  const maxRs = 1000;
  const res = await fetch(`${baseUrl}/parks?maxPrice=${maxRs}`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  for (const park of json.data) {
    assert.ok(park.startingPricePaise <= maxRs * 100);
  }
});

test('GET /api/parks sorts by price-asc correctly', async () => {
  const res = await fetch(`${baseUrl}/parks?sort=price-asc`);
  assert.equal(res.status, 200);
  const json = await res.json();
  for (let i = 0; i < json.data.length - 1; i++) {
    assert.ok(json.data[i].startingPricePaise <= json.data[i + 1].startingPricePaise);
  }
});

test('GET /api/parks/:slug returns single park with populated packages', async () => {
  const res = await fetch(`${baseUrl}/parks/imagicaa-theme-park`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.slug, 'imagicaa-theme-park');
  assert.ok(json.data.packages.length > 0, 'Expected populated packages array');
  assert.ok(json.data.packages[0].pricePaise > 0);
});

test('GET /api/parks/:slug/availability returns schedule check', async () => {
  const res = await fetch(`${baseUrl}/parks/imagicaa-theme-park/availability?date=2026-11-01`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok('isAvailable' in json);
  assert.ok(json.operatingHours);
});

test('GET /api/activities returns list with real park count', async () => {
  const res = await fetch(`${baseUrl}/activities`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.count >= 8);
  assert.ok('parkCount' in json.data[0]);
});

test('GET /api/destinations returns regional hubs with park counts', async () => {
  const res = await fetch(`${baseUrl}/destinations`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.count >= 5);
  assert.ok(json.data[0].parkCount >= 1);
});

test('POST /api/coupons/validate calculates percentage discount accurately', async () => {
  const payload = {
    code: 'ADVENTURE25',
    subtotalPaise: 200000, // ₹2,000
    guestCount: 2,
    visitDate: '2026-11-04' // Wednesday
  };

  const res = await fetch(`${baseUrl}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.valid, true);
  assert.equal(json.data.discountPaise, 50000); // 25% of 200,000 paise = 50,000 paise (₹500)
  assert.equal(json.data.newTotalPaise, 150000); // ₹1,500
});

test('POST /api/coupons/validate rejects invalid coupon code', async () => {
  const payload = {
    code: 'NONEXISTENT_CODE_XYZ',
    subtotalPaise: 100000
  };

  const res = await fetch(`${baseUrl}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 404);
  const json = await res.json();
  assert.equal(json.valid, false);
});

test('404 Error handler triggers on non-existent endpoints', async () => {
  const res = await fetch(`${baseUrl}/unknown-endpoint-route`);
  assert.equal(res.status, 404);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.ok(json.message.includes('not found'));
});