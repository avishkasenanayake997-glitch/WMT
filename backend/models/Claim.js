const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Claim must reference an Item'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claim must reference a User'],
    },
    message: {
      type: String,
      required: [true, 'Please provide proof/details verifying your ownership'],
      trim: true,
      maxlength: [500, 'Proof message cannot exceed 500 characters'],
    },
    claimDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        message: 'Claim status must be Pending, Approved, Rejected, or Cancelled',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Claim', claimSchema);
