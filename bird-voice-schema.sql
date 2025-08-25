-- 鳥の音声録音データを管理するテーブル
CREATE TABLE IF NOT EXISTS bird_recordings (
    id SERIAL PRIMARY KEY,
    bird_id VARCHAR(50) NOT NULL REFERENCES birds(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL, -- 例：朝の鳴き声、警戒時の鳴き声
    audio_url TEXT, -- Supabase Storageや外部URLへのパス
    duration VARCHAR(20), -- 例：0:12
    call_text VARCHAR(100), -- 例：ホーホケキョ、チュンチュン
    recording_date DATE,
    location VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_bird_recordings_bird_id ON bird_recordings(bird_id);

-- 既存のbirdsテーブルに音声関連フィールドを追加（オプション）
ALTER TABLE birds ADD COLUMN IF NOT EXISTS primary_call_text VARCHAR(100); -- 主な鳴き声の文字表現
ALTER TABLE birds ADD COLUMN IF NOT EXISTS voice_description TEXT; -- 鳴き声の詳細説明

-- サンプルデータ
INSERT INTO bird_recordings (bird_id, description, call_text, duration) VALUES
('bird_001', '朝の鳴き声', 'チュンチュン', '0:12'),
('bird_001', '群れでの会話', 'チュチュチュン', '0:08'),
('bird_002', '通常の鳴き声', 'カーカー', '0:10'),
('bird_002', '警戒時の鳴き声', 'ガーガー', '0:06'),
('bird_003', '求愛の鳴き声', 'チーチー', '0:15'),
('bird_004', '朝の鳴き声', 'クルックー', '0:20'),
('bird_005', '夜の鳴き声', 'ホーホー', '0:25');

-- 鳴き声の文字表現を更新
UPDATE birds SET primary_call_text = 'チュンチュン' WHERE id = 'bird_001';
UPDATE birds SET primary_call_text = 'カーカー' WHERE id = 'bird_002';
UPDATE birds SET primary_call_text = 'チーチー' WHERE id = 'bird_003';
UPDATE birds SET primary_call_text = 'クルックー' WHERE id = 'bird_004';
UPDATE birds SET primary_call_text = 'ホーホー' WHERE id = 'bird_005';