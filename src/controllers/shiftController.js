const Shift = require('../models/Shift');
const Guard = require('../models/Guard');
const Area = require('../models/Area');
const moment = require('moment-jalaali');
const shiftGenerator = require('../utils/shiftGenerator');
const dateHelper = require('../utils/dateHelper');

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private
exports.getShifts = async (req, res) => {
  try {
    // Build query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Shift.find(JSON.parse(queryStr))
      .populate('guardId', 'name email')
      .populate('areaId', 'name location');
    
    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-startTime');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Shift.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const shifts = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: shifts.length,
      pagination,
      data: shifts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single shift
// @route   GET /api/shifts/:id
// @access  Private
exports.getShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('guardId', 'name email')
      .populate('areaId', 'name location')
      .populate('replacementFor', 'name email');
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'شیفت مورد نظر یافت نشد'
      });
    }
    
    res.status(200).json({
      success: true,
      data: shift
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a shift
// @route   POST /api/shifts
// @access  Private/Admin
exports.createShift = async (req, res) => {
  try {
    // Verify guard and area existence
    const guard = await Guard.findById(req.body.guardId);
    if (!guard) {
      return res.status(404).json({
        success: false,
        message: 'نگهبان مورد نظر یافت نشد'
      });
    }
    
    const area = await Area.findById(req.body.areaId);
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'منطقه مورد نظر یافت نشد'
      });
    }
    
    // Create shift
    const shift = await Shift.create(req.body);
    
    res.status(201).json({
      success: true,
      data: shift
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a shift
// @route   PUT /api/shifts/:id
// @access  Private/Admin
exports.updateShift = async (req, res) => {
  try {
    let shift = await Shift.findById(req.params.id);
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'شیفت مورد نظر یافت نشد'
      });
    }
    
    shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: shift
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a shift
// @route   DELETE /api/shifts/:id
// @access  Private/Admin
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'شیفت مورد نظر یافت نشد'
      });
    }
    
    await shift.deleteOne();
    
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

// @desc    Generate shifts for a week
// @route   POST /api/shifts/generate-shifts
// @access  Private/Admin
exports.generateWeeklyShifts = async (req, res) => {
  try {
    const { weekNumber, year } = req.body;
    
    if (!weekNumber) {
      return res.status(400).json({
        success: false,
        message: 'لطفا شماره هفته را مشخص کنید'
      });
    }
    
    // Get all active guards
    const guards = await Guard.find({ status: 'active' });
    if (guards.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'حداقل 3 نگهبان فعال برای تولید شیفت لازم است'
      });
    }
    
    // Get all active areas
    const areas = await Area.find({ isActive: true });
    if (areas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'حداقل یک منطقه فعال برای تولید شیفت لازم است'
      });
    }
    
    // Generate shifts
    const shiftData = shiftGenerator.generateWeeklyShifts(
      guards,
      areas,
      weekNumber,
      year || moment().jYear()
    );
    
    // Save all shifts to database
    const shifts = await Shift.insertMany(shiftData);
    
    res.status(201).json({
      success: true,
      count: shifts.length,
      data: shifts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get shifts by guard
// @route   GET /api/shifts/guard/:guardId
// @access  Private
exports.getShiftsByGuard = async (req, res) => {
  try {
    const shifts = await Shift.find({ guardId: req.params.guardId })
      .populate('areaId', 'name location')
      .sort('startTime');
    
    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get shifts by area
// @route   GET /api/shifts/area/:areaId
// @access  Private
exports.getShiftsByArea = async (req, res) => {
  try {
    const shifts = await Shift.find({ areaId: req.params.areaId })
      .populate('guardId', 'name email')
      .sort('startTime');
    
    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 