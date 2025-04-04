const mongoose = require('mongoose');
const moment = require('moment-jalaali');

const shiftSchema = new mongoose.Schema({
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guard',
    required: [true, 'لطفا نگهبان را مشخص کنید']
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: [true, 'لطفا منطقه را مشخص کنید']
  },
  startTime: {
    type: Date,
    required: [true, 'لطفا زمان شروع شیفت را مشخص کنید']
  },
  endTime: {
    type: Date,
    required: [true, 'لطفا زمان پایان شیفت را مشخص کنید']
  },
  shiftType: {
    type: String,
    enum: ['صبح', 'بعد از ظهر', 'شب'],
    required: [true, 'لطفا نوع شیفت را مشخص کنید']
  },
  status: {
    type: String,
    enum: ['برنامه‌ریزی شده', 'در حال انجام', 'تکمیل شده', 'لغو شده'],
    default: 'برنامه‌ریزی شده'
  },
  replacementFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guard',
    default: null
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for Persian date (Jalali) representation
shiftSchema.virtual('persianStartTime').get(function() {
  return moment(this.startTime).format('jYYYY/jMM/jDD HH:mm');
});

shiftSchema.virtual('persianEndTime').get(function() {
  return moment(this.endTime).format('jYYYY/jMM/jDD HH:mm');
});

// Set the virtuals to true when converting to JSON
shiftSchema.set('toJSON', { virtuals: true });
shiftSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Shift', shiftSchema); 