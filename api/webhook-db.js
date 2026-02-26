import { createClient } from '@supabase/supabase-js';

// Database-powered webhook handler for real-time updates
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event_type, data } = req.body;
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Log the webhook event
    console.log(`[Webhook DB] Received: ${event_type}`, {
      timestamp: new Date().toISOString(),
      event_type,
      order_id: data?.order_id
    });

    // Store webhook event in database
    await supabase.from('webhook_events').insert({
      event_type,
      order_id: data?.order_id,
      product_name: data?.product?.name,
      customer_email: data?.customer?.email,
      metadata: data
    });

    // Handle different event types
    switch (event_type) {
      case 'order.completed':
        if (isMSMProduct(data)) {
          await handleNewOrder(supabase, data);
        }
        break;
      case 'order.refunded':
        if (isMSMProduct(data)) {
          await handleRefund(supabase, data);
        }
        break;
      case 'subscription.charged':
        await handleRenewal(supabase, data);
        break;
      case 'charge.failed':
        await handleFailedPayment(supabase, data);
        break;
      default:
        console.log(`[Webhook DB] Unhandled event type: ${event_type}`);
    }

    res.status(200).json({ 
      status: 'success', 
      event_type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Webhook DB] Error processing:', error);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
}

function isMSMProduct(data) {
  const productName = data.product?.name?.toLowerCase() || '';
  const msmKeywords = ['msm', 'master', 'sales', 'machine', 'live'];
  return msmKeywords.some(keyword => productName.includes(keyword));
}

async function handleNewOrder(supabase, data) {
  console.log('[Webhook DB] Processing new MSM order:', data?.order_id);
  
  try {
    // Get current enrollment count
    const { data: currentState } = await supabase
      .from('dashboard_state')
      .select('metric_value')
      .eq('metric_name', 'msm_enrollments')
      .single();

    const newCount = (currentState?.metric_value || 318) + 1;

    // Update enrollment count
    await supabase
      .from('dashboard_state')
      .upsert({
        metric_name: 'msm_enrollments',
        metric_value: newCount,
        updated_by: `webhook_${data?.order_id}`
      });

    // Add timeline entry
    await supabase.from('enrollment_timeline').insert({
      date: new Date().toISOString().split('T')[0],
      enrollments: newCount,
      time_label: `${new Date().toLocaleTimeString('en-US', { 
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })} CT`,
      event_source: 'webhook',
      order_id: data?.order_id
    });

    console.log(`[Webhook DB] Incremented enrollments: ${currentState?.metric_value} → ${newCount}`);

  } catch (error) {
    console.error('[Webhook DB] Error handling new order:', error);
    throw error;
  }
}

async function handleRefund(supabase, data) {
  console.log('[Webhook DB] Processing MSM refund:', data?.order_id);
  
  try {
    // Get current enrollment count
    const { data: currentState } = await supabase
      .from('dashboard_state')
      .select('metric_value')
      .eq('metric_name', 'msm_enrollments')
      .single();

    const newCount = Math.max(0, (currentState?.metric_value || 318) - 1);

    // Update enrollment count
    await supabase
      .from('dashboard_state')
      .upsert({
        metric_name: 'msm_enrollments',
        metric_value: newCount,
        updated_by: `refund_${data?.order_id}`
      });

    // Add timeline entry
    await supabase.from('enrollment_timeline').insert({
      date: new Date().toISOString().split('T')[0],
      enrollments: newCount,
      time_label: `${new Date().toLocaleTimeString('en-US', { 
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })} CT (Refund)`,
      event_source: 'webhook',
      order_id: data?.order_id
    });

    console.log(`[Webhook DB] Decremented enrollments: ${currentState?.metric_value} → ${newCount}`);

  } catch (error) {
    console.error('[Webhook DB] Error handling refund:', error);
    throw error;
  }
}

async function handleRenewal(supabase, data) {
  console.log('[Webhook DB] Processing renewal:', data?.subscription_id);
  
  // Store renewal event for future analytics
  await supabase.from('webhook_events').insert({
    event_type: 'subscription.charged',
    order_id: data?.subscription_id,
    metadata: data,
    action: 'renewal'
  });
}

async function handleFailedPayment(supabase, data) {
  console.log('[Webhook DB] Processing failed payment:', data?.charge_id);
  
  // Store failed payment for dunning workflows
  await supabase.from('webhook_events').insert({
    event_type: 'charge.failed',
    order_id: data?.charge_id,
    metadata: data,
    action: 'payment_failed'
  });
}