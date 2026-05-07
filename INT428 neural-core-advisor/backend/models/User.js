const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  incomeRange: String,
  netWorth: String,
  liquidityRatio: String,
  sourceOfWealth: String,
  riskTolerance: String,
  primaryObjective: String,
  tradingAutonomy: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
