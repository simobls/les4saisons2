const express = require('express');
const router = express.Router();
const viandeController = require('../controllers/viandeController');

router.get('/', viandeController.getAllViandes);
router.post('/', viandeController.createViande);
router.put('/:id', viandeController.updateViande);
router.delete('/:id', viandeController.deleteViande);

module.exports = router; 