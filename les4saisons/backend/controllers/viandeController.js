const Viande = require('../models/Viande');

exports.getAllViandes = async (req, res) => {
  try {
    const viandes = await Viande.find();
    res.json(viandes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch viandes' });
  }
};

exports.createViande = async (req, res) => {
  try {
    const { name } = req.body;
    const viande = new Viande({ name });
    await viande.save();
    res.status(201).json(viande);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create viande' });
  }
};

exports.updateViande = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const viande = await Viande.findByIdAndUpdate(id, { name }, { new: true });
    if (!viande) return res.status(404).json({ error: 'Viande not found' });
    res.json(viande);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update viande' });
  }
};

exports.deleteViande = async (req, res) => {
  try {
    const { id } = req.params;
    const viande = await Viande.findByIdAndDelete(id);
    if (!viande) return res.status(404).json({ error: 'Viande not found' });
    res.json({ message: 'Viande deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete viande' });
  }
}; 