-- 火打石データベース設計
-- 狼煙屋との出会いをつなぐ石の管理

-- 火打石テーブル
CREATE TABLE hiuchiishi_stones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 石の名前（例：朝露の石、夕焼け石など）
    color_primary VARCHAR(50) NOT NULL, -- 主な色
    color_secondary VARCHAR(50), -- 副次的な色
    size VARCHAR(50) NOT NULL, -- 大きさ（手のひらサイズ、親指大など）
    shape VARCHAR(100) NOT NULL, -- 形状（丸い、角ばった、平たいなど）
    texture VARCHAR(100), -- 質感（ツルツル、ザラザラ、キラキラなど）
    special_features TEXT, -- 特別な特徴（模様、光り方など）
    rarity VARCHAR(20) DEFAULT 'common', -- レア度（common, uncommon, rare, legendary）
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 狼煙屋と火打石の相性テーブル
CREATE TABLE noroshiya_stone_affinity (
    id SERIAL PRIMARY KEY,
    noroshiya_id INTEGER REFERENCES noroshiya_characters(id),
    stone_id INTEGER REFERENCES hiuchiishi_stones(id),
    affinity_score INTEGER DEFAULT 50, -- 相性スコア（0-100）
    trigger_keywords TEXT[], -- この石で出会うためのキーワード
    special_dialogue TEXT, -- この石で出会った時の特別なセリフ
    created_at TIMESTAMP DEFAULT NOW()
);

-- ユーザーの火打石履歴
CREATE TABLE user_stone_history (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL, -- セッションID（localStorage等で管理）
    stone_description TEXT NOT NULL, -- ユーザーが入力した石の説明
    matched_stone_id INTEGER REFERENCES hiuchiishi_stones(id),
    matched_noroshiya_id INTEGER REFERENCES noroshiya_characters(id),
    picked_at TIMESTAMP DEFAULT NOW()
);

-- 初期データ：基本的な火打石
INSERT INTO hiuchiishi_stones (name, color_primary, color_secondary, size, shape, texture, special_features, rarity) VALUES
('朝露の石', '透明', '白', '親指大', '丸い', 'ツルツル', '朝の光を受けるとキラキラ光る', 'common'),
('夕焼け石', 'オレンジ', '赤', '手のひらサイズ', '平たい', 'ザラザラ', '夕方になると温かくなる', 'uncommon'),
('月光石', '白', '青', 'ビー玉大', '球形', 'ツルツル', '夜になるとほのかに光る', 'rare'),
('川底石', '灰色', '黒', '握りこぶし大', '角ばった', 'ツルツル', '水に濡れると模様が浮かぶ', 'common'),
('虹色石', '虹色', NULL, '小石サイズ', '不規則', 'キラキラ', '見る角度で色が変わる', 'legendary');

-- 狼煙屋と石の相性設定（例）
INSERT INTO noroshiya_stone_affinity (noroshiya_id, stone_id, affinity_score, trigger_keywords, special_dialogue) VALUES
(1, 1, 90, ARRAY['透明', '朝', 'キラキラ', '小さい'], 'ワァ！アサツユノイシダ！ボクノダイスキナイシ！'), -- ピヨマル×朝露の石
(2, 4, 85, ARRAY['灰色', '地味', '大きい', '重い'], 'ホーホー、シブイイシヲエランダネ。キミトハウマガアイソウダ'), -- フクロウジ×川底石
(3, 2, 80, ARRAY['オレンジ', '夕方', '温かい'], 'フン、ユウヤケイシカ。マァ、ワルクナイセンスダナ'), -- カラスケ×夕焼け石
(4, 1, 75, ARRAY['透明', '綺麗', '小さい'], 'ポッポー、キレイナイシダネ。ユックリナガメヨウ'), -- ハトポッポ×朝露の石
(5, 3, 95, ARRAY['白', '光る', '速い', '球'], 'ピューッ！ゲッコウセキ！コレナラハヤクトドケラレル！'); -- ツバクロウ×月光石

-- 更新時刻を自動更新するトリガー（火打石テーブル用）
CREATE TRIGGER update_hiuchiishi_stones_updated_at BEFORE UPDATE
    ON hiuchiishi_stones FOR EACH ROW EXECUTE PROCEDURE 
    update_updated_at_column();