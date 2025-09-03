-- saved_locationsテーブルの作成
CREATE TABLE saved_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255),
    prefecture VARCHAR(50),
    city VARCHAR(100),
    location_tag VARCHAR(50),
    location_detail VARCHAR(100),
    location_notes TEXT,
    address TEXT,
    map_url TEXT,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- インデックスの作成
CREATE INDEX idx_saved_locations_prefecture ON saved_locations(prefecture);
CREATE INDEX idx_saved_locations_name ON saved_locations(name);

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_locations_updated_at BEFORE UPDATE ON saved_locations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();