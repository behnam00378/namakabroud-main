const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const errorHandler = require('./src/middleware/error');
const connectDB = require('./src/config/db');

// Import routes
const guardRoutes = require('./src/routes/guardRoutes');
const areaRoutes = require('./src/routes/areaRoutes');
const shiftRoutes = require('./src/routes/shiftRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/guards', guardRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/auth', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('نگهبان API - سیستم مدیریت نگهبانان');
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 