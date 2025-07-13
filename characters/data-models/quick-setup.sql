-- クイックセットアップ用SQL
-- Supabase SQL Editorで実行してください

-- 1. 鳥テーブル作成
CREATE TABLE IF NOT EXISTS birds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    family TEXT,
    size TEXT,
    habitat TEXT,
    appearance TEXT,
    voice TEXT,
    behavior TEXT,
    activity TEXT,
    diet TEXT,
    social_behavior TEXT,
    nesting_habits TEXT,
    personality_general TEXT,
    human_interaction TEXT,
    intelligence TEXT,
    seasonal_spring TEXT,
    seasonal_summer TEXT,
    seasonal_autumn TEXT,
    seasonal_winter TEXT,
    symbolism_cultural TEXT,
    symbolism_spiritual TEXT,
    noroshiya_suitable_types TEXT[],
    noroshiya_smoking_style TEXT,
    noroshiya_communication_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 石テーブル作成
CREATE TABLE IF NOT EXISTS stones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    colors TEXT[],
    size TEXT,
    shape TEXT,
    texture TEXT,
    origin TEXT,
    rarity TEXT,
    appearance TEXT,
    weight TEXT,
    hardness TEXT,
    special_features TEXT,
    elemental_element TEXT,
    elemental_energy TEXT,
    elemental_resonance TEXT,
    finding_locations JSONB,
    matching_keywords TEXT[],
    noroshiya_primary_match TEXT,
    noroshiya_match_reason TEXT,
    noroshiya_special_reaction TEXT,
    folklore_legend TEXT,
    folklore_usage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_birds_updated_at BEFORE UPDATE ON birds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stones_updated_at BEFORE UPDATE ON stones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 実行後、初期データ投入.sqlを実行してください