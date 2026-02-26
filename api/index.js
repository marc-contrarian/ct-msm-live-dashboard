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
  // Get current Academy count from file or default to baseline
  let currentEnrollments = 313; // Current record count
  let currentRevenue = 3193000; // $3.193M
  
  try {
    if (fs.existsSync('current_academy_count.txt')) {
      const countData = fs.readFileSync('current_academy_count.txt', 'utf8').trim();
      const count = parseInt(countData);
      if (!isNaN(count) && count > 123) {
        currentEnrollments = count;
        
        // Calculate revenue based on actual count
        if (count === 313) {
          currentRevenue = 3193000; // $3.193M for obliteration continues
        } else if (count === 312) {
          currentRevenue = 3188000; // $3.188M for record obliterated
        } else if (count === 310) {
          currentRevenue = 3178000; // $3.178M for unstoppable momentum
        } else if (count === 309) {
          currentRevenue = 3173000; // $3.173M for historic streak
        } else if (count === 308) {
          currentRevenue = 3168000; // $3.168M for record-extending
        } else if (count === 307) {
          currentRevenue = 3163000; // $3.163M for record-breaking
        } else if (count === 306) {
          currentRevenue = 3150000; // $3.15M for record-matching
        } else {
          currentRevenue = count * 10285; // More accurate average
        }
      }
    }
  } catch (error) {
    console.error('Error reading academy count:', error);
  }
  
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
    enrollments: 313,
    message: 'MSM Live Dashboard - Record Obliteration Continues!' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MSM Live Dashboard server running on port ${PORT}`);
  console.log(`📊 Historic 313 Academy enrollments - Record obliteration continues!`);
});

module.exports = app;