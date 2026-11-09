import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';
import { sampleData } from '../src/seed.js';
import { TourStore } from '../src/store.js';

let server;
let baseUrl;

before(async () => {
  server = createApp(new TourStore(sampleData()));
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const post = (path, body) => fetch(baseUrl + path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('GET /health', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
});

test('GET /api/tours lists tours with departure counts', async () => {
  const tours = await (await fetch(`${baseUrl}/api/tours?category=domestic`)).json();
  assert.equal(tours.length, 2);
  assert.ok(tours.every((tour) => typeof tour.upcomingDepartures === 'number'));
});

test('GET /api/tours/:id returns 404 for unknown tour', async () => {
  const res = await fetch(`${baseUrl}/api/tours/unknown`);
  assert.equal(res.status, 404);
});

test('booking flow: create, fetch, cancel', async () => {
  const created = await post('/api/bookings', {
    departureId: 1, customerName: 'Reza', phone: '09351234567', travelers: 2,
  });
  assert.equal(created.status, 201);
  const booking = await created.json();
  assert.equal(booking.totalPrice, 18000000);

  const fetched = await (await fetch(`${baseUrl}/api/bookings/${booking.id}`)).json();
  assert.equal(fetched.customerName, 'Reza');

  const cancelled = await (await post(`/api/bookings/${booking.id}/cancel`, {})).json();
  assert.equal(cancelled.status, 'cancelled');
});

test('sold out departure returns 409', async () => {
  const res = await post('/api/bookings', {
    departureId: 3, customerName: 'Ali', phone: '09121111111', travelers: 1,
  });
  assert.equal(res.status, 409);
});

test('invalid body returns 400 with errors', async () => {
  const res = await post('/api/bookings', { departureId: 1, travelers: 50 });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).errors.length >= 3);
});

test('malformed JSON returns 400', async () => {
  const res = await post('/api/bookings', '{not json');
  assert.equal(res.status, 400);
});
