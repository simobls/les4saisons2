const Sauce = require('../models/Sauce');

// Get all sauces
const getSauces = async (req, res) => {
  try {
    const sauces = await Sauce.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: sauces });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add a new sauce
const addSauce = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const exists = await Sauce.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'Sauce already exists' });
    const sauce = await Sauce.create({ name });
    res.status(201).json({ success: true, data: sauce });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a sauce
const updateSauce = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const sauce = await Sauce.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
    if (!sauce) return res.status(404).json({ success: false, message: 'Sauce not found' });
    res.status(200).json({ success: true, data: sauce });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a sauce
const deleteSauce = async (req, res) => {
  try {
    const { id } = req.params;
    const sauce = await Sauce.findByIdAndDelete(id);
    if (!sauce) return res.status(404).json({ success: false, message: 'Sauce not found' });
    res.status(200).json({ success: true, message: 'Sauce deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSauces,
  addSauce,
  updateSauce,
  deleteSauce,
}; 