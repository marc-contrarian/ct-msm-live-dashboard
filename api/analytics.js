import { createClient } from '@supabase/supabase-js';

// Get analytics data for dashboard
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[Analytics] API endpoint called');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[Analytics] Missing Supabase configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Analytics] Fetching analytics data...');
    
    // Get failed charges data
    const { data: failedCharges, error: failedError } = await supabase
      .from('failed_charges')
      .select('id, failed_amount, recovery_status, priority_level');

    if (failedError) {
      console.error('[Analytics] Failed charges query error:', failedError);
      return res.status(500).json({ error: 'Failed to fetch failed charges' });
    }

    // Get customer subscriptions count
    const { data: subscriptions, error: subsError } = await supabase
      .from('customer_subscriptions')
      .select('id');

    if (subsError) {
      console.error('[Analytics] Subscriptions query error:', subsError);
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    // Calculate analytics
    const totalFailedCharges = failedCharges?.length || 0;
    const totalAtRisk = failedCharges?.reduce((sum, charge) => sum + (charge.failed_amount || 0), 0) || 0;
    const resolved = failedCharges?.filter(charge => charge.recovery_status === 'resolved').length || 0;
    const contacted = failedCharges?.filter(charge => charge.recovery_status === 'contacted').length || 0;
    const pending = failedCharges?.filter(charge => charge.recovery_status === 'pending').length || 0;
    
    const recoveryRate = totalFailedCharges > 0 ? (resolved / totalFailedCharges) * 100 : 0;
    
    // Priority breakdown
    const highPriority = failedCharges?.filter(charge => charge.priority_level === 'high').length || 0;
    const mediumPriority = failedCharges?.filter(charge => charge.priority_level === 'medium').length || 0;
    const lowPriority = failedCharges?.filter(charge => charge.priority_level === 'low').length || 0;
    
    const analytics = {
      totalFailedCharges,
      totalAtRisk: Math.round(totalAtRisk * 100) / 100,
      resolved,
      contacted,
      pending,
      recoveryRate: Math.round(recoveryRate * 10) / 10,
      totalCustomers: subscriptions?.length || 0,
      priorityBreakdown: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority
      },
      averageFailedAmount: totalFailedCharges > 0 ? Math.round((totalAtRisk / totalFailedCharges) * 100) / 100 : 0
    };

    console.log('[Analytics] Returning analytics:', analytics);
    
    res.status(200).json(analytics);

  } catch (error) {
    console.error('[Analytics] Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}