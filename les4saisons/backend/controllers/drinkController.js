const Drink = require('../models/Drink');

// Get all drinks
const getDrinks = async (req, res) => {
  try {
    const drinks = await Drink.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: drinks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add a new drink
const addDrink = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const exists = await Drink.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'Drink already exists' });
    const drink = await Drink.create({ name });
    res.status(201).json({ success: true, data: drink });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a drink
const updateDrink = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const drink = await Drink.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
    if (!drink) return res.status(404).json({ success: false, message: 'Drink not found' });
    res.status(200).json({ success: true, data: drink });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a drink
const deleteDrink = async (req, res) => {
  try {
    const { id } = req.params;
    const drink = await Drink.findByIdAndDelete(id);
    if (!drink) return res.status(404).json({ success: false, message: 'Drink not found' });
    res.status(200).json({ success: true, message: 'Drink deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDrinks,
  addDrink,
  updateDrink,
  deleteDrink,
}; 