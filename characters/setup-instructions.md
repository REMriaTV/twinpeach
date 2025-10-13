# Supabase APIキー設定手順

## APIキーの設定方法

1. `supabase-integration.js` ファイルを開く
2. 6行目の `YOUR_SUPABASE_ANON_KEY` を取得したanon keyに置き換える
3. ファイルを保存

## 例：
```javascript
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 実際のキーに置き換え
```

## セキュリティに関する注意
- APIキーは公開リポジトリにコミットしないでください
- 本番環境では環境変数を使用することを推奨します

## 動作確認
1. ブラウザで `index.html` を開く
2. 開発者ツールのコンソールでエラーがないか確認
3. キャラクターの編集を試して、Supabaseに保存されることを確認

## Supabaseでデータを確認
1. Supabaseダッシュボードの「Table Editor」を開く
2. `noroshiya_characters` テーブルを選択
3. データが表示されることを確認