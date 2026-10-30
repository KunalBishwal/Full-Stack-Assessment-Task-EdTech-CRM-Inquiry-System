import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../dist/app.js';
import { pool, verifyDatabaseConnection } from '../dist/config/database.js';

process.env.NODE_ENV = 'test';

describe('K12 Hunar Backend Integration Test Suite (Supabase PostgreSQL & Express)', () => {
  let server;
  let baseUrl;
  let authToken = '';
  let createdInquiryId = '';

  const testAdmin = {
    email: 'admin@k12hunar.edu.in',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'HunarAdmin#2026',
  };

  before(async () => {
    // 1. Verify Supabase DB connection
    await verifyDatabaseConnection();

    // 2. Start test Express server on an ephemeral port
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}/api`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  });

  test('1. Database connectivity check', async () => {
    const res = await pool.query('SELECT 1 as connected');
    assert.equal(res.rows[0].connected, 1);
  });

  test('2. Health check endpoint (GET /api/health)', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.service, 'k12-hunar-api');
  });

  test('3. Submit public inquiry (POST /api/inquiries)', async () => {
    const payload = {
      name: 'Priya Sharma Test',
      email: 'priya.test@example.com',
      phone: '+91 98765 43210',
      user_type: 'Parent',
      category: 'Scholarship',
      message: 'I am inquiring about the merit scholarship application deadline for Grade 9.',
    };

    const res = await fetch(`${baseUrl}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.inquiry.id);
    assert.equal(body.data.inquiry.name, payload.name);
    assert.equal(body.data.inquiry.email, payload.email);
    assert.equal(body.data.inquiry.phone, payload.phone);
    assert.equal(body.data.inquiry.user_type, 'Parent');
    assert.equal(body.data.inquiry.category, 'Scholarship');
    assert.equal(body.data.inquiry.status, 'New');

    createdInquiryId = body.data.inquiry.id;
  });

  test('4. Reject invalid inquiry payload with 400 Bad Request', async () => {
    const invalidPayload = {
      name: 'A', // too short
      email: 'invalid-email',
      phone: '123', // too short
      user_type: 'InvalidType',
      category: 'NonExistent',
      message: 'short',
    };

    const res = await fetch(`${baseUrl}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.errors.length >= 4);
  });

  test('5. Reject unauthenticated access to admin routes (GET /api/inquiries)', async () => {
    const res = await fetch(`${baseUrl}/inquiries`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test('6. Reject invalid token with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/inquiries`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test('7. Admin login failure with wrong password (POST /api/auth/login)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmin.email,
        password: 'WrongPassword123!',
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test('8. Admin login success with valid credentials (POST /api/auth/login)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password,
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token, 'Expected JWT token');
    assert.equal(body.data.admin.email, testAdmin.email);

    authToken = body.data.token;
  });

  test('9. Admin profile check (GET /api/auth/me)', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.admin.email, testAdmin.email);
  });

  test('10. Admin inquiry list & summary counts (GET /api/inquiries)', async () => {
    const res = await fetch(`${baseUrl}/inquiries?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.items));
    assert.ok(body.data.items.length > 0);
    assert.ok(body.data.pagination);
    assert.ok(body.data.pagination.total >= 1);
    assert.ok(body.data.summary);
    assert.ok(typeof body.data.summary.total === 'number');
  });

  test('11. Filter inquiries by category, user_type, and search (GET /api/inquiries)', async () => {
    const searchUrl = `${baseUrl}/inquiries?category=Scholarship&user_type=Parent&search=Priya`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.items.length >= 1);
    assert.equal(body.data.items[0].category, 'Scholarship');
    assert.equal(body.data.items[0].user_type, 'Parent');
  });

  test('12. Update inquiry status persistently (PATCH /api/inquiries/:id/status)', async () => {
    assert.ok(createdInquiryId, 'A valid inquiry ID must exist');

    // Update status to 'Contacted'
    const res1 = await fetch(`${baseUrl}/inquiries/${createdInquiryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: 'Contacted' }),
    });

    assert.equal(res1.status, 200);
    const body1 = await res1.json();
    assert.equal(body1.success, true);
    assert.equal(body1.data.inquiry.status, 'Contacted');

    // Verify persistence via GET /api/inquiries/:id
    const res2 = await fetch(`${baseUrl}/inquiries/${createdInquiryId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res2.status, 200);
    const body2 = await res2.json();
    assert.equal(body2.data.inquiry.status, 'Contacted');

    // Update status to 'Resolved'
    const res3 = await fetch(`${baseUrl}/inquiries/${createdInquiryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: 'Resolved' }),
    });
    assert.equal(res3.status, 200);
    const body3 = await res3.json();
    assert.equal(body3.data.inquiry.status, 'Resolved');
  });
});
