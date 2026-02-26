# Database Integration Setup (Phase 2)

This upgrades the webhook system from console logging to **full automation** with real-time dashboard updates.

## 🗄️ **Database Solution: Supabase**

**Why Supabase?**
- ✅ **Free tier:** 500MB storage, 2GB bandwidth  
- ✅ **Real-time:** Built-in real-time subscriptions
- ✅ **REST API:** Easy integration with Vercel
- ✅ **PostgreSQL:** Full SQL capabilities
- ✅ **Row Level Security:** Built-in access control

## 📋 **Setup Instructions**

### **1. Create Supabase Project**
1. **Go to:** https://supabase.com/dashboard
2. **Create new project:** "MSM Dashboard DB"
3. **Note your credentials:**
   - Project URL: `https://[project-id].supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1...`
   - Service Role Key: `eyJhbGciOiJIUzI1...` (for webhooks)

### **2. Run Database Schema**
1. **Supabase Dashboard** → SQL Editor
2. **Paste and run:** Contents of `sql/schema.sql`
3. **Verify tables created:**
   - `webhook_events`
   - `dashboard_state`  
   - `enrollment_timeline`

### **3. Add Environment Variables**
Add to Vercel environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to add in Vercel:**
1. **Vercel Dashboard** → Your project → Settings → Environment Variables
2. **Add each variable** for Production, Preview, Development
3. **Redeploy** after adding

### **4. Install Dependencies**
```bash
cd /Users/tobyjenkins/ct-msm-live-dashboard
npm install @supabase/supabase-js
```

### **5. Update API Endpoints**
Replace current APIs with database-powered versions:

```bash
# Backup current files
mv api/webhook.js api/webhook-static.js.bak
mv api/live-data.js api/live-data-static.js.bak  
mv api/historical-data.js api/historical-data-static.js.bak

# Activate database versions
mv api/webhook-db.js api/webhook.js
mv api/live-data-db.js api/live-data.js
mv api/historical-data-db.js api/historical-data.js
```

### **6. Deploy Updated System**
```bash
git add -A
git commit -m "Upgrade to database-powered webhook automation"
git push origin master
npx vercel --prod
```

### **7. Update SamCart Webhook URL**
**No changes needed** - same webhook URL:
- `https://ct-msm-live-dashboard.vercel.app/api/webhook`

## 🚀 **What Changes After Setup**

### **✅ Before (Static Files)**
- Manual dashboard updates
- Console logging only
- No persistent storage
- Vercel filesystem limitations

### **🎯 After (Database-Powered)**
- ✅ **Automatic dashboard updates** on SamCart events
- ✅ **Persistent event storage** in Supabase
- ✅ **Real-time data** from database
- ✅ **Event history & analytics** 
- ✅ **No manual intervention** required

## 📊 **New Capabilities**

### **Real-time Dashboard**
- Enrollment count updates instantly on purchase/refund
- Revenue calculations automatic
- Timeline updates with precise timestamps
- Goal progress tracking

### **Event Analytics**  
- All webhook events stored with metadata
- Purchase/refund history
- Customer email tracking
- Order ID correlation

### **Future Enhancements Ready**
- Renewal rate calculations
- Failed payment tracking
- Customer journey analysis  
- Revenue attribution

## 🧪 **Testing the Database System**

### **Test Purchase Event**
```bash
curl -X POST "https://ct-msm-live-dashboard.vercel.app/api/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "order.completed",
    "data": {
      "order_id": "test-db-purchase-123",
      "product": {"name": "MSM Live Database Test"},
      "customer": {"email": "test@example.com"}
    }
  }'
```

### **Check Live Data**
```bash
curl "https://ct-msm-live-dashboard.vercel.app/api/live-data"
```

**Expected Response:**
```json
{
  "enrollments": 319,
  "source": "database",
  "database": "supabase",
  "goalProgress": 85.1
}
```

### **Verify in Supabase**
1. **Supabase Dashboard** → Table Editor
2. **Check tables:**
   - `webhook_events` - Should show test event
   - `dashboard_state` - Should show updated enrollment count
   - `enrollment_timeline` - Should show new timeline entry

## 🔒 **Security Notes**

### **API Keys**
- **Anon Key:** Read-only access to public tables
- **Service Role Key:** Full database access (webhooks only)
- **Row Level Security:** Enabled on all tables

### **Access Policies**  
- Public read access to dashboard data
- Service role write access for webhooks
- No unauthorized data modification

## 📈 **Expected Performance**

### **Response Times**
- Live Data API: ~100-200ms (vs 50ms static)
- Webhook Processing: ~200-300ms (vs instant static)
- Historical Data: ~150-250ms (vs 100ms static)

### **Reliability**
- Supabase uptime: 99.9%
- Automatic failover to static data if DB unavailable
- Error handling and logging

## 🚨 **Troubleshooting**

### **Database Connection Issues**
1. **Check environment variables** are set correctly
2. **Verify Supabase project** is active
3. **Check API keys** have correct permissions

### **Webhook Not Updating Dashboard**
1. **Test webhook endpoint** manually
2. **Check Supabase logs** for errors
3. **Verify product name detection** (MSM keywords)

### **Dashboard Shows Fallback Data**
- **Source: "fallback"** = Database connection failed
- **Source: "database"** = Working correctly

## 💰 **Cost Estimate**

### **Supabase Free Tier**
- ✅ **Storage:** 500MB (plenty for webhook events)
- ✅ **Bandwidth:** 2GB/month 
- ✅ **Requests:** Unlimited
- ✅ **Cost:** $0/month

### **Scaling (If Needed)**
- **Pro Plan:** $25/month (8GB storage, 50GB bandwidth)
- **Estimated usage:** <1% of free tier limits

---

**Total Setup Time:** ~30 minutes  
**Result:** Fully automated MSM dashboard with zero manual updates! 🎯