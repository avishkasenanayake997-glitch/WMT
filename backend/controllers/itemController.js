const Item = require('../models/Item');
const Claim = require('../models/Claim');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Create a new lost/found item report
 * @route   POST /api/items
 * @access  Private
 */
const createItem = async (req, res, next) => {
  try {
    const { title, description, category, location, dateReported, itemType } =
      req.body;

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      dateReported: dateReported ? new Date(dateReported) : Date.now(),
      itemType,
      image: imagePath,
      status: 'Active',
      reportedBy: req.user._id,
    });

    const populatedItem = await Item.findById(item._id).populate(
      'reportedBy',
      'name email'
    );

    return res.status(201).json({
      success: true,
      message: `${itemType} item reported successfully`,
      data: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items with optional filters
 * @route   GET /api/items
 * @access  Private
 */
const getItems = async (req, res, next) => {
  try {
    const { type, category, status, search } = req.query;
    const filter = {};

    // Filter by item type (Lost or Found)
    if (type && ['Lost', 'Found'].includes(type)) {
      filter.itemType = type;
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by status (default is Active if not specified, or allow all)
    if (status) {
      filter.status = status;
    }

    // Text search in title, description, or location
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const items = await Item.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item details by ID
 * @route   GET /api/items/:id
 * @access  Private
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'reportedBy',
      'name email'
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item details
 * @route   PUT /api/items/:id
 * @access  Private (Owner or Admin)
 */
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Authorization check: User must be reporter or Admin
    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item',
      });
    }

    // Update image if a new one was uploaded
    if (req.file) {
      // Clean up previous image file if it was locally stored
      if (item.image && item.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', item.image);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error('Failed to delete old image file:', err);
          });
        }
      }
      item.image = `/uploads/${req.file.filename}`;
    }

    // Update text fields if supplied
    const fieldsToUpdate = [
      'title',
      'description',
      'category',
      'location',
      'itemType',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (req.body.dateReported) {
      item.dateReported = new Date(req.body.dateReported);
    }

    const updatedItem = await item.save();
    const populated = await Item.findById(updatedItem._id).populate(
      'reportedBy',
      'name email'
    );

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an item
 * @route   DELETE /api/items/:id
 * @access  Private (Owner or Admin)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Authorization check: User must be reporter or Admin
    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item',
      });
    }

    // Clean up local image file
    if (item.image && item.image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Failed to delete image file:', err);
        });
      }
    }

    // Clean up associated claims
    await Claim.deleteMany({ itemId: item._id });

    // Remove the item
    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Item and associated claims deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};
