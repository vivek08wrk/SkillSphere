const router = require('express').Router();
const {
  getMyProfile,
  updateMyProfile,
  getUserById,
  getAllUsers
} = require('../controllers/user.controller');

// GET /users/profile — Mera profile
router.get('/profile', getMyProfile);

// PUT /users/profile — Profile update
router.put('/profile', updateMyProfile);

// GET /users — Sab users (admin)
router.get('/', getAllUsers);

// GET /users/:id — Kisi ka bhi profile
// WHY yeh last: Express upar se neeche match karta hai
// agar :id pehle hota toh /profile bhi match ho jaata!
router.get('/:id', getUserById);

module.exports = router;