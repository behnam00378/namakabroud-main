const Guard = require('../models/Guard');

// @desc    Get all guards
// @route   GET /api/guards
// @access  Private
exports.getGuards = async (req, res) => {
  try {
    const guards = await Guard.find();
    
    res.status(200).json({
      success: true,
      count: guards.length,
      data: guards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single guard
// @route   GET /api/guards/:id
// @access  Private
exports.getGuard = async (req, res) => {
  try {
    const guard = await Guard.findById(req.params.id);
    
    if (!guard) {
      return res.status(404).json({
        success: false,
        message: 'نگهبان مورد نظر یافت نشد'
      });
    }
    
    res.status(200).json({
      success: true,
      data: guard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a guard
// @route   POST /api/guards
// @access  Private/Admin
exports.createGuard = async (req, res) => {
  try {
    const guard = await Guard.create(req.body);
    
    res.status(201).json({
      success: true,
      data: guard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a guard
// @route   PUT /api/guards/:id
// @access  Private/Admin
exports.updateGuard = async (req, res) => {
  try {
    // Don't allow password update through this route
    if (req.body.password) {
      delete req.body.password;
    }
    
    let guard = await Guard.findById(req.params.id);
    
    if (!guard) {
      return res.status(404).json({
        success: false,
        message: 'نگهبان مورد نظر یافت نشد'
      });
    }
    
    guard = await Guard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: guard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a guard
// @route   DELETE /api/guards/:id
// @access  Private/Admin
exports.deleteGuard = async (req, res) => {
  try {
    const guard = await Guard.findById(req.params.id);
    
    if (!guard) {
      return res.status(404).json({
        success: false,
        message: 'نگهبان مورد نظر یافت نشد'
      });
    }
    
    await guard.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 