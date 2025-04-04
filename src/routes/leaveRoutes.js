const express = require('express');
const { 
  getLeaves,
  getLeave,
  createLeave,
  updateLeave,
  deleteLeave,
  handleLeave,
  getReplacementOptions,
  getLeavesByGuard
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Special routes
router.post('/:id/handle', protect, authorize('admin', 'supervisor'), handleLeave);
router.get('/:id/replacement-options', protect, authorize('admin', 'supervisor'), getReplacementOptions);
router.get('/guard/:guardId', protect, getLeavesByGuard);

// Standard CRUD routes
router
  .route('/')
  .get(protect, getLeaves)
  .post(protect, createLeave);

router
  .route('/:id')
  .get(protect, getLeave)
  .put(protect, authorize('admin', 'supervisor'), updateLeave)
  .delete(protect, authorize('admin'), deleteLeave);

module.exports = router;