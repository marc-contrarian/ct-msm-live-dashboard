-- MSM Dashboard Database Schema for Supabase

-- Events table to track all webhook events
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    order_id VARCHAR(100),
    product_name TEXT,
    customer_email VARCHAR(255),
    action VARCHAR(20), -- 'increment', 'decrement', 'renewal', etc.
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Current state table for dashboard metrics  
CREATE TABLE dashboard_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(50) UNIQUE NOT NULL,
    metric_value INTEGER NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(100)
);

-- Initialize current MSM enrollments
INSERT INTO dashboard_state (metric_name, metric_value, updated_by) 
VALUES ('msm_enrollments', 318, 'manual_initialization')
ON CONFLICT (metric_name) DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    last_updated = NOW();

-- Enrollment timeline for charts
CREATE TABLE enrollment_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    enrollments INTEGER NOT NULL,
    time_label VARCHAR(50),
    event_source VARCHAR(20) DEFAULT 'manual', -- 'webhook', 'manual', 'import'
    order_id VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add current timeline data
INSERT INTO enrollment_timeline (date, enrollments, time_label, event_source) VALUES
('2026-02-20', 0, 'Event Start', 'manual'),
('2026-02-21', 123, 'Day 1', 'manual'),
('2026-02-22', 283, 'Day 2', 'manual'),
('2026-02-23', 289, 'Day 3', 'manual'),
('2026-02-24', 299, 'Day 4', 'manual'),
('2026-02-25', 313, 'End of day', 'manual'),
('2026-02-25', 314, '8:41 PM CT', 'manual'),
('2026-02-25', 315, '8:55 PM CT', 'manual'),
('2026-02-25', 316, '8:55 PM CT', 'manual'),
('2026-02-26', 317, '11:09 AM CT', 'manual'),
('2026-02-26', 318, '1:48 PM CT', 'manual'),
('2026-02-26', 319, '2:23 PM CT', 'manual'),
('2026-02-26', 318, 'Refund processed', 'manual');

-- RLS (Row Level Security) policies
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_state ENABLE ROW LEVEL SECURITY;  
ALTER TABLE enrollment_timeline ENABLE ROW LEVEL SECURITY;

-- Allow public read access to dashboard data
CREATE POLICY "Allow public read dashboard_state" ON dashboard_state FOR SELECT USING (true);
CREATE POLICY "Allow public read enrollment_timeline" ON enrollment_timeline FOR SELECT USING (true);

-- Allow webhook service to insert/update (we'll add service role access)
CREATE POLICY "Allow service write webhook_events" ON webhook_events FOR ALL USING (true);
CREATE POLICY "Allow service write dashboard_state" ON dashboard_state FOR ALL USING (true);
CREATE POLICY "Allow service write enrollment_timeline" ON enrollment_timeline FOR ALL USING (true);