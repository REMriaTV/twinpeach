# TwinPeach 開発ノート (PROJECT.md)

この文書は **TwinPeach プロジェクト**の開発・運営に関する「正」となる情報源です。  
全員がこのページを参照することで、抜けや矛盾のない形で進行できるようにします。

---

## 🎯 プロジェクトの目的
- 桃次郎／狼煙屋の世界をウェブ空間に表現する
- GitHub Pages を使った公開サイト
- 将来 Firebase などのバックエンドと接続して発展させる
- 「いつでもどこでも（スマホ中心でも）」開発を進められる仕組みを作る

---

## 🌐 公開URL一覧
- メイン: https://remriatv.github.io/twinpeach/
- 主要ページ
  - `field-scroll-final.html` : 横スクロールUI
  - `stone-map-v6.html` : 石マップ
  - `river-login-hiuchiishi.html` : 狼煙ログイン導線
  - `about-noroshiya.html` : 世界観紹介
- その他、開発中の test ページや characters ページなど

---

## 🛠 技術スタック
- HTML / CSS / JavaScript
- GitHub Pages（デプロイ）
- データ保存: LocalStorage（現状）、Firebase（将来予定）

---

## 🔄 開発方式
- **GitHub連携が本線**
  - 変更は必ず Pull Request 経由
  - main ブランチに直接コミットしない
- **Codex CLI 常駐は補助**
  - ローカルPCやCodespacesでの検証用
  - 実行ログや結果をPROJECT.mdに反映する

---

## 📐 運用ルール
- コミットメッセージは短く明確に（例: `fix: scroll bug on field-scroll-final`）
- 小粒のPRを基本にする（大規模変更は分割）
- 非公開データ（APIキー、秘密URLなど）はリポジトリに含めない
- 「決まったこと」は必ず PROJECT.md に追記する

---

## 📝 優先タスク
1. `field-scroll-final.html` の安定化
2. `stone-map-v6.html` のUX改善
3. `river-login-hiuchiishi.html` の導線調整
4. characters ページの整備

---

## ✅ 品質基準
- **スマホ優先**で閲覧可能
- リンク切れゼロを維持
- Lighthouseでモバイル80点以上を目安に改善

---

## 🚫 禁止事項
- 秘密情報（APIキー、パスワード等）のコミット
- 危険なコマンドや破壊的操作をPRに含めること

---

## 📋 タスク管理の流れ
- 新しいアイデアや課題 → Issue 化
- 実装 → PR 作成
- 決定事項やルール → PROJECT.md に追記

---

## 🔜 次の一手
- この PROJECT.md を main に追加する
- PRテンプレートを `.github/PULL_REQUEST_TEMPLATE.md` に用意する
- 最優先: `field-scroll-final.html` の改善PRを作る

---

## 🧪 ローカル動作確認
- CLI セットアップテスト: 2025-10-13 19:37:07
- スマホから正式追記テスト（Codex 完全成功版）
