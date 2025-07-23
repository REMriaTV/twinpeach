-- 既存のテーブルを削除してから作成（注意：データが消えます）
DROP TABLE IF EXISTS birds CASCADE;
DROP TABLE IF EXISTS stones CASCADE;

-- 鳥マスターデータテーブル
CREATE TABLE birds (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(200),
    size VARCHAR(50),
    habitat VARCHAR(200),
    characteristics TEXT,
    behavior TEXT,
    call_description TEXT,
    symbolism TEXT,
    season VARCHAR(100),
    rarity VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 石マスターデータテーブル
CREATE TABLE stones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    colors JSONB, -- {"primary": "赤い", "secondary": "オレンジ", "pattern": "縞模様"}
    hardness NUMERIC(3,1), -- モース硬度
    size_range VARCHAR(100),
    texture VARCHAR(100),
    transparency VARCHAR(50),
    special_features TEXT,
    found_locations TEXT,
    rarity VARCHAR(50),
    is_hiuchiishi BOOLEAN DEFAULT true, -- 火打石として使えるか
    ng_keywords TEXT[], -- この石を除外するキーワード（柔らかい、ザラザラなど）
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- サンプル鳥データ
INSERT INTO birds (id, name, scientific_name, size, habitat, characteristics, behavior, call_description, symbolism, season, rarity) VALUES
('bird_001', 'スズメ', 'Passer montanus', '約14cm', '人里、公園、農地', '茶色の羽毛に白い頬、小柄で丸い体型', '群れで行動、地面で跳ねながら餌を探す', 'チュンチュン', '親しみやすさ、日常', '通年', 'common'),
('bird_002', 'カラス', 'Corvus macrorhynchos', '約50cm', '都市部、森林', '全身黒い羽毛、大型で知能が高い', '雑食性、道具を使う、社会性が高い', 'カーカー', '知恵、メッセンジャー', '通年', 'common'),
('bird_003', 'メジロ', 'Zosterops japonicus', '約12cm', '林、公園、庭園', '黄緑色の体に白いアイリング', '花の蜜を好む、つがいや小群で行動', 'チーチー', '春の訪れ、幸運', '通年', 'common'),
('bird_004', 'ハト', 'Columba livia', '約33cm', '都市部、公園', '灰色の体に虹色の首筋', '地面を歩いて餌を探す、人に慣れやすい', 'クルックー', '平和、メッセージ', '通年', 'common'),
('bird_005', 'フクロウ', 'Strix uralensis', '約50cm', '森林、山地', '褐色の羽毛、大きな目、夜行性', '音もなく飛ぶ、ネズミなどを捕食', 'ホーホー', '知恵、守護', '通年', 'uncommon');

-- サンプル石データ
INSERT INTO stones (id, name, type, colors, hardness, size_range, texture, transparency, special_features, found_locations, rarity, is_hiuchiishi, ng_keywords) VALUES
('stone_001', '赤チャート', 'チャート', '{"primary": "赤い", "secondary": "茶色い", "pattern": "縞模様"}'::jsonb, 7.0, '親指大〜握りこぶし大', 'ツルツル', '不透明', '鉄分により赤く染まっている', '河原、山地', 'common', true, ARRAY[]::TEXT[]),
('stone_002', '透明石英', '石英', '{"primary": "透明", "secondary": "白い", "pattern": "無地"}'::jsonb, 7.0, 'ビー玉大〜卵大', 'ツルツル', '透明〜半透明', 'ガラスのような透明感', '河原、鉱山跡', 'uncommon', true, ARRAY[]::TEXT[]),
('stone_003', '黒曜石', '火山ガラス', '{"primary": "黒い", "secondary": null, "pattern": "無地"}'::jsonb, 5.5, '小石〜手のひら大', 'ツルツル', '半透明〜不透明', '割ると鋭い刃物になる', '火山地帯', 'rare', true, ARRAY[]::TEXT[]),
('stone_004', 'ジャスパー', 'ジャスパー', '{"primary": "緑", "secondary": "黄色い", "pattern": "まだら"}'::jsonb, 7.0, '小石〜卵大', 'ツルツル', '不透明', '複雑な模様が特徴', '河原、海岸', 'uncommon', true, ARRAY[]::TEXT[]),
('stone_005', '青い玉髄', '玉髄', '{"primary": "青い", "secondary": "白い", "pattern": "帯状"}'::jsonb, 7.0, 'ビー玉大〜ピンポン玉大', 'ツルツル', '半透明', '内部に美しい縞模様', '河原、海岸', 'rare', true, ARRAY[]::TEXT[]),
('stone_006', '砂岩', '堆積岩', '{"primary": "茶色い", "secondary": "黄色い", "pattern": "粒状"}'::jsonb, 4.0, '様々', 'ザラザラ', '不透明', '砂が固まってできた石', '河原、崖', 'common', false, ARRAY['ザラザラ', '柔らかい']::TEXT[]),
('stone_007', '石灰岩', '堆積岩', '{"primary": "白い", "secondary": "灰色", "pattern": "無地"}'::jsonb, 3.0, '様々', 'ザラザラ', '不透明', '貝殻などが固まってできた', '海岸、山地', 'common', false, ARRAY['柔らかい', 'もろい']::TEXT[]);

-- インデックスの作成
CREATE INDEX idx_birds_rarity ON birds(rarity);
CREATE INDEX idx_stones_rarity ON stones(rarity);
CREATE INDEX idx_stones_hiuchiishi ON stones(is_hiuchiishi);
CREATE INDEX idx_stones_colors ON stones USING GIN (colors);