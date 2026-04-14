-- Performance Optimization Indexes for BroSplit
-- Run this in Supabase SQL Editor to improve query performance

-- Indexes for foreign key lookups (eliminates sequential scans)
-- These improve JOIN performance in nested queries

CREATE INDEX IF NOT EXISTS idx_event_members_event_id 
ON event_members(event_id);

CREATE INDEX IF NOT EXISTS idx_event_preset_items_event_id 
ON event_preset_items(event_id);

CREATE INDEX IF NOT EXISTS idx_member_consumptions_event_id 
ON member_consumptions(event_id);

CREATE INDEX IF NOT EXISTS idx_consumption_items_consumption_id 
ON consumption_items(consumption_id);

CREATE INDEX IF NOT EXISTS idx_consumption_shared_items_consumption_id 
ON consumption_shared_items(consumption_id);

-- Composite index for member consumptions lookup
CREATE INDEX IF NOT EXISTS idx_member_consumptions_event_member 
ON member_consumptions(event_id, member_id);

-- Index for sorting events by date (used in getEvents)
CREATE INDEX IF NOT EXISTS idx_events_date 
ON events(date DESC);

-- Index for member name sorting
CREATE INDEX IF NOT EXISTS idx_members_name 
ON members(name);

-- Index for menu item name sorting
CREATE INDEX IF NOT EXISTS idx_menu_items_name 
ON menu_items(name);

-- Analyze tables to update statistics for query planner
ANALYZE events;
ANALYZE event_members;
ANALYZE event_preset_items;
ANALYZE member_consumptions;
ANALYZE consumption_items;
ANALYZE consumption_shared_items;
ANALYZE members;
ANALYZE menu_items;
