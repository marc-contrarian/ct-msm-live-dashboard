import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { method, query } = req;
  
  // Simple authentication via query parameter
  if (query.token !== 'msm-admin-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (method === 'GET') {
      // Get current status (simplified for Vercel limitations)
      let currentCount = 318;
      try {
        const countPath = path.join(process.cwd(), 'current_academy_count.txt');
        currentCount = parseInt(fs.readFileSync(countPath, 'utf8'));
      } catch (error) {
        // Use fallback
      }
      
      return res.json({
        status: 'webhook system active',
        currentEnrollments: currentCount,
        note: 'Webhook events are logged to console only (Vercel filesystem is read-only)',
        webhookEndpoint: '/api/webhook',
        lastChecked: new Date().toISOString(),
        limitations: [
          'File writes not supported on Vercel serverless',
          'Events logged to console only',
          'For persistence, integrate with database'
        ]
      });
      
    } else if (method === 'POST') {
      // Test webhook functionality
      const { action, test_data } = req.body;
      
      if (action === 'simulate_purchase') {
        // Simulate a purchase webhook
        const testEvent = {
          event_type: 'order.completed',
          data: {
            order_id: `test-${Date.now()}`,
            product: { name: 'MSM Live Test Purchase' },
            customer: { email: 'test@example.com' },
            ...test_data
          }
        };
        
        // Process the test event
        await simulateWebhook(testEvent);
        
        return res.json({
          status: 'test purchase simulated',
          event: testEvent,
          timestamp: new Date().toISOString()
        });
        
      } else if (action === 'simulate_refund') {
        // Simulate a refund webhook
        const testEvent = {
          event_type: 'order.refunded',
          data: {
            order_id: `test-refund-${Date.now()}`,
            product: { name: 'MSM Live Test Refund' },
            customer: { email: 'test@example.com' },
            ...test_data
          }
        };
        
        await simulateWebhook(testEvent);
        
        return res.json({
          status: 'test refund simulated',
          event: testEvent,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(400).json({ error: 'Unknown action' });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('[Webhook Admin] Error:', error);
    res.status(500).json({ error: 'Admin API error' });
  }
}

async function simulateWebhook(event) {
  // Import and call the webhook handler logic
  const { handleNewOrder, handleRefund } = await import('./webhook.js');
  
  if (event.event_type === 'order.completed') {
    await handleNewOrder(event.data);
  } else if (event.event_type === 'order.refunded') {
    await handleRefund(event.data);
  }
}