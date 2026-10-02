const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Electronics', 'Documents', 'Clothing', 'Accessories', 'Other'],
        message: '{VALUE} is not a supported category',
      },
    },
    location: {
      type: String,
      required: [true, 'Please provide the location where the item was lost or found'],
      trim: true,
    },
    dateReported: {
      type: Date,
      required: [true, 'Please provide the date of the incident'],
      default: Date.now,
    },
    itemType: {
      type: String,
      required: [true, 'Please specify whether the item is Lost or Found'],
      enum: {
        values: ['Lost', 'Found'],
        message: 'itemType must be either Lost or Found',
      },
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Active', 'Claimed', 'Resolved'],
        message: 'Status must be Active, Claimed, or Resolved',
      },
      default: 'Active',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must be linked to a reporting user'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);
