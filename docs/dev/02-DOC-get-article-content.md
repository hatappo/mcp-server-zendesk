# Get Article Content Feature Documentation

## 概要

Zendesk Help Centerの記事内容を取得する機能を実装しました。この機能により、記事検索で見つかった記事の全文を取得できるようになります。

## 実装内容

### 1. MCPツール: get_article_content

**ファイル**: `src/tools/get-article-content.ts`

**機能**:
- 記事IDを指定して、記事の全内容を取得
- HTML形式の本文を含む詳細情報を返す

**パラメータ**:
- `article_id` (number, 必須): 取得したい記事のID
- `locale` (string, オプション): ロケール指定（デフォルト: "ja"）

**レスポンス**:
```json
{
  "success": true,
  "article": {
    "id": 123456,
    "title": "記事タイトル",
    "url": "https://example.zendesk.com/hc/ja-jp/articles/123456",
    "body": "<p>記事の本文HTML</p>",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z",
    "author_id": 789,
    "section_id": 456,
    "promoted": false,
    "position": 1,
    "label_names": ["guide", "tutorial"],
    "locale": "ja"
  }
}
```

### 2. Zendesk API統合

**APIエンドポイント**: `GET /api/v2/help_center/{locale}/articles/{article_id}`

**実装方法**:
- node-zendeskライブラリの`client.helpcenter.articles.show()`メソッドを使用
- 既存のZendeskクライアント設定を再利用

### 3. エラーハンドリング

以下のエラーケースに対応:
- 記事が見つからない場合
- API認証エラー
- ネットワークエラー
- 入力値検証エラー（記事IDが数値でない等）

## テスト

### 単体テスト

**ファイル**: `tests/tools/get-article-content.test.ts`

**テストケース**:
1. 正常系: 記事IDで記事を取得
2. デフォルトロケールの使用
3. 記事が見つからない場合のエラー
4. APIエラーのハンドリング
5. 無効な入力値の検証

### 統合テスト

**ファイル**: `scripts/test-api.ts`

実際のZendesk APIに接続して以下をテスト:
1. 記事検索を実行
2. 検索結果から記事IDを取得
3. そのIDで記事内容を取得

## 使用例

```typescript
// MCPツールとして使用
const result = await mcp.callTool('get_article_content', {
  article_id: 123456,
  locale: 'ja'
});

// 直接関数として使用
import { handleGetArticleContent } from './src/tools/get-article-content.ts';

const result = await handleGetArticleContent({
  article_id: 123456,
  locale: 'ja'
});
```

## 今後の拡張可能性

1. **HTMLからテキストへの変換**: 現在はHTML形式で返すが、プレーンテキスト変換オプションを追加可能
2. **翻訳記事の取得**: 複数のlocaleで同じ記事を取得する機能
3. **記事の添付ファイル取得**: 記事に含まれる画像やファイルの取得
4. **バッチ取得**: 複数の記事IDを一度に取得する機能

## セキュリティ考慮事項

- API認証情報は環境変数で管理
- 記事のアクセス権限はZendesk側で制御（公開記事のみ取得可能）
- レート制限に対する考慮（大量の記事取得時）