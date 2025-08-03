const express = require('express');
const { getPricePresets, addPricePreset, updatePricePreset, deletePricePreset } = require('../controllers/pricePresetController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPricePresets);
router.post('/', protect, adminOnly, addPricePreset);
router.put('/:id', protect, adminOnly, updatePricePreset);
router.delete('/:id', protect, adminOnly, deletePricePreset);

module.exports = router; 