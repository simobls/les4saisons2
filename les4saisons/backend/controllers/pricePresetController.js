const PricePreset = require('../models/PricePreset');

// Get all price presets
const getPricePresets = async (req, res) => {
  try {
    const presets = await PricePreset.find().sort({ value: 1 });
    res.status(200).json({ success: true, data: presets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add a new price preset
const addPricePreset = async (req, res) => {
  try {
    const { name, value } = req.body;
    if (!name || value === undefined) return res.status(400).json({ success: false, message: 'Name and value are required' });
    const exists = await PricePreset.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'Price preset already exists' });
    const preset = await PricePreset.create({ name, value });
    res.status(201).json({ success: true, data: preset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a price preset
const updatePricePreset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value } = req.body;
    const preset = await PricePreset.findByIdAndUpdate(id, { name, value }, { new: true, runValidators: true });
    if (!preset) return res.status(404).json({ success: false, message: 'Price preset not found' });
    res.status(200).json({ success: true, data: preset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a price preset
const deletePricePreset = async (req, res) => {
  try {
    const { id } = req.params;
    const preset = await PricePreset.findByIdAndDelete(id);
    if (!preset) return res.status(404).json({ success: false, message: 'Price preset not found' });
    res.status(200).json({ success: true, message: 'Price preset deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPricePresets,
  addPricePreset,
  updatePricePreset,
  deletePricePreset,
}; 