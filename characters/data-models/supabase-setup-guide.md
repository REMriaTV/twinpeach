# Supabaseテーブル作成ガイド

## 手順

1. **Supabaseダッシュボードにログイン**
   - https://app.supabase.com/
   - プロジェクト: roaucowddadmvxgzrvnu

2. **SQL Editorを開く**
   - 左メニューの「SQL Editor」をクリック

3. **SQLを実行**
   - `supabase-schema.sql`の内容をコピー
   - SQL Editorに貼り付けて「Run」をクリック

## テーブル作成SQL（簡易版）

もし`supabase-schema.sql`が長すぎる場合は、以下の簡易版を使用：

```sql
-- 鳥マスターテーブル（簡易版）
CREATE TABLE IF NOT EXISTS birds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    family TEXT,
    size TEXT,
    habitat TEXT,
    appearance TEXT,
    voice TEXT,
    behavior TEXT,
    activity TEXT,
    diet TEXT,
    social_behavior TEXT,
    nesting_habits TEXT,
    personality_general TEXT,
    human_interaction TEXT,
    intelligence TEXT,
    seasonal_spring TEXT,
    seasonal_summer TEXT,
    seasonal_autumn TEXT,
    seasonal_winter TEXT,
    symbolism_cultural TEXT,
    symbolism_spiritual TEXT,
    noroshiya_suitable_types TEXT[],
    noroshiya_smoking_style TEXT,
    noroshiya_communication_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 石マスターテーブル（簡易版）
CREATE TABLE IF NOT EXISTS stones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    colors TEXT[],
    size TEXT,
    shape TEXT,
    texture TEXT,
    origin TEXT,
    rarity TEXT,
    appearance TEXT,
    weight TEXT,
    hardness TEXT,
    special_features TEXT,
    elemental_element TEXT,
    elemental_energy TEXT,
    elemental_resonance TEXT,
    finding_locations JSONB,
    matching_keywords TEXT[],
    noroshiya_primary_match TEXT,
    noroshiya_match_reason TEXT,
    noroshiya_special_reaction TEXT,
    folklore_legend TEXT,
    folklore_usage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 初期データの投入

テーブル作成後、管理画面から手動でデータを追加するか、以下のようなINSERT文を使用：

```sql
-- サンプル：スズメのデータ
INSERT INTO birds (
    id, name, scientific_name, family, size, habitat,
    noroshiya_suitable_types
) VALUES (
    'bird_001', 
    'スズメ', 
    'Passer montanus', 
    'スズメ科', 
    '小型', 
    '市街地、農村、森林の周辺',
    ARRAY['好奇心旺盛でピュアタイプ']
);
```

## 確認方法

1. Supabaseダッシュボードで「Table Editor」を開く
2. `birds`と`stones`テーブルが表示されることを確認
3. 管理画面（admin.html）をリロード
4. 「✅ クラウド保存モード」と表示されれば成功

## トラブルシューティング

- **権限エラーが出る場合**
  - SettingsのAPI → Service roleキーを確認
  - RLS（Row Level Security）が有効な場合は一時的に無効化

- **テーブルが見つからない場合**
  - スキーマが`public`であることを確認
  - SQL実行時にエラーがないか確認