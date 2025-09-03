# 採取ポイント機能 - LocalStorageからSupabase移行ガイド

## 概要
採取ポイント（saved locations）機能をlocalStorageからSupabaseに移行しました。
これにより、デバイス間でのデータ共有と永続的な保存が可能になります。

## 実装した変更内容

### 1. Supabaseテーブルの作成
`saved_locations`テーブルを作成する必要があります。

SQLファイル: `saved-locations-schema.sql`

```sql
-- saved_locationsテーブルの作成
CREATE TABLE saved_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255),
    prefecture VARCHAR(50),
    city VARCHAR(100),
    location_tag VARCHAR(50),
    location_detail VARCHAR(100),
    location_notes TEXT,
    address TEXT,
    map_url TEXT,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### 2. JavaScript関数の更新

#### loadSavedLocations() - 非同期化
- LocalStorageからの読み込み → Supabaseからの読み込み
- エラー時の後方互換性（LocalStorageフォールバック）
- 非同期処理（async/await）に変更

#### saveCurrentLocation() - 非同期化
- LocalStorageへの保存 → Supabaseへの保存
- 重複チェックもSupabaseで実施
- 保存後にリストを再読み込み
- バックアップとしてLocalStorageにも保存

#### loadSavedLocation() - 非同期化
- インデックスベース → UUIDベース
- Supabaseから特定のレコードを取得

#### updateLocationSelect()
- インデックスベース → UUIDベースのvalue設定

### 3. UI変更点
- 採取ポイント保存ボタンのスタイル追加（紫色）
- セレクトボックスのvalueがUUIDに変更

## セットアップ手順

### 1. Supabaseでテーブル作成
1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. `saved-locations-schema.sql`の内容を実行
4. テーブルが作成されたことを確認

### 2. 既存データの移行（オプション）
LocalStorageに既存のデータがある場合：

```javascript
// ブラウザのコンソールで実行
const oldData = JSON.parse(localStorage.getItem('twinpeach_saved_locations') || '[]');
console.log('移行するデータ数:', oldData.length);
console.log('データ内容:', oldData);
```

### 3. 動作確認
1. 石の編集画面で位置情報を入力
2. 「この場所を採取ポイントとして保存」をクリック
3. 保存された採取ポイントがセレクトボックスに表示されることを確認
4. 選択して情報が自動入力されることを確認

## トラブルシューティング

### エラー: テーブルが存在しない
- Supabaseでテーブルが作成されているか確認
- テーブル名が`saved_locations`（複数形）であることを確認

### エラー: 権限エラー
- SupabaseのRLS（Row Level Security）を確認
- 必要に応じてRLSを無効化または適切なポリシーを設定

### データが表示されない
- ブラウザのコンソールでエラーを確認
- LocalStorageにフォールバックデータがあるか確認

## 利点

1. **デバイス間共有**: 異なるデバイスから同じ採取ポイントにアクセス可能
2. **永続性**: ブラウザのデータクリアでも失われない
3. **バックアップ**: Supabaseで自動的にバックアップ
4. **拡張性**: 将来的にユーザー別管理や共有機能の追加が容易

## 今後の拡張案

1. ユーザー認証と連携した個人別採取ポイント管理
2. 採取ポイントの共有機能
3. 採取ポイントごとの石の統計情報
4. 地図上での採取ポイント表示（石マップとの連携）