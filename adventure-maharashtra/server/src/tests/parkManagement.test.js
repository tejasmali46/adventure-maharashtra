import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import Park from '../models/Park.js';
import Package from '../models/Package.js';

let serverInstance;
let baseUrl;

let parkAdminCookie = '';
let superAdminCookie = '';
let customerCookie = '';
let createdParkId = '';
let createdPackageId = '';

const testTimestamp = Date.now();
const testParkName = `Sahyadri Alpine Park ${testTimestamp}`;

test.before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });

  // Login as PARK_ADMIN
  const parkAdminRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner.imagicaa@adventuremaharashtra.in',
      password: 'Password@123'
    })
  });
  assert.equal(parkAdminRes.status, 200);
  const rawCookie = parkAdminRes.headers.get('set-cookie');
  parkAdminCookie = rawCookie ? rawCookie.split(';')[0] : '';

  // Login as SUPER_ADMIN
  const superAdminRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@adventuremaharashtra.in',
      password: 'Admin@12345'
    })
  });
  assert.equal(superAdminRes.status, 200);
  const rawSuperCookie = superAdminRes.headers.get('set-cookie');
  superAdminCookie = rawSuperCookie ? rawSuperCookie.split(';')[0] : '';

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
});

test.after(async () => {
  // Clean up any test parks and packages created
  if (createdParkId) {
    await Park.findByIdAndDelete(createdParkId);
    await Package.deleteMany({ park: createdParkId });
  }
  // Also clean up any lingering test parks with 'Sahyadri' in name
  await Park.deleteMany({ name: { $regex: /Sahyadri/i } });

  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await mongoose.disconnect();
});

test('GET /api/parks/admin/my-parks rejects unauthenticated requests with 401', async () => {
  const res = await fetch(`${baseUrl}/parks/admin/my-parks`);
  assert.equal(res.status, 401);
});

test('GET /api/parks/admin/my-parks rejects CUSTOMER role with 403', async () => {
  const res = await fetch(`${baseUrl}/parks/admin/my-parks`, {
    headers: { Cookie: customerCookie }
  });
  assert.equal(res.status, 403);
});

test('GET /api/parks/admin/my-parks returns owned parks for PARK_ADMIN', async () => {
  const res = await fetch(`${baseUrl}/parks/admin/my-parks`, {
    headers: { Cookie: parkAdminCookie }
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 1);
  const hasImagicaa = json.data.some((p) => p.slug === 'imagicaa-theme-park');
  assert.ok(hasImagicaa, 'Owner parks list must include Imagicaa');
});

test('POST /api/parks creates new park in PENDING status for PARK_ADMIN', async () => {
  const newParkPayload = {
    name: testParkName,
    tagline: 'Scenic mountain cliff canopy walks and ziplines in Mahabaleshwar',
    description: 'A brand new eco-friendly adventure destination featuring panoramic tree walks, mountain coaster, and high altitude rope lines.',
    city: 'Mahabaleshwar',
    district: 'Satara',
    address: 'Near Venna Lake, Mahabaleshwar 412806',
    latitude: 17.9237,
    longitude: 73.6586,
    category: 'Adventure Park',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    facilities: ['Mountain View Cafeteria', 'Certified Harness Gear', 'Free Parking'],
    startingPricePaise: 120000
  };

  const res = await fetch(`${baseUrl}/parks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: parkAdminCookie
    },
    body: JSON.stringify(newParkPayload)
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.approvalStatus, 'PENDING');
  assert.equal(json.data.name, testParkName);
  assert.equal(json.data.location.coordinates[0], 73.6586);
  assert.equal(json.data.location.coordinates[1], 17.9237);

  createdParkId = json.data._id;
  assert.ok(createdParkId, 'createdParkId should be valid ObjectId');
});

test('PUT /api/parks/:id allows PARK_ADMIN owner to update details', async () => {
  assert.ok(createdParkId, 'createdParkId must exist');
  const res = await fetch(`${baseUrl}/parks/${createdParkId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: parkAdminCookie
    },
    body: JSON.stringify({
      tagline: 'Updated: Western Ghats premier alpine adventure destination',
      cancellationPolicy: '100% refund up to 24 hours prior.'
    })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.tagline, 'Updated: Western Ghats premier alpine adventure destination');
});

test('PATCH /api/parks/:id/status allows SUPER_ADMIN to approve park', async () => {
  assert.ok(createdParkId, 'createdParkId must exist');
  // First verify park_admin cannot patch status
  const forbiddenRes = await fetch(`${baseUrl}/parks/${createdParkId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: parkAdminCookie
    },
    body: JSON.stringify({ approvalStatus: 'APPROVED' })
  });
  assert.equal(forbiddenRes.status, 403);

  // Super admin approves
  const res = await fetch(`${baseUrl}/parks/${createdParkId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: superAdminCookie
    },
    body: JSON.stringify({ approvalStatus: 'APPROVED', isActive: true })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.approvalStatus, 'APPROVED');
  assert.equal(json.data.isActive, true);
});

test('POST /api/packages creates a pass for the park', async () => {
  assert.ok(createdParkId, 'createdParkId must exist');
  const packagePayload = {
    park: createdParkId,
    name: 'Canopy Walk & Mountain Coaster Pass',
    description: 'Unlimited access to tree canopy walk and 3 rounds on the alpine mountain coaster.',
    pricePaise: 89900,
    includesExpress: false,
    visitorCategories: [
      { type: 'Adult (12+ yrs)', pricePaise: 89900 },
      { type: 'Child (5-11 yrs)', pricePaise: 69900 }
    ],
    features: ['Canopy tree walk', 'Alpine coaster 3 laps', 'Safety guide briefing']
  };

  const res = await fetch(`${baseUrl}/packages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: parkAdminCookie
    },
    body: JSON.stringify(packagePayload)
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.name, 'Canopy Walk & Mountain Coaster Pass');
  assert.equal(json.data.pricePaise, 89900);

  createdPackageId = json.data._id;
  assert.ok(createdPackageId, 'createdPackageId should be valid ObjectId');
});

test('PUT /api/packages/:id updates package pass information', async () => {
  assert.ok(createdPackageId, 'createdPackageId must exist');
  const res = await fetch(`${baseUrl}/packages/${createdPackageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: parkAdminCookie
    },
    body: JSON.stringify({
      name: 'VIP Canopy Walk & Mountain Coaster Pass',
      pricePaise: 95000,
      includesExpress: true
    })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.pricePaise, 95000);
  assert.equal(json.data.includesExpress, true);
});

test('GET /api/packages/park/:parkId returns packages for that park', async () => {
  assert.ok(createdParkId, 'createdParkId must exist');
  const res = await fetch(`${baseUrl}/packages/park/${createdParkId}`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.length >= 1);
  assert.equal(json.data[0]._id, createdPackageId);
});

test('DELETE /api/packages/:id marks package status as INACTIVE', async () => {
  assert.ok(createdPackageId, 'createdPackageId must exist');
  const res = await fetch(`${baseUrl}/packages/${createdPackageId}`, {
    method: 'DELETE',
    headers: { Cookie: parkAdminCookie }
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
});

test('DELETE /api/parks/:id allows SUPER_ADMIN to soft-deactivate park', async () => {
  assert.ok(createdParkId, 'createdParkId must exist');
  const res = await fetch(`${baseUrl}/parks/${createdParkId}`, {
    method: 'DELETE',
    headers: { Cookie: superAdminCookie }
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
});