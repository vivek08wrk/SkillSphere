const router = require('express').Router();
const { register, login, refreshToken, logout } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middleware/validate');

// POST /auth/register
router.post('/register', validateRegister, register);

// POST /auth/login  
router.post('/login', validateLogin, login);

// POST /auth/refresh — Naya access token lo refresh token se
router.post('/refresh', refreshToken);

// POST /auth/logout
router.post('/logout', logout);

module.exports = router;