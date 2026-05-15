const express = require('express');
const { register, login, loginLimiter } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);

module.exports = router;
