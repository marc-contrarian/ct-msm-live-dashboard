import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'msm_live_dashboard_data.json');
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error loading historical data:', error);
    res.status(500).json({ error: 'Failed to load historical data', details: error.message });
  }
}