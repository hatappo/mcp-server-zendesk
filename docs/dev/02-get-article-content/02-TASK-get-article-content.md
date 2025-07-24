# Task List - Get Article Content

記事の内容取得機能の実装タスクリスト

## タスク

- [x] Zendesk APIの記事取得エンドポイントを調査
  - [x] Help Center Articles APIドキュメントの確認
  - [x] 記事ID指定での取得方法を確認
  - [x] レスポンス形式の確認

- [x] get-article-contentツールの実装
  - [x] `src/tools/get-article-content.ts`の作成
  - [x] 記事IDを受け取り、記事内容を返す機能の実装
  - [x] エラーハンドリングの実装

- [x] get-article-contentツールのテスト作成
  - [x] `tests/tools/get-article-content.test.ts`の作成
  - [x] 正常系テストケースの実装
  - [x] エラー系テストケースの実装

- [x] ツールをMCPサーバーに登録
  - [x] `src/tools/index.ts`への追加
  - [x] ツールの登録と設定

- [x] API疎通テストの更新
  - [x] `scripts/test-api.ts`に記事取得のテストを追加

- [x] ドキュメントの更新
  - [x] README.mdへの使用方法追加
  - [x] 開発ドキュメント（02-DOC-get-article-content.md）の作成

## 実装方針

- Zendesk Help Center Articles APIの`GET /api/v2/help_center/{locale}/articles/{article_id}`エンドポイントを使用
- 既存のsearch-articlesツールと同様のエラーハンドリングパターンを使用
- 記事の内容はHTML形式で取得されるため、適切にフォーマットして返す