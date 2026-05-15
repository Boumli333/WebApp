process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');
const request = require('supertest');

jest.mock('../models/db', () => ({ query: jest.fn() }));

const db = require('../models/db');
const app = require('../app');

function token(role) {
  return jwt.sign({ id: 1, email: `${role}@example.com`, role }, process.env.JWT_SECRET);
}

describe('Recipes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('lists recipes publicly', async () => {
    db.query.mockResolvedValueOnce([{ total: 1 }]).mockResolvedValueOnce([{ id: 1, title: 'Soup', description: 'Warm', category: 'Dinner', base_serving_size: 2 }]);

    const response = await request(app).get('/api/v1/recipes');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  test('creates recipe as logged in user', async () => {
    db.query.mockResolvedValueOnce({ insertId: 1 }).mockResolvedValueOnce({});

    const response = await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token('user')}`)
      .send({
        title: 'Soup',
        description: 'Warm',
        category: 'Dinner',
        steps: 'Boil',
        baseServingSize: 2,
        ingredients: [{ name: 'Water', quantity: 1, unit: 'l' }]
      });

    expect(response.status).toBe(201);
  });

  test('prevents non-admin recipe update', async () => {
    const response = await request(app)
      .put('/api/v1/recipes/1')
      .set('Authorization', `Bearer ${token('user')}`)
      .send({});

    expect(response.status).toBe(403);
  });

  test('allows admin recipe update and delete', async () => {
    db.query
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce({});

    const updateResponse = await request(app)
      .put('/api/v1/recipes/1')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send({
        title: 'Soup',
        description: 'Warm',
        category: 'Dinner',
        steps: 'Boil',
        baseServingSize: 2,
        ingredients: [{ name: 'Water', quantity: 1, unit: 'l' }]
      });

    const deleteResponse = await request(app)
      .delete('/api/v1/recipes/1')
      .set('Authorization', `Bearer ${token('admin')}`);

    expect(updateResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
  });
});
