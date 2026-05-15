const crypto = require('crypto');

function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ csrfToken: token });
}

function verifyCsrf(req, res, next) {
  const method = (req.method || 'GET').toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  try {
    const left = Buffer.from(cookieToken);
    const right = Buffer.from(headerToken);
    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
  } catch (_error) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  return next();
}

module.exports = { issueCsrfToken, verifyCsrf };
