# Tour Booking API

A REST API for travel agencies: tours, upcoming departures, live seat availability and bookings with cancellation.

Built with **Node.js** and the built-in `node:http` module — **zero runtime dependencies** — and tested with the native `node:test` runner.

![tests](https://github.com/WebAraHQ/tour-booking-api/actions/workflows/tests.yml/badge.svg)

## Features

- Tour catalog with filters by category and maximum price
- Upcoming departures only, sorted by date, with `seatsLeft` and `soldOut`
- Bookings that never exceed departure capacity (`409 Conflict` when full)
- Cancellation that returns seats to the departure
- Request validation, including Iranian mobile number format
- Consistent JSON errors (`400`, `404`, `409`, `500`)
- 13 automated tests covering business rules and HTTP endpoints

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/tours?category=&maxPrice=` | List tours |
| `GET` | `/api/tours/:id` | Tour details with upcoming departures |
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/bookings/:id` | Get a booking |
| `POST` | `/api/bookings/:id/cancel` | Cancel a booking |

### Create a booking

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"departureId": 1, "customerName": "Sara", "phone": "09121234567", "travelers": 2}'
```

```json
{
  "id": 1001,
  "tourTitle": "Northern Iran Weekend",
  "travelers": 2,
  "totalPrice": 18000000,
  "status": "confirmed"
}
```

## Getting Started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/WebAraHQ/tour-booking-api.git
cd tour-booking-api
npm start
```

The server starts on port `3000` (set `PORT` to change it) with sample tours.

## Running Tests

```bash
npm test
```

## Project Structure

```
src/
  app.js         HTTP server and routing
  store.js       Tours, departures and booking rules
  validation.js  Request validation
  seed.js        Sample data
  server.js      Entry point
test/            Unit and API tests
```

## About

Developed by [WebAra](https://web-ara.com) — a software studio building web platforms, mobile apps and AI-powered products.

## License

[MIT](LICENSE) © WebAra
