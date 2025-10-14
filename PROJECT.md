# Codex CLI ガイドライン

## リポジトリ概要
- パス: /Users/ootsukaumihei/twinpeach
- 主要ブランチ: main（GitHub Pages 公開用）。作業用ブランチはタスクごとに作成する
- 内容: HTML/CSS/JS ベースの静的サイト。`assets/` 以下に画像等の素材

## Codex CLI セットアップ確認
- `codex --version` で CLI バージョンを確認（現在 0.38.0）
- 認証情報: `~/.codex/auth.json`（API キー等が入るので取り扱い注意）
- 設定ファイル: `~/.codex/config.toml`。`model = "gpt-5-codex"` とし、当リポジトリへの `trust_level = "trusted"` エントリを維持する
- CLI から `codex whoami` を実行してサインイン状態を確認（サンドボックス環境では失敗する場合あり）

## 作業フロー（ローカル）
- セッション開始: リポジトリ直下で `codex ask` または `codex plan` を実行し、指示は日本語で OK
- 変更作成: `codex` に修正を依頼 → 生成された差分をプレビューし `codex apply` で反映
- テスト / プレビュー: 静的サイトのため `python3 -m http.server 4173` 等で手元プレビュー可能（必要に応じてブラウザで確認）
- コミット: `git status` で変更確認 → `git commit -m "feat: ..."` 形式で短く内容を記述（日本語でも可）
- プッシュ: `git push origin <branch>`。GitHub Pages 反映は main にマージ後（数分かかることあり）

## GitHub 連携
- リモート: `github-remriatv:REMriaTV/twinpeach.git`（SSH 設定が必要）
- PR 作成: ブランチをプッシュ後、GitHub で PR → レビュー → main へマージ
- デプロイ: main ブランチ更新で GitHub Pages が自動反映。反映確認は https://remriatv.github.io/twinpeach/ （DNS 変更済なら独自ドメイン）

## 運用メモ
- 大きめの UI 変更や新規ページ追加時は `README.md` に概要を追記
- `index.html` のアニメーションやインタラクションは複数のタイマー・イベントを利用しているため、改修時はブラウザで挙動確認する
- 必要に応じて `assets/` の画像最適化（WebP 化など）を検討

## トラブルシューティング
- CLI が API に接続できない場合: ネットワーク規制、API キー失効、モデル指定ミスを確認
- GitHub への push で権限エラー: SSH 鍵設定（`~/.ssh/config` 内 `github-remriatv` エントリ）を見直す
- GitHub Pages の反映が遅い場合: キャッシュクリアのためブラウザをリロード、または数分待機

## iPhone からの利用ワークフロー案
- 常時稼働させる Mac / サーバー側で `tmux` を起動し、Codex CLI をその中で利用するとセッションを保持できる
- iPhone からは `Blink Shell` や `Termius` などの SSH クライアントアプリで上記端末に接続。公開鍵認証を設定し、`tmux attach -t twinpeach` 等で既存セッションに入る
- SSH 接続後の操作はデスクトップと同じ：`codex ask` で相談 → 差分を確認 → `git status` / `git commit` / `git push`
- ChatGPT アプリは設計相談やプロンプトの下書きに活用し、完成した指示をコピーして Codex CLI に貼り付けると運用がスムーズ
- GitHub でのレビューやマージは、必要に応じて GitHub モバイルアプリや Safari から実行
- 緊急時は GitHub ブラウザエディタを直接使うというバックアップ手段も用意しておく
