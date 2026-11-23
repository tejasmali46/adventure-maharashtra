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

const randomEmail = `test.seeker.${Date.now()}@example.com`;
let authToken = '';

test('POST /api/auth/register creates new customer with hashed password', async () => {
  const payload = {
    name: 'Rohan Deshmukh',
    email: randomEmail,
    password: 'SecurePassword123',
    passwordConfirm: 'SecurePassword123',
    phone: '+91 99887 66554'
  };

  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.user.email, randomEmail);
  assert.equal(json.user.role, 'CUSTOMER');
  assert.equal(json.user.passwordHash, undefined, 'passwordHash must never be returned to client');
  assert.ok(json.token);
  authToken = json.token;
});

test('POST /api/auth/register rejects duplicate email address', async () => {
  const payload = {
    name: 'Rohan Duplicate',
    email: randomEmail,
    password: 'SecurePassword123'
  };

  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.ok(json.message.includes('already exists'));
});

test('POST /api/auth/login authenticates with valid credentials', async () => {
  const payload = {
    email: randomEmail,
    password: 'SecurePassword123'
  };

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.token);
  assert.equal(json.user.name, 'Rohan Deshmukh');

  // Verify Set-Cookie header contains HttpOnly adv_auth_token
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie && setCookie.includes('adv_auth_token='));
  assert.ok(setCookie.includes('HttpOnly'));
});

test('POST /api/auth/login rejects incorrect password', async () => {
  const payload = {
    email: randomEmail,
    password: 'WrongPassword999'
  };

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 401);
  const json = await res.json();
  assert.equal(json.success, false);
});

test('GET /api/auth/me returns authenticated user details', async () => {
  const res = await fetch(`${baseUrl}/auth/me`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.user.email, randomEmail);
  assert.equal(json.user.role, 'CUSTOMER');
});

test('GET /api/auth/me rejects unauthenticated request', async () => {
  const res = await fetch(`${baseUrl}/auth/me`);
  assert.equal(res.status, 401);
  const json = await res.json();
  assert.equal(json.success, false);
});

test('PUT /api/auth/profile updates user contact information', async () => {
  const payload = {
    name: 'Rohan S. Deshmukh',
    phone: '+91 99887 00000'
  };

  const res = await fetch(`${baseUrl}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.user.name, 'Rohan S. Deshmukh');
  assert.equal(json.user.phone, '+91 99887 00000');
});

test('POST /api/favorites adds a park to saved favorites', async () => {
  // First fetch an existing park
  const parksRes = await fetch(`${baseUrl}/parks`);
  const parksJson = await parksRes.json();
  const parkId = parksJson.data[0]._id;

  const res = await fetch(`${baseUrl}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ parkId })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);

  // Verify list
  const listRes = await fetch(`${baseUrl}/favorites`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const listJson = await listRes.json();
  assert.equal(listJson.count, 1);
  assert.equal(listJson.data[0]._id, parkId);
});

test('POST /api/auth/logout clears session cookie', async () => {
  const res = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST'
  });

  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie.includes('adv_auth_token=;'));
});