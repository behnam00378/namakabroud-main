const express = require('express');
const { 
  getGuards,
  getGuard,
  createGuard,
  updateGuard,
  deleteGuard
} = require('../controllers/guardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getGuards)
  .post(protect, authorize('admin'), createGuard);

router
  .route('/:id')
  .get(protect, getGuard)
  .put(protect, authorize('admin'), updateGuard)
  .delete(protect, authorize('admin'), deleteGuard);

module.exports = router; 