-- 狼煙屋キャラクターテーブル
-- 鳥をモチーフにした狼煙屋のキャラクター情報を管理
-- 2025-07-22作成

CREATE TABLE IF NOT EXISTS noroshiya_characters (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL, -- 狼煙屋の名前（例：ピヨマル）
    type TEXT, -- タイプ（例：好奇心旺盛でピュアタイプ）
    bird_type TEXT, -- モチーフとなった鳥の種類（例：スズメ）
    
    -- 基本情報
    appearance TEXT, -- 外見
    personality TEXT, -- 性格
    catchphrase TEXT, -- 口癖（カタカナ）
    background TEXT, -- 背景ストーリー
    noroshi_place TEXT, -- 狼煙場の場所
    special_skill TEXT, -- 特技
    description TEXT, -- 説明
    
    -- セリフパターン（JSON形式）
    dialogues JSONB DEFAULT '{"hiuchiishi": {}, "chat": {}}',
    -- 例: {
    --   "hiuchiishi": {
    --     "初回出会い時": "オッ！キレイナイシダネ！ボクト トモダチニナロウ！",
    --     "再会時": "マタアエタネ！キョウモ ガンバロウ！"
    --   },
    --   "chat": {
    --     "メッセージ送信時": "ヨシ！チャントトドケルヨ！",
    --     "返信受信時": "ヘンジガキタヨ！ミテミテ！"
    --   }
    -- }
    
    -- 振る舞い設定（JSON形式）
    behavior JSONB DEFAULT '{}',
    -- 例: {
    --   "activeStartTime": "06:00",
    --   "activeEndTime": "18:00",
    --   "inactiveBehavior": "巣で丸くなって寝ている",
    --   "smokeCharacteristics": "白くてふわふわ、朝露のような清々しい香り",
    --   "smokeSpeed": "normal"
    -- }
    
    -- 火打石との相性（JSON配列形式）
    stone_affinities JSONB DEFAULT '[]',
    -- 例: [
    --   {
    --     "stoneId": "morning-dew",
    --     "stoneName": "朝露の石",
    --     "affinityScore": 90,
    --     "specialDialogue": "ワァ！アサツユノイシダ！ボクノダイスキナイシ！"
    --   }
    -- ]
    
    -- マッチングキーワード（石の特徴から狼煙屋を選ぶためのキーワード）
    matching_keywords TEXT, -- カンマ区切り（例：小さい, キラキラ, 透明, 朝）
    
    -- 開発用
    dev_notes TEXT, -- 開発メモ
    change_history JSONB DEFAULT '[]', -- 変更履歴
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 更新時刻を自動更新するトリガー
CREATE TRIGGER update_noroshiya_characters_updated_at 
BEFORE UPDATE ON noroshiya_characters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_noroshiya_name ON noroshiya_characters(name);
CREATE INDEX IF NOT EXISTS idx_noroshiya_bird_type ON noroshiya_characters(bird_type);
CREATE INDEX IF NOT EXISTS idx_noroshiya_matching_keywords ON noroshiya_characters(matching_keywords);

-- 初期データの例（ピヨマル）
INSERT INTO noroshiya_characters (
    name, type, bird_type, appearance, personality, catchphrase,
    background, noroshi_place, special_skill, description,
    dialogues, behavior, stone_affinities, matching_keywords
) VALUES (
    'ピヨマル',
    '好奇心旺盛でピュアタイプ',
    'スズメ',
    '小柄で丸みを帯びた体型、茶色の羽毛に白い斑点',
    '好奇心旺盛で素直、新しいものに興味津々',
    'ピヨピヨ！ナニソレ、オモシロソウ！',
    '街の屋根裏で生まれ、人間の生活に興味を持って狼煙屋になった',
    '東の丘の頂上',
    '朝一番に起きて誰よりも早く狼煙を上げる',
    'いつも元気いっぱいで、新しいメッセージが来るとピヨピヨと飛び跳ねる',
    '{
        "hiuchiishi": {
            "初回出会い時": "オッ！キレイナイシダネ！ボクト トモダチニナロウ！",
            "再会時": "マタアエタネ！キョウモ ガンバロウ！"
        },
        "chat": {
            "メッセージ送信時": "ヨシ！チャントトドケルヨ！",
            "返信受信時": "ヘンジガキタヨ！ミテミテ！"
        }
    }'::jsonb,
    '{
        "activeStartTime": "06:00",
        "activeEndTime": "18:00",
        "inactiveBehavior": "巣で丸くなって寝ている",
        "smokeCharacteristics": "白くてふわふわ、朝露のような清々しい香り",
        "smokeSpeed": "normal"
    }'::jsonb,
    '[{
        "stoneId": "morning-dew",
        "stoneName": "朝露の石",
        "affinityScore": 90,
        "specialDialogue": "ワァ！アサツユノイシダ！ボクノダイスキナイシ！"
    }]'::jsonb,
    '小さい, キラキラ, 透明, 朝'
) ON CONFLICT DO NOTHING;