-- 狼煙屋キャラクターテーブル（改訂版）
-- 日本の伝統色で識別される、かつて子供だった魂たち
-- 2025-07-22作成

-- 既存テーブルを削除（必要に応じて）
-- DROP TABLE IF EXISTS noroshiya_characters;

CREATE TABLE IF NOT EXISTS noroshiya_characters (
    -- 基本識別情報
    id TEXT PRIMARY KEY, -- noroshiya_001, noroshiya_002...
    color_name TEXT NOT NULL, -- 灰汁色、樺茶色、黄唐茶色など
    color_code TEXT NOT NULL, -- #9e9478, #726250, #b98c46など
    
    -- 外見的特徴
    pattern_type TEXT, -- 縞々、ドット、無地、格子など
    appearance_notes TEXT, -- その他の見た目の特徴
    
    -- 性格・話し方
    personality TEXT, -- おしゃべりの特徴、性格
    speech_style TEXT, -- 話し方の特徴（元気、ゆったり、早口など）
    favorite_topics TEXT[], -- 好きな話題
    
    -- 得意分野
    message_types TEXT[], -- 得意なメッセージタイプ（恋文、ダベリ、訴求、親友、家族）
    emotional_range TEXT, -- 得意な感情の幅（明るい、しんみり、励まし等）
    
    -- セリフパターン（JSON形式）
    dialogues JSONB DEFAULT '{"hiuchiishi": {}, "chat": {}}',
    -- 例: {
    --   "hiuchiishi": {
    --     "初回出会い時": "アラ、イイ石ミツケタネ！ワタシニピッタリ！",
    --     "再会時": "マタアエタ！キョウハドンナハナシ？"
    --   },
    --   "chat": {
    --     "メッセージ送信時": "ソノキモチ、チャントトドケルヨ",
    --     "返信受信時": "ヘンジキタ！ヨカッタネ！"
    --   }
    -- }
    
    -- 火打石マッチング設定
    stone_color_affinities TEXT[], -- 好む石の色（赤い、透明、黒い、白い、青い等）
    matching_keywords TEXT[], -- その他のマッチングキーワード
    affinity_notes TEXT, -- なぜその色の石を好むのか（任意）
    
    -- 背景設定（任意）
    backstory TEXT, -- 戦国時代の記憶、どんな子供だったか
    
    -- システム用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 更新時刻を自動更新するトリガー
CREATE TRIGGER update_noroshiya_characters_updated_at 
BEFORE UPDATE ON noroshiya_characters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_noroshiya_color_code ON noroshiya_characters(color_code);
CREATE INDEX IF NOT EXISTS idx_noroshiya_stone_affinities ON noroshiya_characters USING GIN (stone_color_affinities);
CREATE INDEX IF NOT EXISTS idx_noroshiya_keywords ON noroshiya_characters USING GIN (matching_keywords);

-- サンプルデータ（灰汁色の狼煙屋）
INSERT INTO noroshiya_characters (
    id, color_name, color_code, pattern_type, personality, speech_style,
    favorite_topics, message_types, emotional_range, dialogues,
    stone_color_affinities, matching_keywords, affinity_notes
) VALUES (
    'noroshiya_001',
    '灰汁色',
    '#9e9478',
    '無地',
    '穏やかで聞き上手、相手の話をじっくり聞いてから返事をする',
    'ゆったりとした口調、相手を包み込むような優しい話し方',
    ARRAY['日常の小さな幸せ', '季節の移ろい', '懐かしい思い出'],
    ARRAY['親友', '家族', 'しんみり'],
    '優しい、包容力、共感',
    '{
        "hiuchiishi": {
            "初回出会い時": "アラ、キレイナ石。アナタノ話、聞カセテクレル？",
            "再会時": "マタ会エタネ。今日ハドンナ気持チ？"
        },
        "chat": {
            "メッセージ送信時": "大丈夫、キット届クヨ。ユックリ待トウ",
            "返信受信時": "ホラ、返事ガ来タ。ヨカッタネ"
        }
    }'::jsonb,
    ARRAY['透明', '白い', '薄い'],
    ARRAY['優しい', '柔らかい', '朝露', '静か'],
    '透明な石の純粋さが、素直に話を聞く自分と重なるから'
), (
    'noroshiya_002',
    '樺茶色',
    '#726250',
    '縞々',
    '活発で明るい、話し始めると止まらないタイプ',
    '早口で元気、感情豊かな話し方',
    ARRAY['面白い出来事', '新しい発見', '友達の話'],
    ARRAY['ダベリ', '親友', '元気づけ'],
    '明るい、楽観的、励まし',
    '{
        "hiuchiishi": {
            "初回出会い時": "オオッ！ソノ石スゴイ！一緒ニ話ソウ話ソウ！",
            "再会時": "ヤッタ！マタ会エタ！今日モ楽シモウ！"
        },
        "chat": {
            "メッセージ送信時": "任セテ！スグ届ケルカラ！",
            "返信受信時": "キタキタ！返事ダヨ！"
        }
    }'::jsonb,
    ARRAY['赤い', '茶色い', 'オレンジ'],
    ARRAY['元気', '温かい', '夕焼け', '活発'],
    '赤い石の情熱的なエネルギーが自分の元気さと合うから'
) ON CONFLICT DO NOTHING;