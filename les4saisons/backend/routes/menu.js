const express = require('express');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  toggleAvailability
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateMenuItem } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getMenuItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItem);

// Protected routes (Admin only)
router.post('/', protect, adminOnly, validateMenuItem, createMenuItem);
router.put('/:id', protect, adminOnly, validateMenuItem, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);
router.patch('/:id/toggle-availability', protect, adminOnly, toggleAvailability);

module.exports = router;