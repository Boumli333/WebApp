const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
} = require('../controllers/recipeController');

const router = express.Router();

router.get('/', listRecipes);
router.get('/:id', getRecipe);
router.post('/', requireAuth, createRecipe);
router.put('/:id', requireAuth, requireAdmin, updateRecipe);
router.delete('/:id', requireAuth, requireAdmin, deleteRecipe);

module.exports = router;
