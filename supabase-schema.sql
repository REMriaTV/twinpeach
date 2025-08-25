-- 既存のstonesテーブルに位置情報カラムを追加
ALTER TABLE stones ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE stones ADD COLUMN IF NOT EXISTS prefecture TEXT;
ALTER TABLE stones ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE stones ADD COLUMN IF NOT EXISTS location_tag TEXT CHECK (location_tag IN ('川・河原', '海岸', '山・その他'));
ALTER TABLE stones ADD COLUMN IF NOT EXISTS location_detail TEXT;
ALTER TABLE stones ADD COLUMN IF NOT EXISTS location_notes TEXT;
ALTER TABLE stones ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE stones ADD COLUMN IF NOT EXISTS map_url TEXT;
ALTER TABLE stones ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 7);
ALTER TABLE stones ADD COLUMN IF NOT EXISTS lng DECIMAL(10, 7);
ALTER TABLE stones ADD COLUMN IF NOT EXISTS collected_date DATE;
ALTER TABLE stones ADD COLUMN IF NOT EXISTS image_url TEXT;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_stones_prefecture ON stones(prefecture);
CREATE INDEX IF NOT EXISTS idx_stones_location_tag ON stones(location_tag);
CREATE INDEX IF NOT EXISTS idx_stones_lat_lng ON stones(lat, lng);

-- サンプルデータ更新（既存の石データに位置情報を追加）
UPDATE stones SET
    location_name = '日野川（下流）',
    prefecture = '鳥取県',
    city = '西伯郡',
    location_tag = '川・河原',
    location_detail = '下流',
    location_notes = '中洲',
    address = '鳥取県西伯郡伯耆町吉長３７−３',
    lat = 35.3439,
    lng = 133.4039
WHERE id = 'stone_001';

UPDATE stones SET
    location_name = '津嶋神社',
    prefecture = '香川県',
    city = '三豊市',
    location_tag = '海岸',
    location_detail = '砂浜',
    address = '香川県三豊市三野町大見６８１６−２',
    lat = 34.1753,
    lng = 133.7267
WHERE id = 'stone_005';