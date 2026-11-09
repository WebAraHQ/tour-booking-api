const PHONE_PATTERN = /^09\d{9}$/;

/** Returns a list of error messages for a booking request body. */
export function validateBooking(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return ['Request body must be a JSON object'];

  if (!Number.isInteger(body.departureId)) errors.push('departureId must be an integer');
  if (typeof body.customerName !== 'string' || body.customerName.trim().length < 2) {
    errors.push('customerName must be at least 2 characters');
  }
  if (typeof body.phone !== 'string' || !PHONE_PATTERN.test(body.phone)) {
    errors.push('phone must be an Iranian mobile number like 09121234567');
  }
  if (!Number.isInteger(body.travelers) || body.travelers < 1 || body.travelers > 10) {
    errors.push('travelers must be a whole number between 1 and 10');
  }
  return errors;
}
