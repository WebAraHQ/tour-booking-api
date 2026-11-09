import { createServer } from 'node:http';
import { BookingError } from './store.js';
import { validateBooking } from './validation.js';

/** Small router built on node:http — no framework required. */
export function createApp(store) {
  const routes = [
    ['GET', /^\/health$/, () => [200, { status: 'ok' }]],
    ['GET', /^\/api\/tours$/, (_, query) => [200, store.listTours({
      category: query.get('category') ?? undefined,
      maxPrice: query.has('maxPrice') ? Number(query.get('maxPrice')) : undefined,
    })]],
    ['GET', /^\/api\/tours\/([\w-]+)$/, ([id]) => {
      const tour = store.getTour(id);
      return tour ? [200, tour] : [404, { error: 'Tour not found' }];
    }],
    ['POST', /^\/api\/bookings$/, (_, __, body) => {
      const errors = validateBooking(body);
      if (errors.length) return [400, { errors }];
      return [201, store.createBooking({ ...body, customerName: body.customerName.trim() })];
    }],
    ['GET', /^\/api\/bookings\/(\d+)$/, ([id]) => {
      const booking = store.getBooking(Number(id));
      return booking ? [200, booking] : [404, { error: 'Booking not found' }];
    }],
    ['POST', /^\/api\/bookings\/(\d+)\/cancel$/, ([id]) => [200, store.cancelBooking(Number(id))]],
  ];

  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };

    try {
      const route = routes.find(([method, pattern]) => method === req.method && pattern.test(url.pathname));
      if (!route) return send(404, { error: 'Not found' });

      const params = url.pathname.match(route[1]).slice(1);
      const body = req.method === 'POST' ? await readJson(req) : undefined;
      const [status, data] = route[2](params, url.searchParams, body);
      send(status, data);
    } catch (error) {
      if (error instanceof BookingError) return send(error.status, { error: error.message });
      if (error instanceof SyntaxError) return send(400, { error: 'Invalid JSON body' });
      console.error(error);
      send(500, { error: 'Internal server error' });
    }
  });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}
