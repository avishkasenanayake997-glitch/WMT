const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateRegistration,
  validateLogin,
} = require('../middleware/validationMiddleware');

// Public auth routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected auth route
router.get('/me', protect, getMe);

module.exports = router;
