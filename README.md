# MCP Server for Zendesk

Zendesk API と連携する MCP（Model Context Protocol）サーバーです。

## 機能

- Zendesk Help Center の記事検索
- Zendesk Help Center の記事内容取得
- Zendesk チケットの作成

## セットアップ

### 1. 環境変数の設定

`.env`ファイルをコピーして`.env.local`を作成し、実際のZendesk API認証情報を設定します：

```sh
# .env ファイルをコピーして .env.local を作成
cp .env .env.local

# .env.local を編集して実際の認証情報を設定
# ZENDESK_SUBDOMAIN=your-actual-subdomain
# ZENDESK_USERNAME=your-actual-email@example.com
# ZENDESK_API_TOKEN=your-actual-api-token
```

注意：
- `.env`ファイルはデフォルト値として Git で管理されます
- `.env.local`ファイルは個人用設定として`.gitignore`に含まれており、リポジトリにコミットされません
- dotenv-flowにより、`.env.local`の値が`.env`の値を上書きします

### 2. Claude Code への登録

このプロジェクトには `.claude/mcp.json` が含まれており、Claude Code が自動的に MCP サーバーを認識します。

プロジェクトを Claude Code で開くと、MCP サーバーが利用可能になります。

## 使用方法

### 記事検索

```
search_articles ツールを使用して、Zendesk Help Centerの記事を検索できます。

パラメータ:
- query: 検索クエリ（必須）
- locale: ロケール（デフォルト: "en-us"）
- per_page: 1ページあたりの結果数（デフォルト: 10）
- page: ページ番号（デフォルト: 1）
```

### 記事内容取得

```
get_article_content ツールを使用して、特定の記事の全内容を取得できます。

パラメータ:
- article_id: 記事ID（必須）
- locale: ロケール（デフォルト: "ja"）
```

### チケット作成

```
create_ticket ツールを使用して、新しいサポートチケットを作成できます。

パラメータ:
- subject: チケットの件名（必須）
- comment.body: 最初のコメント（必須）
- requester: リクエスター情報（オプション）
- priority: 優先度（urgent/high/normal/low）
- type: チケットタイプ（problem/incident/question/task）
- tags: タグの配列
```

## 開発

### 必要な環境

- Node.js v24.3.0 以上
- Volta（推奨）

### インストール

```sh
npm install
```

### 開発モード

```sh
npm run dev
```

### ビルド

```sh
npm run build
npm start
```

### リント・フォーマット

```sh
npm run lint
npm run lint:fix
npm run format
npm run format:fix
```

### 型チェック

```sh
npm run typecheck
```

### テスト

```sh
# 単体テスト実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# 実際のZendesk APIとの疎通テスト
npm run test:api
```

## プロジェクト構造

```
mcp-server-zendesk/
├── src/
│   ├── index.ts              # エントリーポイント
│   ├── tools/
│   │   ├── index.ts              # ツールセットアップ
│   │   ├── search-articles.ts     # 記事検索ツール
│   │   ├── get-article-content.ts # 記事内容取得ツール
│   │   └── create-ticket.ts       # チケット作成ツール
│   └── utils/
│       ├── logger.ts         # ロギング設定
│       ├── error-handler.ts  # エラーハンドリング
│       └── zendesk-client.ts # Zendesk APIクライアント
├── tests/                    # テストファイル
├── scripts/                  # 実行スクリプト
│   └── test-api.ts          # API疎通テスト
├── docs/                     # ドキュメント
│   ├── API.md               # API仕様書
│   ├── DEV.md               # 開発指針
│   └── TASK.md              # タスクリスト
├── .claude/
│   └── mcp.json             # MCP設定ファイル
├── .env                     # デフォルト環境変数
├── .env.local               # ローカル環境変数（要作成）
└── README.md                # このファイル
```

## トラブルシューティング

### 403 Forbidden エラー

Zendesk APIへのアクセスが拒否される場合：

1. APIトークンの権限を確認
2. Help Centerへの読み取りアクセス権限があることを確認
3. サブドメイン名が正しいことを確認

### 接続エラー

MCPサーバーの接続が失敗する場合：

1. Claude Codeを再起動
2. 環境変数が正しく設定されていることを確認
3. Node.js v24.3.0以上がインストールされていることを確認

## ドキュメント

- [API仕様書](docs/API.md) - MCPツールの詳細な仕様
- [開発指針](docs/DEV.md) - プロジェクトの開発方針
- [タスクリスト](docs/TASK.md) - 開発進捗の記録

## ライセンス

MIT License
