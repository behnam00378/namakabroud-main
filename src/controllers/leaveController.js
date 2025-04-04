const Leave = require('../models/Leave');
const Guard = require('../models/Guard');
const Shift = require('../models/Shift');
const moment = require('moment-jalaali');
const dateHelper = require('../utils/dateHelper');
const shiftGenerator = require('../utils/shiftGenerator');

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res) => {
  try {
    // Build query with filters, sorting and pagination (similar to shiftController)
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
    query = Leave.find(JSON.parse(queryStr))
      .populate('guardId', 'name email')
      .populate('replacementGuardId', 'name email')
      .populate('approvedBy', 'name role');
    
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
      query = query.sort('-startDate');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Leave.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const leaves = await query;
    
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
      count: leaves.length,
      pagination,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('guardId', 'name email')
      .populate('replacementGuardId', 'name email')
      .populate('approvedBy', 'name role');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'درخواست مرخصی مورد نظر یافت نشد'
      });
    }
    
    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeave = async (req, res) => {
  try {
    // Verify guard exists
    const guard = await Guard.findById(req.body.guardId);
    if (!guard) {
      return res.status(404).json({
        success: false,
        message: 'نگهبان مورد نظر یافت نشد'
      });
    }
    
    // Create leave request
    const leave = await Leave.create(req.body);
    
    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a leave
// @route   PUT /api/leaves/:id
// @access  Private/Admin
exports.updateLeave = async (req, res) => {
  try {
    let leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'درخواست مرخصی مورد نظر یافت نشد'
      });
    }
    
    leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('guardId', 'name email');
    
    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a leave
// @route   DELETE /api/leaves/:id
// @access  Private/Admin
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'درخواست مرخصی مورد نظر یافت نشد'
      });
    }
    
    // Cannot delete an approved leave with shifts already assigned
    if (leave.status === 'تأیید شده') {
      // Check if there are shifts associated with this leave's replacement
      const shiftsCount = await Shift.countDocuments({
        guardId: leave.replacementGuardId,
        replacementFor: leave.guardId,
        startTime: { $gte: leave.startDate },
        endTime: { $lte: leave.endDate }
      });
      
      if (shiftsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'نمی‌توان درخواست مرخصی تأیید شده با شیفت‌های جایگزین را حذف کرد'
        });
      }
    }
    
    await leave.deleteOne();
    
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

// @desc    Handle leave approval process
// @route   POST /api/leaves/:id/handle
// @access  Private/Admin
exports.handleLeave = async (req, res) => {
  try {
    const { status, replacementGuardId, rejectionReason } = req.body;
    
    // Find the leave request
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'درخواست مرخصی مورد نظر یافت نشد'
      });
    }
    
    // Only pending leaves can be processed
    if (leave.status !== 'در انتظار') {
      return res.status(400).json({
        success: false,
        message: 'فقط درخواست‌های در انتظار می‌توانند پردازش شوند'
      });
    }
    
    if (status === 'تأیید شده') {
      // Check if replacement guard exists
      if (!replacementGuardId) {
        return res.status(400).json({
          success: false,
          message: 'برای تأیید مرخصی، نگهبان جایگزین باید مشخص شود'
        });
      }
      
      const replacementGuard = await Guard.findById(replacementGuardId);
      if (!replacementGuard) {
        return res.status(404).json({
          success: false,
          message: 'نگهبان جایگزین یافت نشد'
        });
      }
      
      // Find all shifts for the guard on leave during the leave period
      const shiftsToReassign = await Shift.find({
        guardId: leave.guardId,
        startTime: { $gte: leave.startDate },
        endTime: { $lte: leave.endDate }
      });
      
      if (shiftsToReassign.length === 0) {
        // No shifts to reassign during this period
        leave.status = 'تأیید شده';
        leave.replacementGuardId = replacementGuardId;
        leave.approvedBy = req.user.id;
        await leave.save();
        
        return res.status(200).json({
          success: true,
          message: 'مرخصی تأیید شد، اما هیچ شیفتی برای انتقال وجود نداشت',
          data: leave
        });
      }
      
      // Update all shifts to the replacement guard
      for (const shift of shiftsToReassign) {
        shift.guardId = replacementGuardId;
        shift.replacementFor = leave.guardId;
        shift.notes = `جایگزین برای ${req.body.guardName || 'نگهبان'} در مرخصی`;
        await shift.save();
      }
      
      // Update leave status
      leave.status = 'تأیید شده';
      leave.replacementGuardId = replacementGuardId;
      leave.approvedBy = req.user.id;
      await leave.save();
      
      // Update guard status to on-leave
      await Guard.findByIdAndUpdate(leave.guardId, { status: 'on-leave' });
      
      res.status(200).json({
        success: true,
        message: `مرخصی تأیید شد و ${shiftsToReassign.length} شیفت به نگهبان جایگزین منتقل شد`,
        data: leave
      });
    } else if (status === 'رد شده') {
      // Reject the leave request
      leave.status = 'رد شده';
      leave.rejectionReason = rejectionReason || 'بدون دلیل';
      leave.approvedBy = req.user.id;
      await leave.save();
      
      res.status(200).json({
        success: true,
        message: 'درخواست مرخصی رد شد',
        data: leave
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'وضعیت نامعتبر. وضعیت باید "تأیید شده" یا "رد شده" باشد'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Find available replacement guards
// @route   GET /api/leaves/:id/replacement-options
// @access  Private
exports.getReplacementOptions = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'درخواست مرخصی مورد نظر یافت نشد'
      });
    }
    
    // Find shifts that need replacement
    const shiftsToReplace = await Shift.find({
      guardId: leave.guardId,
      startTime: { $gte: leave.startDate },
      endTime: { $lte: leave.endDate }
    }).populate('areaId', 'name');
    
    // Find all active guards except the one on leave
    const availableGuards = await Guard.find({ 
      _id: { $ne: leave.guardId },
      status: 'active'
    });
    
    // For a real application, you would filter available guards based on their existing shifts
    // This is a simple implementation that just returns all active guards
    
    res.status(200).json({
      success: true,
      shiftsCount: shiftsToReplace.length,
      shifts: shiftsToReplace,
      replacementOptions: availableGuards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leaves by guard
// @route   GET /api/leaves/guard/:guardId
// @access  Private
exports.getLeavesByGuard = async (req, res) => {
  try {
    const leaves = await Leave.find({ guardId: req.params.guardId })
      .sort('-startDate');
    
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 