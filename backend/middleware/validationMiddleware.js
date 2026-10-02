/**
 * Validation Middleware Helpers
 */

const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  next();
};

const validateItem = (req, res, next) => {
  const { title, description, category, location, itemType } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Item title is required' });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({ success: false, message: 'Item description is required' });
  }

  const validCategories = ['Electronics', 'Documents', 'Clothing', 'Accessories', 'Other'];
  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be one of: ${validCategories.join(', ')}`,
    });
  }

  if (!location || !location.trim()) {
    return res.status(400).json({ success: false, message: 'Location is required' });
  }

  if (!itemType || !['Lost', 'Found'].includes(itemType)) {
    return res.status(400).json({
      success: false,
      message: 'itemType must be either Lost or Found',
    });
  }

  next();
};

const validateClaim = (req, res, next) => {
  const { itemId, message } = req.body;

  if (!itemId) {
    return res.status(400).json({ success: false, message: 'itemId is required' });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'A verification message proving ownership is required',
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateItem,
  validateClaim,
};
