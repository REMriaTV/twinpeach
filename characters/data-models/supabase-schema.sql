-- 鳥マスターテーブル
CREATE TABLE IF NOT EXISTS birds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    family TEXT,
    size TEXT,
    habitat TEXT,
    
    -- 特徴
    appearance TEXT,
    voice TEXT,
    behavior TEXT,
    
    -- 生態
    activity TEXT,
    diet TEXT,
    social_behavior TEXT,
    nesting_habits TEXT,
    
    -- 性格
    personality_general TEXT,
    human_interaction TEXT,
    intelligence TEXT,
    
    -- 季節行動
    seasonal_spring TEXT,
    seasonal_summer TEXT,
    seasonal_autumn TEXT,
    seasonal_winter TEXT,
    
    -- 象徴性
    symbolism_cultural TEXT,
    symbolism_spiritual TEXT,
    
    -- 狼煙屋特性
    noroshiya_suitable_types TEXT[], -- 配列として保存
    noroshiya_smoking_style TEXT,
    noroshiya_communication_style TEXT,
    
    -- 録音データ（Storage URL）
    recording_urls JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 石マスターテーブル
CREATE TABLE IF NOT EXISTS stones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    colors TEXT[], -- 配列として保存
    size TEXT,
    shape TEXT,
    texture TEXT,
    origin TEXT,
    rarity TEXT,
    
    -- 特徴
    appearance TEXT,
    weight TEXT,
    hardness TEXT,
    special_features TEXT,
    
    -- 元素的性質
    elemental_element TEXT,
    elemental_energy TEXT,
    elemental_resonance TEXT,
    
    -- 発見場所（JSON形式で保存）
    finding_locations JSONB,
    
    -- マッチングキーワード（配列）
    matching_keywords TEXT[],
    
    -- 狼煙屋との相性
    noroshiya_primary_match TEXT,
    noroshiya_match_reason TEXT,
    noroshiya_special_reaction TEXT,
    
    -- 伝承
    folklore_legend TEXT,
    folklore_usage TEXT,
    
    -- 写真データ（Storage URL）
    photo_urls JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 更新時刻を自動更新するトリガー
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

-- 既存のテーブルに新しいカラムを追加（2025-07-17）
-- 録音URL用カラムを追加
ALTER TABLE birds ADD COLUMN IF NOT EXISTS recording_urls JSONB;

-- 写真URL用カラムを追加
ALTER TABLE stones ADD COLUMN IF NOT EXISTS photo_urls JSONB;

-- 初期データを挿入（必要に応じて実行）
-- ここに初期データのINSERT文を追加