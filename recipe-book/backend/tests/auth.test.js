process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');

jest.mock('../models/db', () => ({ query: jest.fn() }));

const db = require('../models/db');
const app = require('../app');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registers a user', async () => {
    db.query.mockResolvedValueOnce([]).mockResolvedValueOnce({ insertId: 1 });

    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'password123'
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('registered');
  });

  test('rejects duplicate email', async () => {
    db.query.mockResolvedValueOnce([{ id: 1 }]);

    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'password123'
    });

    expect(response.status).toBe(409);
  });

  test('logs in with valid credentials', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    db.query.mockResolvedValueOnce([{ id: 1, email: 'user@example.com', password_hash: hash, role: 'user' }]);

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'password123'
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.role).toBe('user');
  });

  test('rejects wrong password', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    db.query.mockResolvedValueOnce([{ id: 1, email: 'user@example.com', password_hash: hash, role: 'user' }]);

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'wrong-password'
    });

    expect(response.status).toBe(401);
  });
});
