-- 既存のbirdsテーブルの構造を確認
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'birds'
ORDER BY ordinal_position;

-- 既存のstonesテーブルの構造を確認
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'stones'
ORDER BY ordinal_position;