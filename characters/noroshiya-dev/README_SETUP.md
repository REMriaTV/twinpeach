# 狼煙屋データベースセットアップ手順

## 1. Supabaseで`noroshiya_characters`テーブルを作成

1. Supabaseダッシュボードにログイン
2. SQL Editorに移動
3. `noroshiya-characters-schema.sql`の内容を実行

## 2. 初期データの確認

スキーマには「ピヨマル」の初期データが含まれています。

## 3. 河原ページとの連携確認

河原ページ（`river-login-hiuchiishi.html`）は以下の流れで動作します：

1. ユーザーが石の特徴を入力（例：「赤くて丸い石」）
2. `noroshiya_characters`テーブルから全狼煙屋データを取得
3. 各狼煙屋の`matching_keywords`とユーザー入力を比較
4. 最もマッチ度の高い狼煙屋を選択
5. その狼煙屋のセリフ（`dialogues`）を表示

## 4. マッチングキーワードの設定例

- ピヨマル：「小さい, キラキラ, 透明, 朝」
- カラスケ：「黒い, 大きい, ゴツゴツ, 夜」
- フクロウジ：「茶色, 丸い, 滑らか, 夕方」

## 5. トラブルシューティング

### テーブルが見つからないエラー
- Supabaseでテーブルが作成されているか確認
- RLS（Row Level Security）が有効な場合は、適切なポリシーを設定

### マッチングがうまくいかない
- `matching_keywords`フィールドに適切なキーワードが設定されているか確認
- カンマ区切りで複数のキーワードを設定可能

## 6. データ編集

狼煙屋データの編集は`noroshiya-dev/index.html`から行えます：
https://remriatv.github.io/twinpeach/characters/noroshiya-dev/