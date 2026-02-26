import { createClient } from '@supabase/supabase-js';

// Database-powered historical data API
export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Get current enrollment state
    const { data: currentState } = await supabase
      .from('dashboard_state')
      .select('metric_value, last_updated')
      .eq('metric_name', 'msm_enrollments')
      .single();

    // Get enrollment timeline
    const { data: timeline } = await supabase
      .from('enrollment_timeline')
      .select('*')
      .order('timestamp', { ascending: true });

    const currentEnrollments = currentState?.metric_value || 318;
    const currentRevenue = currentEnrollments * 10000;

    // Build timeline for charts
    const chartTimeline = timeline?.map(entry => ({
      date: entry.date,
      enrollments: entry.enrollments,
      time: entry.time_label || 'Unknown time',
      source: entry.event_source || 'manual'
    })) || [];

    const historicalData = {
      events: {
        september2025: {
          totalTickets: 5893,
          totalEnrollments: 363,
          totalRevenue: 3630000,
          conversionRate: 6.2,
          timeline: [
            {"date": "2025-09-19", "enrollments": 0},
            {"date": "2025-09-20", "enrollments": 88},
            {"date": "2025-09-21", "enrollments": 217},
            {"date": "2025-09-22", "enrollments": 305},
            {"date": "2025-09-23", "enrollments": 310},
            {"date": "2025-09-24", "enrollments": 325},
            {"date": "2025-09-25", "enrollments": 340},
            {"date": "2025-09-26", "enrollments": 353},
            {"date": "2025-09-27", "enrollments": 363}
          ]
        },
        february2025: {
          totalTickets: 977,
          totalEnrollments: 336,
          totalRevenue: 2870000,
          conversionRate: 34.4
        },
        february2026: {
          totalTickets: 5680,
          totalEnrollments: currentEnrollments,
          totalRevenue: currentRevenue,
          conversionRate: 5.6,
          status: "tracking_to_goal",
          recordDifference: currentEnrollments - 363,
          timeline: chartTimeline
        }
      },
      lastUpdated: currentState?.last_updated || new Date().toISOString(),
      source: 'database',
      database: 'supabase'
    };

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(historicalData);

  } catch (error) {
    console.error('[Historical Data DB] Error:', error);
    res.status(500).json({ 
      error: 'Failed to load historical data', 
      details: error.message 
    });
  }
}