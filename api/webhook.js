import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Webhook handler for SamCart events
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event_type, data } = req.body;
    
    // Log the webhook event
    console.log(`[Webhook] Received: ${event_type}`, {
      timestamp: new Date().toISOString(),
      event_type,
      data: data ? Object.keys(data) : 'no data'
    });

    // Handle different event types
    switch (event_type) {
      case 'order.completed':
        await handleNewOrder(data);
        break;
      case 'order.refunded':
        await handleRefund(data);
        break;
      case 'subscription.charged':
        await handleRenewal(data);
        break;
      case 'charge.failed':
        await handleFailedPayment(data);
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${event_type}`);
    }

    res.status(200).json({ status: 'success', event_type });
  } catch (error) {
    console.error('[Webhook] Error processing:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

export async function handleNewOrder(data) {
  console.log('[Webhook] Processing new order:', data?.order_id);
  
  // Check if this is an MSM Live purchase
  if (isMSMProduct(data)) {
    await updateMSMEnrollments('increment', {
      order_id: data.order_id,
      customer_email: data.customer?.email,
      timestamp: new Date().toISOString()
    });
  }
}

export async function handleRefund(data) {
  console.log('[Webhook] Processing refund:', data?.order_id);
  
  // Check if this is an MSM Live refund
  if (isMSMProduct(data)) {
    await updateMSMEnrollments('decrement', {
      order_id: data.order_id,
      customer_email: data.customer?.email,
      timestamp: new Date().toISOString(),
      reason: 'refund'
    });
  }
}

async function handleRenewal(data) {
  console.log('[Webhook] Processing renewal:', data?.subscription_id);
  // Handle subscription renewals (future enhancement)
}

async function handleFailedPayment(data) {
  console.log('[Webhook] Processing failed payment:', data?.charge_id);
  // Handle failed payments (future enhancement)
}

function isMSMProduct(data) {
  // Check if the product is MSM Live related
  const productName = data.product?.name?.toLowerCase() || '';
  const msmKeywords = ['msm', 'master', 'sales', 'machine', 'live'];
  
  return msmKeywords.some(keyword => productName.includes(keyword));
}

async function updateMSMEnrollments(action, metadata) {
  try {
    console.log(`[Webhook] Would ${action} enrollment for order: ${metadata.order_id}`);
    
    // NOTE: Vercel serverless functions have read-only filesystem
    // For production, this needs to connect to a database or external storage
    // For now, we'll just log the events
    
    const currentCount = 318; // Read from current state
    const newCount = action === 'increment' ? currentCount + 1 : currentCount - 1;
    
    console.log(`[Webhook] Enrollment change: ${currentCount} → ${newCount}`);
    
    // Log the change (for monitoring)
    await logWebhookEvent({
      action,
      old_count: currentCount,
      new_count: newCount,
      metadata,
      timestamp: new Date().toISOString(),
      note: 'Logged only - filesystem read-only on Vercel'
    });
    
  } catch (error) {
    console.error('[Webhook] Error processing enrollment update:', error);
    throw error;
  }
}

async function logWebhookEvent(event) {
  try {
    // For now, just console.log the event
    // In production, this would send to a logging service or database
    console.log('[Webhook] Event:', JSON.stringify(event, null, 2));
    
    // TODO: Send to external logging service (e.g., Supabase, Firebase, etc.)
    
  } catch (error) {
    console.error('[Webhook] Error logging event:', error);
  }
}