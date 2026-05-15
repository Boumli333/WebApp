const db = require('../models/db');

async function addFavorite(req, res) {
  const recipeId = Number(req.params.recipeId);
  await db.query('INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)', [req.user.id, recipeId]);
  return res.status(201).json({ message: 'Favorite added' });
}

async function removeFavorite(req, res) {
  const recipeId = Number(req.params.recipeId);
  await db.query('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?', [req.user.id, recipeId]);
  return res.json({ message: 'Favorite removed' });
}

async function myFavorites(req, res) {
  const rows = await db.query(
    `SELECT r.id, r.title, r.description, r.category
     FROM favorites f
     JOIN recipes r ON r.id = f.recipe_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  return res.json({ data: rows });
}

module.exports = { addFavorite, removeFavorite, myFavorites };
