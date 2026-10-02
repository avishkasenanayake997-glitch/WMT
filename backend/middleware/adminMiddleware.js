/**
 * Admin Middleware:
 * Restricts access to authenticated users whose isAdmin flag is true
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    return next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required',
    });
  }
};

module.exports = { requireAdmin };
