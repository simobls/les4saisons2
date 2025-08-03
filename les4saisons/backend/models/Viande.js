const mongoose = require('mongoose');

const ViandeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
});

module.exports = mongoose.model('Viande', ViandeSchema); 