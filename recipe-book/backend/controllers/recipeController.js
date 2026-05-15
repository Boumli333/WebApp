const db = require('../models/db');
const { sanitizeValue } = require('../models/sanitize');

async function listRecipes(req, res) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 12);
  const offset = (page - 1) * limit;
  const search = sanitizeValue(req.query.search || '');
  const category = sanitizeValue(req.query.category || '');

  const whereClauses = [];
  const params = [];

  if (search) {
    whereClauses.push('(r.title LIKE ? OR EXISTS (SELECT 1 FROM recipe_ingredients i WHERE i.recipe_id = r.id AND i.name LIKE ?))');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    whereClauses.push('r.category = ?');
    params.push(category);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRows = await db.query(`SELECT COUNT(*) AS total FROM recipes r ${where}`, params);
  const total = countRows[0].total;

  const recipes = await db.query(
    `SELECT r.id, r.title, r.description, r.category, r.base_serving_size
     FROM recipes r
     ${where}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return res.json({
    data: recipes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
}

async function getRecipe(req, res) {
  const recipeId = Number(req.params.id);
  const recipeRows = await db.query(
    'SELECT id, title, description, category, steps, base_serving_size FROM recipes WHERE id = ?',
    [recipeId]
  );

  if (recipeRows.length === 0) {
    return res.status(404).json({ message: 'Recipe not found' });
  }

  const ingredients = await db.query(
    'SELECT id, name, quantity, unit FROM recipe_ingredients WHERE recipe_id = ? ORDER BY id ASC',
    [recipeId]
  );

  return res.json({ ...recipeRows[0], ingredients });
}

async function createRecipe(req, res) {
  const body = sanitizeValue(req.body);
  const { title, description, category, ingredients = [], steps, baseServingSize } = body;

  if (!title || !description || !category || !steps || !baseServingSize || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: 'Missing required recipe fields' });
  }

  const result = await db.query(
    'INSERT INTO recipes (title, description, category, steps, base_serving_size, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, category, steps, Number(baseServingSize), req.user.id]
  );

  const recipeId = result.insertId;
  for (const ingredient of ingredients) {
    await db.query(
      'INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)',
      [recipeId, ingredient.name, Number(ingredient.quantity), ingredient.unit]
    );
  }

  return res.status(201).json({ id: recipeId, message: 'Recipe created successfully' });
}

async function updateRecipe(req, res) {
  const recipeId = Number(req.params.id);
  const body = sanitizeValue(req.body);
  const { title, description, category, ingredients = [], steps, baseServingSize } = body;

  const existing = await db.query('SELECT id FROM recipes WHERE id = ?', [recipeId]);
  if (existing.length === 0) {
    return res.status(404).json({ message: 'Recipe not found' });
  }

  await db.query(
    'UPDATE recipes SET title = ?, description = ?, category = ?, steps = ?, base_serving_size = ? WHERE id = ?',
    [title, description, category, steps, Number(baseServingSize), recipeId]
  );

  await db.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [recipeId]);

  for (const ingredient of ingredients) {
    await db.query(
      'INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)',
      [recipeId, ingredient.name, Number(ingredient.quantity), ingredient.unit]
    );
  }

  return res.json({ message: 'Recipe updated successfully' });
}

async function deleteRecipe(req, res) {
  const recipeId = Number(req.params.id);
  const existing = await db.query('SELECT id FROM recipes WHERE id = ?', [recipeId]);
  if (existing.length === 0) {
    return res.status(404).json({ message: 'Recipe not found' });
  }

  await db.query('DELETE FROM recipes WHERE id = ?', [recipeId]);
  return res.json({ message: 'Recipe deleted successfully' });
}

module.exports = { listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe };
