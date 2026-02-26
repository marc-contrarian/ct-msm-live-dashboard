# SamCart Webhook Integration Setup

## Overview
This system automatically updates the MSM Live dashboard when SamCart events occur (purchases, refunds, etc.) instead of requiring manual updates.

## Webhook Endpoints

### Primary Webhook Handler
- **URL:** `https://ct-msm-live-dashboard.vercel.app/api/webhook`
- **Method:** POST
- **Purpose:** Receives SamCart webhook events and updates dashboard

### Admin/Testing Endpoint  
- **URL:** `https://ct-msm-live-dashboard.vercel.app/api/webhook-admin?token=msm-admin-2026`
- **Methods:** GET (status), POST (testing)
- **Purpose:** Monitor webhook events and test functionality

## SamCart Setup Instructions

1. **Login to SamCart Dashboard**
2. **Go to Settings > Webhooks**
3. **Add New Webhook:**
   - **URL:** `https://ct-msm-live-dashboard.vercel.app/api/webhook`
   - **Events to Subscribe:**
     - `order.completed` (new purchases)
     - `order.refunded` (refunds)
     - `subscription.charged` (renewals)
     - `charge.failed` (failed payments)
4. **Save Webhook**

## Supported Events

### `order.completed`
- **Triggers:** New MSM Live purchase
- **Action:** Increments enrollment count
- **Updates:** Dashboard count, revenue, timeline

### `order.refunded`  
- **Triggers:** MSM Live refund processed
- **Action:** Decrements enrollment count
- **Updates:** Dashboard count, revenue, timeline

### `subscription.charged`
- **Triggers:** Subscription renewal
- **Action:** Logs renewal event (future enhancement)

### `charge.failed`
- **Triggers:** Failed payment attempt
- **Action:** Logs failed payment (future enhancement)

## Product Detection
The system identifies MSM Live products by checking for keywords:
- "msm", "master", "sales", "machine", "live"

Products not matching these keywords are ignored.

## Testing the Integration

### Check Status
```bash
curl "https://ct-msm-live-dashboard.vercel.app/api/webhook-admin?token=msm-admin-2026"
```

### Simulate Purchase
```bash
curl -X POST "https://ct-msm-live-dashboard.vercel.app/api/webhook-admin?token=msm-admin-2026" \
  -H "Content-Type: application/json" \
  -d '{"action": "simulate_purchase"}'
```

### Simulate Refund
```bash
curl -X POST "https://ct-msm-live-dashboard.vercel.app/api/webhook-admin?token=msm-admin-2026" \
  -H "Content-Type: application/json" \
  -d '{"action": "simulate_refund"}'
```

## File Structure

### Auto-Updated Files
- `current_academy_count.txt` - Current enrollment count
- `msm_live_dashboard_data.json` - Dashboard data with timeline
- `webhook-log.json` - Event log (last 100 events)

### API Endpoints
- `api/webhook.js` - Main webhook handler
- `api/webhook-admin.js` - Admin/testing interface
- `api/live-data.js` - Now reads from webhook-updated files

## Monitoring

### Real-time Updates
- Dashboard automatically reflects webhook changes
- No manual updates needed for purchases/refunds
- Timeline entries include webhook metadata

### Event Logging
- All webhook events logged to `webhook-log.json`
- Includes timestamps, order IDs, actions taken
- Accessible via admin endpoint

## Security Notes

### Webhook Security
- Currently accepts all SamCart webhook events
- **TODO:** Add webhook signature verification for production
- Admin endpoint requires token authentication

### Access Control
- Admin token: `msm-admin-2026`
- Change token for production use
- Consider IP whitelisting for webhook endpoint

## Troubleshooting

### Dashboard Not Updating
1. Check webhook admin endpoint for recent events
2. Verify SamCart webhook is configured correctly
3. Check product name contains MSM keywords
4. Review webhook-log.json for errors

### Testing Webhook
1. Use admin endpoint to simulate events
2. Check dashboard updates in real-time
3. Monitor browser developer tools for API calls

## Next Steps

### Production Enhancements
- [ ] Add SamCart webhook signature verification
- [ ] Implement rate limiting
- [ ] Add email notifications for webhook events
- [ ] Build subscription renewal tracking
- [ ] Add failed payment recovery workflows

### Dashboard Features
- [ ] Real-time enrollment counter
- [ ] Webhook event timeline view
- [ ] Revenue attribution by source
- [ ] Customer journey visualization