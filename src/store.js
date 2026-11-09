/**
 * In-memory data store for tours, departures and bookings.
 * Business rules live here so they can be tested without HTTP.
 */

export class BookingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export class TourStore {
  #tours = new Map();
  #departures = new Map();
  #bookings = new Map();
  #nextBookingId = 1001;

  constructor({ tours = [], departures = [] } = {}) {
    for (const tour of tours) this.#tours.set(tour.id, { ...tour });
    for (const departure of departures) {
      this.#departures.set(departure.id, { ...departure, bookedSeats: departure.bookedSeats ?? 0 });
    }
  }

  listTours({ category, maxPrice } = {}) {
    return [...this.#tours.values()]
      .filter((tour) => !category || tour.category === category)
      .filter((tour) => !maxPrice || tour.price <= maxPrice)
      .map((tour) => ({ ...tour, upcomingDepartures: this.listDepartures(tour.id).length }));
  }

  getTour(id) {
    const tour = this.#tours.get(id);
    return tour ? { ...tour, departures: this.listDepartures(id) } : null;
  }

  listDepartures(tourId, today = new Date().toISOString().slice(0, 10)) {
    return [...this.#departures.values()]
      .filter((departure) => departure.tourId === tourId && departure.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((departure) => this.#withAvailability(departure));
  }

  createBooking({ departureId, customerName, phone, travelers }) {
    const departure = this.#departures.get(departureId);
    if (!departure) throw new BookingError('Departure not found', 404);

    const seatsLeft = departure.capacity - departure.bookedSeats;
    if (travelers > seatsLeft) {
      throw new BookingError(
        seatsLeft === 0 ? 'This departure is fully booked' : `Only ${seatsLeft} seats left`,
        409,
      );
    }

    const tour = this.#tours.get(departure.tourId);
    departure.bookedSeats += travelers;
    const booking = {
      id: this.#nextBookingId++,
      departureId,
      tourTitle: tour.title,
      date: departure.date,
      customerName,
      phone,
      travelers,
      totalPrice: tour.price * travelers,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    this.#bookings.set(booking.id, booking);
    return booking;
  }

  getBooking(id) {
    return this.#bookings.get(id) ?? null;
  }

  cancelBooking(id) {
    const booking = this.#bookings.get(id);
    if (!booking) throw new BookingError('Booking not found', 404);
    if (booking.status === 'cancelled') throw new BookingError('Booking is already cancelled', 409);
    this.#departures.get(booking.departureId).bookedSeats -= booking.travelers;
    booking.status = 'cancelled';
    return booking;
  }

  #withAvailability(departure) {
    const seatsLeft = departure.capacity - departure.bookedSeats;
    return { ...departure, seatsLeft, soldOut: seatsLeft === 0 };
  }
}
