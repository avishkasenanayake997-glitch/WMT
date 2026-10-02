const Claim = require('../models/Claim');
const Item = require('../models/Item');

/**
 * @desc    Submit a new claim for an item
 * @route   POST /api/claims
 * @access  Private (Students / Users)
 *
 * Enforces:
 * - RULE 1: Only Found items can be claimed.
 * - RULE 2: Item must be Active.
 * - RULE 3: Prevent duplicate active (Pending) claims from the same user for the same item.
 * - RULE 7: Claimed items cannot receive new claims.
 */
const createClaim = async (req, res, next) => {
  try {
    const { itemId, message } = req.body;

    // 1. Verify item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'The requested item does not exist',
      });
    }

    // Prevent finder from claiming their own found item report
    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a claim for an item you reported yourself',
      });
    }

    // RULE 1: ONLY FOUND ITEMS CAN BE CLAIMED
    if (item.itemType !== 'Found') {
      return res.status(400).json({
        success: false,
        message: 'Only found items can be claimed.',
      });
    }

    // RULE 2 & 7: ITEM MUST BE ACTIVE (Claimed or Resolved items cannot be claimed)
    if (item.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `This item is currently ${item.status.toLowerCase()} and cannot be claimed.`,
      });
    }

    // RULE 3: PREVENT DUPLICATE ACTIVE CLAIMS
    const existingPendingClaim = await Claim.findOne({
      itemId,
      userId: req.user._id,
      status: 'Pending',
    });

    if (existingPendingClaim) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending claim for this item.',
      });
    }

    // Create the Claim with status = Pending
    const claim = await Claim.create({
      itemId,
      userId: req.user._id,
      message: message.trim(),
      claimDate: Date.now(),
      status: 'Pending',
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('itemId', 'title category location image status itemType')
      .populate('userId', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Awaiting campus administrator review.',
      data: populatedClaim,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get claims (User views own claims, Admin can view all or filter)
 * @route   GET /api/claims
 * @access  Private
 */
const getClaims = async (req, res, next) => {
  try {
    const filter = {};
    const { status, itemId } = req.query;

    if (itemId) {
      filter.itemId = itemId;
    }

    if (status) {
      filter.status = status;
    }

    // If user is not admin, they can ONLY view their own claims
    if (!req.user.isAdmin) {
      filter.userId = req.user._id;
    }

    const claims = await Claim.find(filter)
      .populate('itemId', 'title category location image status itemType dateReported')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single claim details by ID
 * @route   GET /api/claims/:id
 * @access  Private (Owner or Admin)
 */
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId', 'title category location image status itemType dateReported reportedBy')
      .populate('userId', 'name email');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    // Authorization check: User must be claimant or Admin
    const isClaimant = claim.userId._id.toString() === req.user._id.toString();
    if (!isClaimant && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this claim',
      });
    }

    return res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update claim status (Admin review: Approve / Reject)
 * @route   PUT /api/claims/:id/status
 * @access  Private (Admin only)
 *
 * Enforces:
 * - RULE 4: Approving a claim sets Claim.status = Approved and Item.status = Claimed
 * - RULE 5: Rejecting a claim sets Claim.status = Rejected and Item.status remains Active
 */
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    // Verify claim is currently Pending
    if (claim.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a claim that is already ${claim.status}`,
      });
    }

    // Verify linked item exists
    const item = await Item.findById(claim.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'The associated item no longer exists',
      });
    }

    if (status === 'Approved') {
      // RULE 4: Verify item is still Active
      if (item.status !== 'Active') {
        return res.status(400).json({
          success: false,
          message: `Cannot approve claim because item is already ${item.status}`,
        });
      }

      // Update Claim to Approved
      claim.status = 'Approved';
      await claim.save();

      // Update Item to Claimed
      item.status = 'Claimed';
      await item.save();

      // Automatically reject any other pending claims for this item
      await Claim.updateMany(
        { itemId: item._id, _id: { $ne: claim._id }, status: 'Pending' },
        { status: 'Rejected' }
      );

      const populatedClaim = await Claim.findById(claim._id)
        .populate('itemId')
        .populate('userId', 'name email');

      return res.status(200).json({
        success: true,
        message: 'Claim approved successfully and item marked as Claimed',
        data: populatedClaim,
      });
    } else if (status === 'Rejected') {
      // RULE 5: Rejecting a claim
      claim.status = 'Rejected';
      await claim.save();

      // Item remains Active for other valid claimants
      // item.status is unchanged

      const populatedClaim = await Claim.findById(claim._id)
        .populate('itemId')
        .populate('userId', 'name email');

      return res.status(200).json({
        success: true,
        message: 'Claim rejected. Item remains active for other claims.',
        data: populatedClaim,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a pending claim
 * @route   PUT /api/claims/:id/cancel
 * @access  Private (Claimant only)
 *
 * Enforces:
 * - RULE 6: Cancelling a claim sets Claim.status = Cancelled and Item remains Active
 */
const cancelClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    // Verify ownership: only claimant can cancel
    if (claim.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own claims',
      });
    }

    // Can only cancel Pending claims
    if (claim.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a claim that is already ${claim.status}`,
      });
    }

    // RULE 6: Change status to Cancelled. Item remains Active.
    claim.status = 'Cancelled';
    await claim.save();

    const populatedClaim = await Claim.findById(claim._id)
      .populate('itemId', 'title category location image status itemType')
      .populate('userId', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Claim cancelled successfully',
      data: populatedClaim,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a claim
 * @route   DELETE /api/claims/:id
 * @access  Private (Owner or Admin)
 */
const deleteClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    const isOwner = claim.userId.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this claim',
      });
    }

    await claim.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Claim record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getClaims,
  getClaimById,
  updateClaimStatus,
  cancelClaim,
  deleteClaim,
};
