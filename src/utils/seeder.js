const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const connectDB = require('../config/db');

// Models
const Guard = require('../models/Guard');
const Area = require('../models/Area');
const Shift = require('../models/Shift');
const Leave = require('../models/Leave');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Read JSON files
const guards = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/guards.json`, 'utf-8')
);

const areas = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/areas.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Guard.create(guards);
    await Area.create(areas);

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Guard.deleteMany();
    await Area.deleteMany();
    await Shift.deleteMany();
    await Leave.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please add proper flag: -i (import) or -d (delete)');
  process.exit(1);
} 