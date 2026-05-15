const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const favoriteRoutes = require('./routes/favorites');
const { issueCsrfToken, verifyCsrf } = require('./middleware/csrf');

const app = express();
const isTest = process.env.NODE_ENV === 'test';

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

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

app.use((_err, _req, res, _next) => {
  return res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
