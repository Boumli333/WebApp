const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../models/db');
const { sanitizeValue } = require('../models/sanitize');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again later.' }
});

async function register(req, res) {
  const { email, password } = sanitizeValue(req.body);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [
    email,
    passwordHash,
    'user'
  ]);

  return res.status(201).json({ message: 'User registered successfully' });
}

async function login(req, res) {
  const { email, password } = sanitizeValue(req.body);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

module.exports = { register, login, loginLimiter };
