const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  avgCost: { type: Number, required: true },
  sector: { type: String, default: 'Trading' },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
