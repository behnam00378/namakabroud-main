const Guard = require('../models/Guard');

// @desc    Register a new guard
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;

    // Check if guard already exists
    const guardExists = await Guard.findOne({ email });
    if (guardExists) {
      return res.status(400).json({
        success: false,
        message: 'کاربر با این ایمیل قبلاً ثبت شده است'
      });
    }

    // Create guard
    const guard = await Guard.create({
      name,
      email,
      password,
      phoneNumber,
      role: role || 'guard' // default role is guard
    });

    // Create and send token
    sendTokenResponse(guard, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body.email;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'لطفا ایمیل و رمز عبور را وارد کنید'
      });
    }

    // Check for user
    const guard = await Guard.findOne({ email }).select('+password');
    if (!guard) {
      return res.status(401).json({
        success: false,
        message: 'اطلاعات وارد شده نامعتبر است'
      });
    }

    // Check if password matches
    const isMatch = await guard.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'اطلاعات وارد شده نامعتبر است'
      });
    }

    // Create and send token
    sendTokenResponse(guard, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const guard = await Guard.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: guard
  });
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'خروج موفقیت‌آمیز بود'
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}; 