const moment = require('moment-jalaali');

// Convert Gregorian to Persian date
exports.toPersianDate = (date) => {
  return moment(date).format('jYYYY/jMM/jDD');
};

// Convert Persian to Gregorian date
exports.toGregorianDate = (persianDate) => {
  return moment(persianDate, 'jYYYY/jMM/jDD').toDate();
};

// Get current Persian date
exports.getCurrentPersianDate = () => {
  return moment().format('jYYYY/jMM/jDD');
};

// Get Persian date time
exports.toPersianDateTime = (date) => {
  return moment(date).format('jYYYY/jMM/jDD HH:mm:ss');
};

// Get Persian day of week
exports.getPersianDayOfWeek = (date) => {
  const dayOfWeek = moment(date).day();
  // Persian days of week (Saturday to Friday)
  const persianDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  return persianDays[dayOfWeek];
};

// Check if date is Friday (Persian holiday)
exports.isPersianFriday = (date) => {
  return moment(date).day() === 5; // In moment.js, Friday is 5
};

// Add days to a date
exports.addDays = (date, days) => {
  return moment(date).add(days, 'days').toDate();
};

// Get start of day
exports.startOfDay = (date) => {
  return moment(date).startOf('day').toDate();
};

// Get end of day
exports.endOfDay = (date) => {
  return moment(date).endOf('day').toDate();
};

// Calculate duration between two dates in days
exports.getDurationInDays = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

// Parse shift times based on shift type
exports.getShiftTimes = (date, shiftType) => {
  const startOfDay = moment(date).startOf('day');
  
  if (shiftType === 'صبح') {
    const startTime = moment(startOfDay).add(7, 'hours').toDate();
    const endTime = moment(startOfDay).add(15, 'hours').toDate();
    return { startTime, endTime };
  } else if (shiftType === 'بعد از ظهر') {
    const startTime = moment(startOfDay).add(15, 'hours').toDate();
    const endTime = moment(startOfDay).add(23, 'hours').toDate();
    return { startTime, endTime };
  } else if (shiftType === 'شب') {
    const startTime = moment(startOfDay).add(23, 'hours').toDate();
    const endTime = moment(startOfDay).add(1, 'days').add(7, 'hours').toDate();
    return { startTime, endTime };
  }
  
  throw new Error('نوع شیفت نامعتبر است');
}; 