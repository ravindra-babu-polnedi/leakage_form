
const mongoose = require('mongoose');

const leakageSchema = new mongoose.Schema({
  id: Number,
  date: String,
  skuName: String,
  rejectCount: Number,
  actualCount: Number,
  totalCount: Number,
  operation:{ 
    type: String, 
    required: true, 
    enum: ['save', 'edit'] 
  }
});

const Leakage = mongoose.model('Leakage', leakageSchema);
module.exports = Leakage;
