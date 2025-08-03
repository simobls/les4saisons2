const Supplement = require('../models/Supplement');

// Get all supplements
const getSupplements = async (req, res) => {
  try {
    const supplements = await Supplement.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: supplements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add a new supplement
const addSupplement = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    if (price === undefined || price === null || isNaN(price) || price < 0) return res.status(400).json({ success: false, message: 'Price is required and must be >= 0' });
    const exists = await Supplement.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'Supplement already exists' });
    const supplement = await Supplement.create({ name, price });
    res.status(201).json({ success: true, data: supplement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a supplement
const updateSupplement = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    if (price === undefined || price === null || isNaN(price) || price < 0) return res.status(400).json({ success: false, message: 'Price is required and must be >= 0' });
    const supplement = await Supplement.findByIdAndUpdate(req.params.id, { name, price }, { new: true });
    if (!supplement) return res.status(404).json({ success: false, message: 'Supplement not found' });
    res.status(200).json({ success: true, data: supplement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a supplement
const deleteSupplement = async (req, res) => {
  try {
    const supplement = await Supplement.findByIdAndDelete(req.params.id);
    if (!supplement) return res.status(404).json({ success: false, message: 'Supplement not found' });
    res.status(200).json({ success: true, data: supplement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSupplements,
  addSupplement,
  updateSupplement,
  deleteSupplement,
}; 