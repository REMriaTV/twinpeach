-- Supabase用のテーブル作成SQL
-- 狼煙屋キャラクター管理用

-- キャラクターテーブル
CREATE TABLE noroshiya_characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(200) NOT NULL,
    bird_type VARCHAR(100) NOT NULL,
    appearance TEXT NOT NULL,
    personality TEXT NOT NULL,
    catchphrase VARCHAR(500) NOT NULL,
    background TEXT NOT NULL,
    noroshi_place VARCHAR(200) NOT NULL,
    special_skill TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 編集履歴テーブル
CREATE TABLE character_edit_history (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES noroshiya_characters(id),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    edited_at TIMESTAMP DEFAULT NOW(),
    edited_by VARCHAR(100) -- 将来的にユーザー管理を追加する場合
);

-- 初期データの挿入
INSERT INTO noroshiya_characters (name, type, bird_type, appearance, personality, catchphrase, background, noroshi_place, special_skill, description) VALUES
('ピヨマル', '好奇心旺盛でピュアタイプ', 'スズメ', '小柄で丸みを帯びた体型、茶色の羽毛に白い斑点', '好奇心旺盛で素直、新しいものに興味津々', 'ピヨピヨ！ナニソレ、オモシロソウ！', '街の屋根裏で生まれ、人間の生活に興味を持って狼煙屋になった', '東の丘の頂上', '朝一番に起きて誰よりも早く狼煙を上げる', 'いつも元気いっぱいで、新しいメッセージが来るとピヨピヨと飛び跳ねる'),
('フクロウジ', '心配性の少しオタクタイプ', 'フクロウ', '丸い大きな目、グレーの羽毛、眼鏡をかけている', '慎重で心配性、でも知識豊富で頼りになる', 'ホーホー、ダイジョウブカナ？モウイッカイカクニンシヨウ', '古い図書館で育ち、本から得た知識で狼煙の技術を習得', '西の森の大木の上', '夜でも正確に狼煙を読み取れる夜目', 'メッセージを何度も確認してから送る慎重派、でも一度信頼すると献身的'),
('カラスケ', 'ちょっとめんどくさいけど愛着の湧くタイプ', 'カラス', '黒い羽毛、少し大きめの体格、片目をウインクすることが多い', 'ひねくれ者だけど実は優しい、ツンデレ気質', 'カーカー、ベツニアンタノタメジャナイカラネ', '都会で生まれ育ち、人間に対して複雑な感情を持ちながら狼煙屋に', '北の廃墟の塔', '暗号化した狼煙を送れる（本人曰く「プライバシー重視」）', '文句を言いながらも誰よりも早くメッセージを届けてくれる'),
('ハトポッポ', 'のんびり屋でマイペースタイプ', 'ハト', '白と灰色の羽毛、ぽっちゃり体型、いつも眠そうな目', 'のんびり屋で平和主義、争いを好まない', 'ポッポー、マァマァ、ユックリイコウヨ', '公園で平和に暮らしていたが、人々をつなぐ仕事に魅力を感じて狼煙屋に', '南の広場の噴水近く', 'どんなに急いでいる人も落ち着かせる癒しの狼煙', 'ゆっくりだけど確実にメッセージを届ける、みんなの癒し系'),
('ツバクロウ', 'スピード重視のせっかちタイプ', 'ツバメ', 'スリムな体型、紺色の羽毛に白い腹部、長い尾羽', 'せっかちでスピード重視、効率を何より大切にする', 'ピューッ！ハヤクハヤク、ジカンガモッタイナイ！', '渡り鳥として世界中を旅し、最速の通信手段として狼煙屋になることを決意', '風の通り道になっている峡谷', 'どんな天候でも最速で狼煙を届ける', 'とにかく速い！でも時々速すぎて狼煙が読みにくいことも');

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_noroshiya_characters_updated_at BEFORE UPDATE
    ON noroshiya_characters FOR EACH ROW EXECUTE PROCEDURE 
    update_updated_at_column();