-- BroSplit Database Schema for Supabase
-- Run this SQL in Supabase SQL Editor to create all tables

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_core BOOLEAN DEFAULT false,
  revolut_username TEXT,
  bank_account TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'drink', 'other')),
  is_shared BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  name TEXT,
  payer_id UUID REFERENCES members(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  tip DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event members (many-to-many for present members + self-paid flag)
CREATE TABLE event_members (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  paid_self BOOLEAN DEFAULT false,
  PRIMARY KEY (event_id, member_id)
);

-- Event preset items (for Variant A)
CREATE TABLE event_preset_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL
);

-- Member consumptions
CREATE TABLE member_consumptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  has_paid BOOLEAN DEFAULT false,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(event_id, member_id)
);

-- Consumption items (regular items consumed by member)
CREATE TABLE consumption_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consumption_id UUID REFERENCES member_consumptions(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL
);

-- Shared items (which shared items member signed up for)
CREATE TABLE consumption_shared_items (
  consumption_id UUID REFERENCES member_consumptions(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  PRIMARY KEY (consumption_id, menu_item_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_preset_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_shared_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - no auth)
CREATE POLICY "Allow all on members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on event_members" ON event_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on event_preset_items" ON event_preset_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on member_consumptions" ON member_consumptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on consumption_items" ON consumption_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on consumption_shared_items" ON consumption_shared_items FOR ALL USING (true) WITH CHECK (true);
