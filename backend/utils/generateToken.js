const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} id - User ObjectId
 * @param {boolean} isAdmin - User admin flag
 * @returns {string} - JWT Token
 */
const generateToken = (id, isAdmin = false) => {
  return jwt.sign(
    { id, isAdmin },
    process.env.JWT_SECRET || 'campusconnect_fallback_secret_key',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
