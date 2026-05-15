const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const favoriteRoutes = require('./routes/favorites');
const { issueCsrfToken, verifyCsrf } = require('./middleware/csrf');

const app = express();
const isTest = process.env.NODE_ENV === 'test';
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5500,http://127.0.0.1:5500')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

if (!isTest) {
  app.get('/api/v1/auth/csrf-token', issueCsrfToken);
  app.use('/api/v1', verifyCsrf);
}

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/favorites', favoriteRoutes);

app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, _req, res, _next) => {
  if (err.message === 'CORS blocked') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }
  return res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
