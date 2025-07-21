# MCP Server Zendesk API 仕様

## 概要

このMCPサーバーは、Zendesk APIとの統合を提供し、Help Center記事の検索とサポートチケットの作成機能を提供します。

## ツール一覧

### 1. search_articles

Zendesk Help Centerの記事を検索します。

#### パラメータ

| パラメータ | 型     | 必須 | デフォルト | 説明                        |
|------------|--------|------|------------|----------------------------|
| query      | string | ✓    | -          | 検索クエリ                  |
| locale     | string | -    | "en-us"    | 記事のロケール              |
| per_page   | number | -    | 10         | 1ページあたりの結果数       |
| page       | number | -    | 1          | ページ番号                  |

#### レスポンス例

```json
{
  "success": true,
  "count": 2,
  "page": 1,
  "per_page": 10,
  "articles": [
    {
      "id": 12345,
      "title": "パスワードリセット方法",
      "url": "https://example.zendesk.com/hc/ja/articles/12345",
      "body": "パスワードをリセットするには...",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-06-01T00:00:00Z"
    }
  ]
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

### 2. create_ticket

新しいサポートチケットを作成します。

#### パラメータ

| パラメータ           | 型     | 必須 | デフォルト | 説明                    |
|---------------------|--------|------|------------|------------------------|
| subject             | string | ✓    | -          | チケットの件名          |
| comment.body        | string | ✓    | -          | 初回コメントの内容      |
| requester.name      | string | -    | -          | 依頼者の名前            |
| requester.email     | string | -    | -          | 依頼者のメールアドレス   |
| priority            | string | -    | "normal"   | 優先度                  |
| type                | string | -    | -          | チケットタイプ          |
| tags                | array  | -    | -          | タグの配列              |

#### 優先度の値

- `urgent` - 緊急
- `high` - 高
- `normal` - 通常
- `low` - 低

#### チケットタイプの値

- `problem` - 問題
- `incident` - インシデント
- `question` - 質問
- `task` - タスク

#### レスポンス例

```json
{
  "success": true,
  "ticket": {
    "id": 98765,
    "url": "https://example.zendesk.com/api/v2/tickets/98765.json",
    "subject": "ログインできません",
    "status": "new",
    "priority": "normal",
    "type": "question",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

## 認証

このMCPサーバーは、以下の環境変数を使用してZendesk APIに認証します：

- `ZENDESK_SUBDOMAIN`: Zendeskサブドメイン
- `ZENDESK_USERNAME`: ユーザー名（メールアドレス）
- `ZENDESK_API_TOKEN`: APIトークン

## エラーコード

| エラー | 説明                        |
|--------|---------------------------|
| 400    | 不正なリクエストパラメータ   |
| 401    | 認証エラー                  |
| 403    | アクセス権限なし            |
| 404    | リソースが見つからない      |
| 500    | サーバー内部エラー          |

## 制限事項

- Help Center記事の検索には、適切な読み取り権限が必要です
- チケット作成には、適切な作成権限が必要です
- APIレート制限はZendeskの制限に準拠します