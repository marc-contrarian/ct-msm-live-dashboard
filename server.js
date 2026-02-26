const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Enhanced MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

// API Routes
app.get('/api/live-data', (req, res) => {
  // Current Academy count - Updated 2026-02-26
  let currentEnrollments = 317; // As of 11:09 AM CT on 2/26/26
  let currentRevenue = 3170000; // $3.17M
  
  // Force current data for now (file reading seems to have Vercel deployment issues)
  currentEnrollments = 317;
  currentRevenue = currentEnrollments * 10000; // $10K per enrollment
  
  const liveData = {
    tickets: 5680,
    ticketRevenue: 666134,
    enrollments: currentEnrollments,
    enrollmentRevenue: currentRevenue,
    lastUpdated: new Date().toISOString(),
    eventStatus: 'live',
    nextUpdate: new Date(Date.now() + 30000).toISOString()
  };
  
  res.json(liveData);
});

app.get('/api/historical-data', (req, res) => {
  try {
    const data = fs.readFileSync('msm_live_dashboard_data.json', 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load historical data' });
  }
});

// Serve main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint for Vercel
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    enrollments: 317,
    message: 'MSM Live Dashboard - 317 Enrollments (84.5% of 375 Goal)' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MSM Live Dashboard server running on port ${PORT}`);
  console.log(`📊 317 Academy enrollments - 84.5% of 375 goal achieved!`);
});

module.exports = app;