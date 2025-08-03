const express = require('express');
const { getDrinks, addDrink, updateDrink, deleteDrink } = require('../controllers/drinkController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getDrinks);
router.post('/', protect, adminOnly, addDrink);
router.put('/:id', protect, adminOnly, updateDrink);
router.delete('/:id', protect, adminOnly, deleteDrink);

module.exports = router; 