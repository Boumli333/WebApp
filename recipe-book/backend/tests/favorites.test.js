process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');
const request = require('supertest');

jest.mock('../models/db', () => ({ query: jest.fn() }));

const db = require('../models/db');
const app = require('../app');

function token() {
  return jwt.sign({ id: 1, email: 'user@example.com', role: 'user' }, process.env.JWT_SECRET);
}

describe('Favorites API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('adds favorite', async () => {
    db.query.mockResolvedValueOnce({});

    const response = await request(app)
      .post('/api/v1/favorites/2')
      .set('Authorization', `Bearer ${token()}`);

    expect(response.status).toBe(201);
  });

  test('removes favorite', async () => {
    db.query.mockResolvedValueOnce({});

    const response = await request(app)
      .delete('/api/v1/favorites/2')
      .set('Authorization', `Bearer ${token()}`);

    expect(response.status).toBe(200);
  });
});
