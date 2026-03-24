-- get-a-quote schema
-- All objects namespaced with getaquote_

CREATE TABLE IF NOT EXISTS getaquote_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE getaquote_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own" ON getaquote_users FOR SELECT USING (id = current_setting('app.user_id', true));
CREATE POLICY "users upsert own" ON getaquote_users FOR ALL USING (id = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS getaquote_vendors (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  location_area TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE getaquote_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors public read" ON getaquote_vendors FOR SELECT USING (true);
CREATE POLICY "vendors upsert own" ON getaquote_vendors FOR ALL USING (id = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS getaquote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES getaquote_users(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_area TEXT NOT NULL,
  budget_hint TEXT,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','closed','expired')),
  quote_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE getaquote_requests ENABLE ROW LEVEL SECURITY;
-- Public: vendors see open requests but NOT the user_id
CREATE POLICY "requests public read open" ON getaquote_requests FOR SELECT USING (status = 'open');
-- Owners see all their requests
CREATE POLICY "requests owner read all" ON getaquote_requests FOR SELECT USING (user_id = current_setting('app.user_id', true));
CREATE POLICY "requests owner insert" ON getaquote_requests FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true));
CREATE POLICY "requests owner update" ON getaquote_requests FOR UPDATE USING (user_id = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS getaquote_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES getaquote_requests(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES getaquote_vendors(id),
  price_cents INTEGER NOT NULL,
  timeline TEXT,
  notes TEXT,
  questions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','selected','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE getaquote_quotes ENABLE ROW LEVEL SECURITY;
-- Request owners can see quotes on their requests
CREATE POLICY "quotes owner read" ON getaquote_quotes FOR SELECT
  USING (EXISTS (SELECT 1 FROM getaquote_requests r WHERE r.id = request_id AND r.user_id = current_setting('app.user_id', true)));
-- Vendors see their own quotes
CREATE POLICY "quotes vendor read own" ON getaquote_quotes FOR SELECT USING (vendor_id = current_setting('app.user_id', true));
CREATE POLICY "quotes vendor insert" ON getaquote_quotes FOR INSERT WITH CHECK (vendor_id = current_setting('app.user_id', true));
CREATE POLICY "quotes vendor update own" ON getaquote_quotes FOR UPDATE USING (vendor_id = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS getaquote_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES getaquote_requests(id),
  quote_id UUID NOT NULL REFERENCES getaquote_quotes(id),
  user_id TEXT NOT NULL REFERENCES getaquote_users(id),
  vendor_id TEXT NOT NULL REFERENCES getaquote_vendors(id),
  total_cents INTEGER NOT NULL,
  commission_cents INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  identity_disclosed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE getaquote_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches user read own" ON getaquote_matches FOR SELECT USING (user_id = current_setting('app.user_id', true));
CREATE POLICY "matches vendor read own" ON getaquote_matches FOR SELECT USING (vendor_id = current_setting('app.user_id', true));
CREATE POLICY "matches service insert" ON getaquote_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "matches service update" ON getaquote_matches FOR UPDATE USING (true);

-- Function to increment quote count
CREATE OR REPLACE FUNCTION getaquote_increment_quote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE getaquote_requests SET quote_count = quote_count + 1 WHERE id = NEW.request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER getaquote_on_quote_insert
  AFTER INSERT ON getaquote_quotes
  FOR EACH ROW EXECUTE FUNCTION getaquote_increment_quote_count();
