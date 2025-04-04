const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'لطفا نام منطقه را وارد کنید'],
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  location: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Area', areaSchema); 