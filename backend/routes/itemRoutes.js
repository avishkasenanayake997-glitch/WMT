const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateItem } = require('../middleware/validationMiddleware');

// Item CRUD routes (all require authentication)
router
  .route('/')
  .post(protect, upload.single('image'), validateItem, createItem)
  .get(protect, getItems);

router
  .route('/:id')
  .get(protect, getItemById)
  .put(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

module.exports = router;
