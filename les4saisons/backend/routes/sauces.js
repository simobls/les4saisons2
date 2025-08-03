const express = require('express');
const { getSauces, addSauce, updateSauce, deleteSauce } = require('../controllers/sauceController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSauces);
router.post('/', protect, adminOnly, addSauce);
router.put('/:id', protect, adminOnly, updateSauce);
router.delete('/:id', protect, adminOnly, deleteSauce);

module.exports = router; 