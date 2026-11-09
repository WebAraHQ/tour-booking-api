import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BookingError, TourStore } from '../src/store.js';
import { validateBooking } from '../src/validation.js';

const makeStore = () => new TourStore({
  tours: [
    { id: 'north', title: 'North Trip', category: 'domestic', price: 1000 },
    { id: 'istanbul', title: 'Istanbul', category: 'international', price: 5000 },
  ],
  departures: [
    { id: 1, tourId: 'north', date: '2999-01-10', capacity: 3 },
    { id: 2, tourId: 'north', date: '2000-01-01', capacity: 3 },
  ],
});

const booking = (overrides = {}) => ({
  departureId: 1, customerName: 'Sara', phone: '09121234567', travelers: 2, ...overrides,
});

test('filters tours by category and price', () => {
  const store = makeStore();
  assert.equal(store.listTours({ category: 'domestic' }).length, 1);
  assert.equal(store.listTours({ maxPrice: 2000 }).length, 1);
});

test('past departures are hidden', () => {
  const tour = makeStore().getTour('north');
  assert.deepEqual(tour.departures.map((d) => d.id), [1]);
});

test('booking reserves seats and calculates price', () => {
  const store = makeStore();
  const result = store.createBooking(booking());
  assert.equal(result.totalPrice, 2000);
  assert.equal(store.getTour('north').departures[0].seatsLeft, 1);
});

test('cannot book more seats than available', () => {
  const store = makeStore();
  store.createBooking(booking());
  assert.throws(() => store.createBooking(booking()), (error) => error instanceof BookingError && error.status === 409);
});

test('cancelling frees the seats and cannot be repeated', () => {
  const store = makeStore();
  const { id } = store.createBooking(booking({ travelers: 3 }));
  assert.equal(store.getTour('north').departures[0].soldOut, true);
  store.cancelBooking(id);
  assert.equal(store.getTour('north').departures[0].seatsLeft, 3);
  assert.throws(() => store.cancelBooking(id), /already cancelled/);
});

test('validation reports every invalid field', () => {
  assert.deepEqual(validateBooking(booking()), []);
  const errors = validateBooking({ departureId: 'x', customerName: 'A', phone: '123', travelers: 0 });
  assert.equal(errors.length, 4);
});
