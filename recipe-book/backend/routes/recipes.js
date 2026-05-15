const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { protectedRouteLimiter } = require('../middleware/rateLimit');
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
router.post('/', protectedRouteLimiter, requireAuth, createRecipe);
router.put('/:id', protectedRouteLimiter, requireAuth, requireAdmin, updateRecipe);
router.delete('/:id', protectedRouteLimiter, requireAuth, requireAdmin, deleteRecipe);

module.exports = router;
