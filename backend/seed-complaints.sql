-- ───────────────────────────────────────────────────────────────────────────────
-- Awaaz: Schema + Seed for Supabase
-- Run in Supabase SQL Editor: https://app.supabase.com → SQL Editor → New Query
-- ───────────────────────────────────────────────────────────────────────────────

-- Step 1: Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hi',
  category TEXT NOT NULL,
  keywords JSONB DEFAULT '[]',
  department TEXT NOT NULL,
  location JSONB NOT NULL DEFAULT '{"village":"","district":"","state":""}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved','rejected')),
  petition TEXT,
  audio_url TEXT,
  cluster_id TEXT,
  cluster_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_cluster_id ON complaints(cluster_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

-- Step 2: Seed complaints for testing
INSERT INTO complaints (
  text,
  language,
  category,
  keywords,
  department,
  location,
  status,
  petition,
  cluster_id,
  cluster_count
) VALUES
-- 1. Infrastructure
(
  'सड़क टूटी हुई है, मंदिर के पास। महीनों से मरम्मत नहीं हुई।',
  'hi',
  'Infrastructure',
  '["road", "repair", "temple", "damage"]',
  'Public Works Department (PWD)',
  '{"village": "Bhimapur", "district": "Prayagraj", "state": "Uttar Pradesh"}',
  'pending',
  'We the residents of Bhimapur request immediate repair of the road near the temple. The road has been damaged for months and poses a hazard to pedestrians and vehicles.',
  'Infrastructure|bhimapur|prayagraj|uttar pradesh',
  3
),
-- 2. Water
(
  'पानी की सप्लाई तीन दिन से बंद है। नगर निगम का कोई नहीं आया।',
  'hi',
  'Water',
  '["water", "supply", "municipality", "shortage"]',
  'Municipal Corporation',
  '{"village": "Bhimapur", "district": "Prayagraj", "state": "Uttar Pradesh"}',
  'pending',
  'We request urgent restoration of water supply in Bhimapur. The supply has been cut for three days with no response from the municipality.',
  'Water|bhimapur|prayagraj|uttar pradesh',
  2
),
-- 3. Health
(
  'सरकारी अस्पताल में डॉक्टर नहीं हैं। दवाई भी नहीं मिल रही।',
  'hi',
  'Health',
  '["hospital", "doctor", "medicine", "shortage"]',
  'Department of Health',
  '{"village": "Kharagpur", "district": "Midnapore", "state": "West Bengal"}',
  'in_progress',
  'We request the government to ensure adequate doctors and medicines at the primary health centre in Kharagpur.',
  'Health|kharagpur|midnapore|west bengal',
  1
),
-- 4. Agriculture
(
  'खेत में सिंचाई के लिए पानी नहीं मिल रहा। नहर सूखी पड़ी है।',
  'hi',
  'Agriculture',
  '["irrigation", "canal", "farming", "water"]',
  'Department of Agriculture',
  '{"village": "Agra", "district": "Agra", "state": "Uttar Pradesh"}',
  'pending',
  'We request restoration of canal water for irrigation. Farmers are unable to water their crops.',
  'Agriculture|agra|agra|uttar pradesh',
  1
),
-- 5. Education
(
  'स्कूल की छत टपक रही है। बारिश में बच्चे नहीं पढ़ सकते।',
  'hi',
  'Education',
  '["school", "roof", "leak", "repair"]',
  'Department of Education',
  '{"village": "Bhimapur", "district": "Prayagraj", "state": "Uttar Pradesh"}',
  'pending',
  'We request immediate repair of the school roof. Children cannot attend classes during rains.',
  'Education|bhimapur|prayagraj|uttar pradesh',
  1
),
-- 6. Corruption
(
  'राशन दुकान पर रिश्वत मांगी जा रही है। गरीबों को अनाज नहीं मिल रहा।',
  'hi',
  'Corruption',
  '["ration", "shop", "bribe", "PDS"]',
  'Department of Food and Civil Supplies',
  '{"village": "Kharagpur", "district": "Midnapore", "state": "West Bengal"}',
  'pending',
  'We request action against corruption at the ration shop. Poor families are being denied their entitlements.',
  'Corruption|kharagpur|midnapore|west bengal',
  1
);
