const express = require('express');
const { 
  getShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift,
  generateWeeklyShifts,
  getShiftsByGuard,
  getShiftsByArea
} = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Special routes
router.post('/generate-shifts', protect, authorize('admin'), generateWeeklyShifts);
router.get('/guard/:guardId', protect, getShiftsByGuard);
router.get('/area/:areaId', protect, getShiftsByArea);

// Standard CRUD routes
router
  .route('/')
  .get(protect, getShifts)
  .post(protect, authorize('admin'), createShift);

router
  .route('/:id')
  .get(protect, getShift)
  .put(protect, authorize('admin'), updateShift)
  .delete(protect, authorize('admin'), deleteShift);

module.exports = router; 