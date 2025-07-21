const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 🆕 Load scheduled cron job for alerts
require('./cron/schedule');

const outageRoutes = require('./routes/outages');
const subRoutes = require('./routes/subscriptions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/outages', outageRoutes);
app.use('/api/subscribe', subRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('DownDetector API is running.');
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // ✅ Listen on all interfaces for Render compatibility
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
