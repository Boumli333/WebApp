const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { protectedRouteLimiter } = require('../middleware/rateLimit');
const { addFavorite, removeFavorite, myFavorites } = require('../controllers/favoriteController');

const router = express.Router();

router.get('/', protectedRouteLimiter, requireAuth, myFavorites);
router.post('/:recipeId', protectedRouteLimiter, requireAuth, addFavorite);
router.delete('/:recipeId', protectedRouteLimiter, requireAuth, removeFavorite);

module.exports = router;
