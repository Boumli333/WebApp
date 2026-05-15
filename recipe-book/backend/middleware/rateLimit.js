const rateLimit = require('express-rate-limit');

const protectedRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Try again later.' }
});

module.exports = { protectedRouteLimiter };
