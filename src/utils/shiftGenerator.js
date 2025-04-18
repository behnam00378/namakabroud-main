const moment = require('moment-jalaali');
const dateHelper = require('./dateHelper');

/**
 * Generate shifts for a week based on the week number
 * @param {Array} guards - Array of guard objects
 * @param {Array} areas - Array of area objects
 * @param {Number} weekNumber - Week number of the year
 * @param {Number} year - Year (optional, defaults to current year)
 * @param {Object} fixedAssignmentMap - Map of guard IDs to sets of area IDs for fixed assignments
 * @param {Array} manualShifts - Array of manually configured shifts
 * @returns {Array} Generated shifts
 */
exports.generateWeeklyShifts = (guards, areas, weekNumber, year = moment().jYear(), fixedAssignmentMap = {}, manualShifts = []) => {
  if (!guards.length || !areas.length) {
    throw new Error('حداقل یک نگهبان و یک منطقه برای تولید شیفت نیاز است');
  }

  // Validate and log inputs for debugging
  console.log(`Generating shifts for week ${weekNumber} of year ${year}`);
  console.log(`Guards count: ${guards.length}, Areas count: ${areas.length}`);
  console.log(`Fixed assignment map has ${Object.keys(fixedAssignmentMap).length} guard entries`);
  console.log(`Manual shifts count: ${manualShifts?.length || 0}`);

  const shifts = [];
  
  // Get the first day of the week (Saturday in Persian calendar)
  let startOfWeek = moment().jYear(year).jWeek(weekNumber).startOf('jWeek');
  console.log(`Week start date: ${startOfWeek.format('jYYYY/jMM/jDD')}`);
  
  // First, process manual shifts if they exist
  if (manualShifts && manualShifts.length > 0) {
    manualShifts.forEach(manualShift => {
      // Ensure the manual shift has all required fields
      if (!manualShift.guardId || !manualShift.areaId || !manualShift.shiftType || manualShift.day === undefined) {
        console.warn('Skipping invalid manual shift:', manualShift);
        return;
      }
      
      // Get current date for this day
      const currentDate = moment(startOfWeek).add(manualShift.day, 'days');
      
      // Get shift times based on the shift type
      const { startTime, endTime } = dateHelper.getShiftTimes(currentDate.toDate(), manualShift.shiftType);
      
      // Create the shift with a valid status
      shifts.push({
        guardId: manualShift.guardId,
        areaId: manualShift.areaId,
        startTime,
        endTime,
        shiftType: manualShift.shiftType,
        status: 'برنامه‌ریزی شده',
        isManual: true
      });
    });
  }
  
  // For each area, create shifts
  areas.forEach(area => {
    // Filter out guards that have fixed assignments for this area
    const availableGuards = [...guards].filter(guard => {
      // Skip this guard if they have a fixed assignment for this area
      const guardId = guard._id.toString();
      if (fixedAssignmentMap[guardId] && fixedAssignmentMap[guardId].has(area._id.toString())) {
        console.log(`Skipping guard ${guard.name} for area ${area.name} due to fixed assignment`);
        return false;
      }
      return true;
    });
    
    // If no available guards for this area, skip it
    if (availableGuards.length === 0) {
      console.log(`No available guards for area ${area.name}, skipping this area`);
      return;
    }

    // Make sure we have enough guards (at least 3 for proper rotation)
    if (availableGuards.length < 3) {
      console.log(`Warning: Only ${availableGuards.length} guards available for area ${area.name}, may cause scheduling issues`);
    }

    // Log available guards for this area for debugging
    console.log(`Area ${area.name} has ${availableGuards.length} available guards`);
    
    // Create a guard rotation schedule for the week
    // For each shift type (morning, afternoon, night), create a rotation of guards
    const shiftTypes = ['صبح', 'بعد از ظهر', 'شب'];
    const weeklyGuardRotation = {};
    
    // Initialize rotation for each shift type
    shiftTypes.forEach(shiftType => {
      // Shuffle the guards for each shift type for more variety
      const shuffledGuards = [...availableGuards].sort(() => 0.5 - Math.random());
      weeklyGuardRotation[shiftType] = shuffledGuards;
    });
    
    // For each day of the week (Saturday to Friday)
    for (let day = 0; day < 7; day++) {
      const currentDate = moment(startOfWeek).add(day, 'days');
      const isFriday = currentDate.day() === 5; // Friday is 5 in moment
      
      // Create 3 shifts for each day (morning, afternoon, night)
      shiftTypes.forEach((shiftType, shiftIndex) => {
        // Skip if no guards available
        if (availableGuards.length === 0) {
          console.log(`No guards available for ${area.name} on ${currentDate.format('jYYYY/jMM/jDD')} - ${shiftType}`);
          return;
        }
        
        // Skip if a manual shift already exists for this guard on this day
        const guardIndex = day % weeklyGuardRotation[shiftType].length;
        const guard = weeklyGuardRotation[shiftType][guardIndex];
        
        // Check if this guard already has a manual shift for this day
        const hasManualShift = shifts.some(shift => 
          shift.isManual && 
          shift.guardId.toString() === guard._id.toString() && 
          moment(shift.startTime).day() === currentDate.day()
        );
        
        if (hasManualShift) {
          console.log(`Skipping automatic shift because guard ${guard.name} already has a manual shift on ${currentDate.format('jYYYY/jMM/jDD')}`);
          return;
        }
        
        // Implement Friday shift rotation rule
        let effectiveShiftType = shiftType;
        if (isFriday) {
          if (shiftType === 'صبح') {
            effectiveShiftType = 'شب';
          } else if (shiftType === 'بعد از ظهر') {
            effectiveShiftType = 'صبح';
          } else if (shiftType === 'شب') {
            effectiveShiftType = 'بعد از ظهر';
          }
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
  
  console.log(`Generated ${shifts.length} shifts successfully`);
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