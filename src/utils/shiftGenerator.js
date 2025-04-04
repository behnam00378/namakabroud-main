const moment = require('moment-jalaali');
const dateHelper = require('./dateHelper');

/**
 * Generate shifts for a week based on the week number
 * @param {Array} guards - Array of guard objects
 * @param {Array} areas - Array of area objects
 * @param {Number} weekNumber - Week number of the year
 * @param {Number} year - Year (optional, defaults to current year)
 * @returns {Array} Generated shifts
 */
exports.generateWeeklyShifts = (guards, areas, weekNumber, year = moment().jYear()) => {
  if (!guards.length || !areas.length) {
    throw new Error('حداقل یک نگهبان و یک منطقه برای تولید شیفت نیاز است');
  }

  const shifts = [];
  
  // Get the first day of the week (Saturday in Persian calendar)
  let startOfWeek = moment().jYear(year).jWeek(weekNumber).startOf('jWeek');
  
  // For each area, create shifts
  areas.forEach(area => {
    // Sort guards to assign shifts (in a real scenario, this might be more complex)
    const availableGuards = [...guards];
    
    // For each day of the week (Saturday to Friday)
    for (let day = 0; day < 7; day++) {
      const currentDate = moment(startOfWeek).add(day, 'days');
      const isFriday = currentDate.day() === 5; // Friday is 5 in moment
      
      // Create 3 shifts for each day (morning, afternoon, night)
      const shiftTypes = ['صبح', 'بعد از ظهر', 'شب'];
      
      shiftTypes.forEach((shiftType, index) => {
        // Get the appropriate guard for this shift
        // In a real scenario, you would have more complex logic to assign guards
        const guardIndex = (day + index) % availableGuards.length;
        const guard = availableGuards[guardIndex];
        
        // Implement Friday shift rotation rule
        let effectiveShiftType = shiftType;
        if (isFriday) {
          if (shiftType === 'صبح') effectiveShiftType = 'شب';
          else if (shiftType === 'بعد از ظهر') effectiveShiftType = 'صبح';
          else if (shiftType === 'شب') effectiveShiftType = 'بعد از ظهر';
        }
        
        // Get shift times
        const { startTime, endTime } = dateHelper.getShiftTimes(currentDate.toDate(), effectiveShiftType);
        
        // Create the shift
        shifts.push({
          guardId: guard._id,
          areaId: area._id,
          startTime,
          endTime,
          shiftType: effectiveShiftType,
          status: 'برنامه‌ریزی شده'
        });
      });
    }
  });
  
  return shifts;
};

/**
 * Find a replacement guard for a shift
 * @param {Array} availableGuards - Array of guards who are available
 * @param {Object} shift - The shift that needs a replacement
 * @param {Object} originalGuard - The guard who needs to be replaced
 * @returns {Object|null} Replacement guard or null if none found
 */
exports.findReplacementGuard = (availableGuards, shift, originalGuard) => {
  // Filter out the original guard
  const possibleReplacements = availableGuards.filter(guard => 
    guard._id.toString() !== originalGuard._id.toString()
  );
  
  if (possibleReplacements.length === 0) {
    return null;
  }
  
  // In a real scenario, you would implement more complex logic to find the best replacement
  // For example, checking how many shifts they already have, their preferences, etc.
  
  // For simplicity, we're just returning the first available guard
  return possibleReplacements[0];
};

/**
 * Reassign shifts to replacement guards
 * @param {Array} shifts - All shifts
 * @param {Object} leave - The leave request
 * @param {Object} replacementGuard - The guard who will take over the shifts
 * @returns {Array} Updated shifts
 */
exports.reassignShifts = (shifts, leave, replacementGuard) => {
  // Find shifts during the leave period that belong to the guard on leave
  const shiftsToReassign = shifts.filter(shift => 
    shift.guardId.toString() === leave.guardId.toString() && 
    moment(shift.startTime).isBetween(leave.startDate, leave.endDate, null, '[]')
  );
  
  // Create updated shifts with the replacement guard
  const updatedShifts = shiftsToReassign.map(shift => ({
    ...shift,
    guardId: replacementGuard._id,
    replacementFor: leave.guardId,
    notes: `جایگزین برای ${leave.guardId.name} در مرخصی`
  }));
  
  return updatedShifts;
}; 