#!/bin/bash
# 狼煙屋データベース 開発サーバー起動スクリプト

echo "🔥 狼煙屋データベース開発サーバーを起動します..."
echo ""
echo "📍 アクセスURL:"
echo "   管理画面: http://localhost:8000/characters/data-models/admin.html"
echo "   閲覧画面: http://localhost:8000/characters/data-models/index.html"
echo ""
echo "🛑 終了するには Ctrl+C を押してください"
echo ""

# Python3でシンプルなHTTPサーバーを起動
cd /Users/ootsukaumihei/Development/twinpeach
python3 -m http.server 8000