const crypto = require('crypto');

function parseCookies(header = '') {
  return header.split(';').reduce((acc, chunk) => {
    const [rawKey, ...rest] = chunk.split('=');
    const key = (rawKey || '').trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('=').trim());
    return acc;
  }, {});
}

function issueCsrfToken(_req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.setHeader(
    'Set-Cookie',
    `csrf_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
  res.json({ csrfToken: token });
}

function verifyCsrf(req, res, next) {
  const method = (req.method || 'GET').toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const cookieToken = cookies.csrf_token;
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
