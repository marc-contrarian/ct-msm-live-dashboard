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
    // Read current data
    const dataPath = path.join(process.cwd(), 'msm_live_dashboard_data.json');
    const countPath = path.join(process.cwd(), 'current_academy_count.txt');
    
    const dashboardData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const currentCount = parseInt(fs.readFileSync(countPath, 'utf8'));
    
    // Calculate new enrollment count
    const newCount = action === 'increment' ? currentCount + 1 : currentCount - 1;
    
    // Update dashboard data
    dashboardData.events.february2026.totalEnrollments = newCount;
    dashboardData.events.february2026.totalRevenue = newCount * 10000;
    dashboardData.events.february2026.recordDifference = newCount - 363; // vs Sept 2025 record
    dashboardData.lastUpdated = new Date().toISOString();
    
    // Add timeline entry
    const timelineEntry = {
      date: new Date().toISOString().split('T')[0],
      enrollments: newCount,
      time: `${new Date().toLocaleTimeString('en-US', { 
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })} CT`,
      webhook: true,
      action,
      order_id: metadata.order_id
    };
    
    dashboardData.events.february2026.timeline.push(timelineEntry);
    
    // Write updated data
    fs.writeFileSync(dataPath, JSON.stringify(dashboardData, null, 2));
    fs.writeFileSync(countPath, newCount.toString());
    
    console.log(`[Webhook] Updated enrollments: ${currentCount} → ${newCount}`);
    
    // Log the change
    await logWebhookEvent({
      action,
      old_count: currentCount,
      new_count: newCount,
      metadata,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Webhook] Error updating enrollments:', error);
    throw error;
  }
}

async function logWebhookEvent(event) {
  try {
    const logPath = path.join(process.cwd(), 'webhook-log.json');
    let logs = [];
    
    try {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    } catch (error) {
      // File doesn't exist, start fresh
    }
    
    logs.push(event);
    
    // Keep only last 100 events
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('[Webhook] Error logging event:', error);
  }
}