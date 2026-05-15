const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { addFavorite, removeFavorite, myFavorites } = require('../controllers/favoriteController');

const router = express.Router();

router.get('/', requireAuth, myFavorites);
router.post('/:recipeId', requireAuth, addFavorite);
router.delete('/:recipeId', requireAuth, removeFavorite);

module.exports = router;
