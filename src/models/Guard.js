const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const guardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'لطفا نام نگهبان را وارد کنید'],
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  nationalId: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'لطفا ایمیل را وارد کنید'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'لطفا یک ایمیل معتبر وارد کنید'
    ]
  },
  password: {
    type: String,
    required: [true, 'لطفا رمز عبور را وارد کنید'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['guard', 'admin', 'supervisor'],
    default: 'guard'
  },
  address: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
guardSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
guardSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Match user entered password to hashed password in database
guardSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Guard', guardSchema); 