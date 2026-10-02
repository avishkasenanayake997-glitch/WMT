const express = require('express');
const router = express.Router();
const {
  createClaim,
  getClaims,
  getClaimById,
  updateClaimStatus,
  cancelClaim,
  deleteClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { validateClaim } = require('../middleware/validationMiddleware');

// Claim base routes
router
  .route('/')
  .post(protect, validateClaim, createClaim)
  .get(protect, getClaims);

router
  .route('/:id')
  .get(protect, getClaimById)
  .delete(protect, deleteClaim);

// Admin review route: Approve or Reject
router.put('/:id/status', protect, requireAdmin, updateClaimStatus);

// User cancellation route: Cancel own pending claim
router.put('/:id/cancel', protect, cancelClaim);

module.exports = router;
