const Area = require('../models/Area');

// @desc    Get all areas
// @route   GET /api/areas
// @access  Private
exports.getAreas = async (req, res) => {
  try {
    const areas = await Area.find();
    
    res.status(200).json({
      success: true,
      count: areas.length,
      data: areas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single area
// @route   GET /api/areas/:id
// @access  Private
exports.getArea = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'منطقه مورد نظر یافت نشد'
      });
    }
    
    res.status(200).json({
      success: true,
      data: area
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create an area
// @route   POST /api/areas
// @access  Private/Admin
exports.createArea = async (req, res) => {
  try {
    const area = await Area.create(req.body);
    
    res.status(201).json({
      success: true,
      data: area
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update an area
// @route   PUT /api/areas/:id
// @access  Private/Admin
exports.updateArea = async (req, res) => {
  try {
    let area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'منطقه مورد نظر یافت نشد'
      });
    }
    
    area = await Area.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: area
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete an area
// @route   DELETE /api/areas/:id
// @access  Private/Admin
exports.deleteArea = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'منطقه مورد نظر یافت نشد'
      });
    }
    
    await area.deleteOne();
    
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