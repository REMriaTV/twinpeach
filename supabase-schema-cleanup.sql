-- 不要なカラムを削除（もし存在していれば）
ALTER TABLE stones DROP COLUMN IF EXISTS found_locations;
ALTER TABLE stones DROP COLUMN IF EXISTS rarity;
ALTER TABLE stones DROP COLUMN IF EXISTS ng_keywords;

-- special_featuresカラムは既に存在しているので、そのまま使用
-- 管理画面では「特徴」として表示