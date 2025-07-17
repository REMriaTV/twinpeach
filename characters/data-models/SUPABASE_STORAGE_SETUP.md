# Supabase Storage セットアップガイド

## 📦 画像・音声ファイル保存機能の実装

### 1. Supabase Storageの有効化

1. Supabaseダッシュボードにログイン
2. 左メニューから「Storage」を選択
3. 「Create a new bucket」をクリック

### 2. バケットの作成

#### 鳥の録音用バケット
```
名前: bird-recordings
公開設定: Public（または Private）
ファイルサイズ上限: 50MB
許可する拡張子: .mp3, .wav, .m4a, .webm
```

#### 石の写真用バケット
```
名前: stone-photos
公開設定: Public（または Private）
ファイルサイズ上限: 10MB
許可する拡張子: .jpg, .jpeg, .png, .webp
```

### 3. RLS（Row Level Security）ポリシーの設定

#### アップロード許可
```sql
-- 認証なしでアップロード可能にする場合
CREATE POLICY "Allow public upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bird-recordings' OR bucket_id = 'stone-photos');
```

#### ダウンロード許可
```sql
-- 公開アクセスを許可
CREATE POLICY "Allow public download" ON storage.objects
FOR SELECT USING (bucket_id = 'bird-recordings' OR bucket_id = 'stone-photos');
```

### 4. 実装コード例

#### ファイルアップロード
```javascript
async function uploadFile(file, bucket, path) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
    
    if (error) {
        console.error('Upload error:', error);
        return null;
    }
    
    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
    
    return publicUrl;
}
```

#### 使用例
```javascript
// 鳥の録音をアップロード
const audioFile = document.getElementById('bird-recording-upload').files[0];
const audioUrl = await uploadFile(
    audioFile, 
    'bird-recordings', 
    `birds/${birdId}/${Date.now()}_${audioFile.name}`
);

// 石の写真をアップロード
const photoFile = document.getElementById('stone-photo-upload').files[0];
const photoUrl = await uploadFile(
    photoFile,
    'stone-photos',
    `stones/${stoneId}/${Date.now()}_${photoFile.name}`
);
```

### 5. データベーススキーマの更新

現在の`recordings`や`photos`フィールドをURLベースに変更：

```sql
-- 例：鳥テーブルに録音URLを保存
ALTER TABLE birds ADD COLUMN recording_urls TEXT[];

-- 例：石テーブルに写真URLを保存
ALTER TABLE stones ADD COLUMN photo_urls TEXT[];
```

### 6. 実装手順

1. Supabaseでバケットを作成
2. RLSポリシーを設定
3. `admin-manager.js`にアップロード関数を追加
4. 保存時にファイルをアップロード
5. URLをデータベースに保存

### 7. 注意事項

- ファイルサイズの制限を設定
- 適切なファイル形式の検証
- アップロード進捗の表示
- エラーハンドリング
- 古いファイルの削除処理

---
作成日: 2025-07-17