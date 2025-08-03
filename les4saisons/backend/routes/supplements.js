const express = require('express');
const { getSupplements, addSupplement, updateSupplement, deleteSupplement } = require('../controllers/supplementController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSupplements);
router.post('/', protect, adminOnly, addSupplement);
router.put('/:id', protect, adminOnly, updateSupplement);
router.delete('/:id', protect, adminOnly, deleteSupplement);

module.exports = router; 