import { createClient } from '@supabase/supabase-js';

// Database-powered live data API for real-time dashboard
export default async function handler(req, res) {
  try {
    // Initialize Supabase client  
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Get current enrollment count from database
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('dashboard_state')
      .select('metric_value, last_updated')
      .eq('metric_name', 'msm_enrollments')
      .single();

    if (enrollmentError) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentError.message}`);
    }

    const currentEnrollments = enrollmentData?.metric_value || 318;
    const currentRevenue = currentEnrollments * 10000; // $10K per enrollment
    
    // Calculate goal progress
    const goalProgress = ((currentEnrollments / 375) * 100).toFixed(1);
    const recordDifference = currentEnrollments - 363; // vs Sept 2025 record

    const liveData = {
      tickets: 5680,
      ticketRevenue: 666134,
      enrollments: currentEnrollments,
      enrollmentRevenue: currentRevenue,
      goalProgress: parseFloat(goalProgress),
      recordDifference,
      lastUpdated: enrollmentData?.last_updated || new Date().toISOString(),
      eventStatus: 'live',
      nextUpdate: new Date(Date.now() + 30000).toISOString(),
      source: 'database',
      database: 'supabase'
    };
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(liveData);

  } catch (error) {
    console.error('[Live Data DB] Error:', error);
    
    // Fallback to static data if database fails
    const fallbackData = {
      tickets: 5680,
      ticketRevenue: 666134,
      enrollments: 318,
      enrollmentRevenue: 3180000,
      lastUpdated: new Date().toISOString(),
      eventStatus: 'live',
      nextUpdate: new Date(Date.now() + 30000).toISOString(),
      source: 'fallback',
      error: error.message
    };
    
    res.status(200).json(fallbackData);
  }
}