const mongoose = require('mongoose');
const moment = require('moment-jalaali');

const leaveSchema = new mongoose.Schema({
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guard',
    required: [true, 'لطفا نگهبان را مشخص کنید']
  },
  startDate: {
    type: Date,
    required: [true, 'لطفا تاریخ شروع مرخصی را مشخص کنید']
  },
  
  endDate: {
    type: Date,
    required: [true, 'لطفا تاریخ پایان مرخصی را مشخص کنید']
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['در انتظار', 'تأیید شده', 'رد شده'],
    default: 'در انتظار'
  },
  replacementGuardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guard',
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guard'
  },
  rejectionReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for Persian date (Jalali) representation
leaveSchema.virtual('persianStartDate').get(function() {
  return moment(this.startDate).format('jYYYY/jMM/jDD');
});

leaveSchema.virtual('persianEndDate').get(function() {
  return moment(this.endDate).format('jYYYY/jMM/jDD');
});

// Set the virtuals to true when converting to JSON
leaveSchema.set('toJSON', { virtuals: true });
leaveSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Leave', leaveSchema); 