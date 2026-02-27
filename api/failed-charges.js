import { createClient } from '@supabase/supabase-js';

// Get failed charges for dashboard display
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Failed charges endpoint called');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[API] Missing Supabase configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[API] Fetching failed charges from database...');
    
    const { data, error } = await supabase
      .from('failed_charges')
      .select(`
        id,
        subscription_id,
        customer_email,
        customer_first_name,
        customer_last_name,
        customer_name,
        failed_amount,
        failure_reason,
        failure_date,
        recovery_status,
        priority_level,
        recovery_notes,
        total_paid,
        remaining_balance,
        created_at,
        updated_at
      `)
      .order('failure_date', { ascending: false });

    if (error) {
      console.error('[API] Database error:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }

    console.log(`[API] Found ${data?.length || 0} failed charges`);
    
    // Format data for frontend
    const formattedData = (data || []).map(charge => ({
      id: charge.id,
      subscriptionId: charge.subscription_id,
      customerName: charge.customer_name || `${charge.customer_first_name} ${charge.customer_last_name}`,
      customerEmail: charge.customer_email,
      failedAmount: charge.failed_amount,
      failureReason: charge.failure_reason,
      failureDate: charge.failure_date,
      recoveryStatus: charge.recovery_status || 'pending',
      priorityLevel: charge.priority_level || 'medium',
      recoveryNotes: charge.recovery_notes || '',
      totalPaid: charge.total_paid || 0,
      remainingBalance: charge.remaining_balance || 0,
      createdAt: charge.created_at,
      updatedAt: charge.updated_at
    }));

    res.status(200).json(formattedData);

  } catch (error) {
    console.error('[API] Error in failed-charges endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}