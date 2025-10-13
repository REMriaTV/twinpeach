-- 既存のnoroshiya_charactersテーブルに新しいカラムを追加
-- 火打石設定と開発用情報を含める

-- 新しいカラムを追加（既に存在する場合はエラーになるので注意）
ALTER TABLE noroshiya_characters 
ADD COLUMN IF NOT EXISTS stone_affinities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS matching_keywords TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS dialogues JSONB DEFAULT '{"hiuchiishi": {}, "chat": {}}',
ADD COLUMN IF NOT EXISTS behavior JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dev_notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS change_history JSONB DEFAULT '[]';

-- 既存データに初期値を設定
UPDATE noroshiya_characters 
SET 
    stone_affinities = CASE 
        WHEN name = 'ピヨマル' THEN '[{"stoneId": "morning-dew", "stoneName": "朝露の石", "affinityScore": 90, "specialDialogue": "ワァ！アサツユノイシダ！ボクノダイスキナイシ！"}]'::jsonb
        WHEN name = 'フクロウジ' THEN '[{"stoneId": "riverbed", "stoneName": "川底石", "affinityScore": 85, "specialDialogue": "ホーホー、シブイイシヲエランダネ。キミトハウマガアイソウダ"}]'::jsonb
        WHEN name = 'カラスケ' THEN '[{"stoneId": "sunset", "stoneName": "夕焼け石", "affinityScore": 80, "specialDialogue": "フン、ユウヤケイシカ。マァ、ワルクナイセンスダナ"}]'::jsonb
        WHEN name = 'ハトポッポ' THEN '[{"stoneId": "morning-dew", "stoneName": "朝露の石", "affinityScore": 75, "specialDialogue": "ポッポー、キレイナイシダネ。ユックリナガメヨウ"}]'::jsonb
        WHEN name = 'ツバクロウ' THEN '[{"stoneId": "moonlight", "stoneName": "月光石", "affinityScore": 95, "specialDialogue": "ピューッ！ゲッコウセキ！コレナラハヤクトドケラレル！"}]'::jsonb
        ELSE '[]'::jsonb
    END,
    matching_keywords = CASE
        WHEN name = 'ピヨマル' THEN '小さい, キラキラ, 透明, 朝'
        WHEN name = 'フクロウジ' THEN '灰色, 地味, 大きい, 重い'
        WHEN name = 'カラスケ' THEN 'オレンジ, 夕方, 温かい'
        WHEN name = 'ハトポッポ' THEN '透明, 綺麗, 小さい'
        WHEN name = 'ツバクロウ' THEN '白, 光る, 速い, 球'
        ELSE ''
    END,
    dialogues = '{"hiuchiishi": {"初回出会い時": "", "再会時": ""}, "chat": {"メッセージ送信時": "", "返信受信時": ""}}'::jsonb,
    behavior = '{"activeStartTime": "06:00", "activeEndTime": "18:00", "inactiveBehavior": "", "smokeCharacteristics": "", "smokeSpeed": "normal"}'::jsonb
WHERE stone_affinities = '[]'::jsonb;