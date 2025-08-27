# MCP Server for Zendesk (Stateless HTTP Transport)

Zendesk API と連携するステートレス HTTP Transport 対応の MCP（Model Context Protocol）サーバーです。LibreChat との統合および AWS Lambda Function URL での実行を想定し、ユーザー毎の動的認証に対応しています。

## 機能

- **Zendesk Help Center 記事検索**: 多言語対応の記事検索
- **Zendesk Help Center 記事内容取得**: 詳細な記事情報の取得
- **Zendesk チケット作成**: 動的なリクエスタメール設定対応
- **動的ユーザー認証**: X-User-Email ヘッダーによる認証切り替え
- **ステートレス処理**: メモリ効率化とコールドスタート最適化
- **LibreChat 統合**: streamable-http transport 対応
- **AWS Lambda 対応**: Function URL でのサーバーレス実行

## アーキテクチャ

このサーバーは **ステートレス HTTP Transport** を使用し、以下の特徴があります：

- **Streamable HTTP Transport**: MCP 標準のHTTP通信方式
- **ステートレス処理**: リクエスト毎にサーバー・クライアントを新規作成
- **リクエストスコープ認証**: リクエスト毎の認証コンテキスト
- **Hono.js サーバー**: 軽量で高速なWeb フレームワーク
- **AWS Lambda 対応**: Function URL でのサーバーレス実行

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、実際の認証情報を設定します：

```sh
# .env.local ファイルを作成
cat > .env.local << 'EOF'
# Zendesk 基本設定（必須）
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_USERNAME=admin@example.com
ZENDESK_API_TOKEN=your-api-token

# HTTP Transport 設定（オプション）
MCP_PORT=3000

# ユーザーメール認証設定（オプション）
ZENDESK_ALLOW_USER_EMAIL=true
EOF
```

### 2. サーバーの起動

```sh
# 依存関係のインストール
npm install

# 開発モードで起動
npm run dev

# または本番ビルドで起動
npm run build
npm start
```

### 3. LibreChat との統合

`librechat.yaml` に以下の設定を追加：

```yaml
mcpServers:
  zendesk:
    transport: streamable-http
    url: http://localhost:3000/mcp
    headers:
      X-User-Email: "{{LIBRECHAT_USER_EMAIL}}"
    env:
      ZENDESK_SUBDOMAIN: "your-subdomain"
      ZENDESK_USERNAME: "fallback@example.com"
      ZENDESK_API_TOKEN: "${ZENDESK_API_TOKEN}"
      ZENDESK_ALLOW_USER_EMAIL: "true"
      MCP_PORT: "3000"
```

## AWS Lambda デプロイ（オプション）

本サーバーは AWS Lambda Function URL でのサーバーレス実行に対応しています。

### 前提条件

- AWS CLI の設定
- AWS アカウントの準備
- CDK CLI のインストール（別途必要）

### デプロイ手順

```sh
# CDK関連パッケージのインストール（別途）
npm install -g aws-cdk
cd cdk
npm install aws-cdk-lib constructs

# AWS環境の初期化（初回のみ）
npx cdk bootstrap

# Lambda にデプロイ
npm run build  # メインプロジェクトをビルド
cd cdk
npx cdk deploy

# デプロイ後にFunction URLが出力されます
# 例: https://abc123def456.lambda-url.us-east-1.on.aws/
```

### LibreChat での Lambda 利用

Lambda デプロイ後は、Function URL を使用：

```yaml
mcpServers:
  zendesk:
    transport: streamable-http
    url: https://your-function-url.lambda-url.region.on.aws/mcp
    headers:
      X-User-Email: "{{LIBRECHAT_USER_EMAIL}}"
```

### 環境変数の設定

Lambda では環境変数を事前に設定：
- AWS Console の Lambda 設定
- または CDK スタックでの定義

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

Biome による統一されたコード品質管理：

```sh
npm run lint         # Biome リント実行
npm run lint:fix     # Biome リント自動修正
npm run format       # Biome フォーマットチェック
npm run format:fix   # Biome フォーマット自動修正
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

## 環境変数の詳細

### 基本設定（必須）

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `ZENDESK_SUBDOMAIN` | Zendeskサブドメイン | `your-company` |
| `ZENDESK_USERNAME` | 管理者メールアドレス | `admin@company.com` |
| `ZENDESK_API_TOKEN` | Zendesk API トークン | `abc123...` |

### HTTP Transport 設定（オプション）

| 変数名 | 説明 | デフォルト |
|--------|------|---------|
| `MCP_PORT` | HTTPサーバーポート | `3000` |

### ユーザー認証設定（オプション）

| 変数名 | 説明 | デフォルト |
|--------|------|---------|
| `ZENDESK_ALLOW_USER_EMAIL` | X-User-Emailヘッダーの使用許可 | `false` |

### 動的認証の動作

- `ZENDESK_ALLOW_USER_EMAIL=true`: X-User-Email ヘッダーの値で認証
- `ZENDESK_ALLOW_USER_EMAIL=false`: 環境変数の固定メールで認証

## プロジェクト構造

```
mcp-server-zendesk/
├── src/
│   ├── index.ts                  # Hono.js エントリーポイント（ステートレス）
│   ├── tools/
│   │   ├── index.ts              # ツールセットアップ
│   │   ├── search-articles.ts    # 記事検索ツール
│   │   ├── get-article-content.ts # 記事内容取得ツール
│   │   └── create-ticket.ts      # チケット作成ツール（動的メール対応）
│   └── utils/
│       ├── logger.ts             # ロギング設定
│       ├── error-handler.ts      # エラーハンドリング
│       ├── zendesk-client.ts     # ステートレス Zendeskクライアント
│       ├── auth-context.ts       # 認証コンテキスト管理
│       ├── request-context.ts    # リクエストスコープ管理
│       ├── mock-response.ts      # StreamableHTTP用レスポンスモック
│       └── mcp-handler.ts        # MCP処理ロジック
├── cdk/                         # AWS CDK インフラストラクチャ
│   ├── lib/
│   │   └── cdk-stack.ts         # Lambda Function URL スタック定義
│   └── bin/
│       └── cdk.ts               # CDK アプリケーション
├── tests/                       # テストファイル
├── scripts/                     # 実行スクリプト
│   └── test-api.ts             # 実際のZendesk APIとの疎通テスト
├── docs/
│   └── dev/                    # 開発ドキュメント
├── .env                        # デフォルト環境変数
├── .env.local                  # ローカル環境変数（要作成）
└── README.md                   # このファイル
```

## トラブルシューティング

### HTTP サーバーが起動しない

```
Error: listen EADDRINUSE :::3000
```

**原因**: ポート3000が既に使用されている  
**解決**: 別のポートを指定するか、既存プロセスを停止
```sh
# 別のポートを使用
MCP_PORT=3001 npm start

# または既存プロセスを確認
lsof -ti:3000
```

### No request context found エラー

```
Error: No request context found. This function must be called within a request scope.
```

**原因**: リクエストスコープ外でのツール実行  
**解決**: `/mcp` エンドポイント経由でのMCPリクエスト実行を確認

### 認証エラー (401/403)

**Zendesk API認証の問題**:
1. `ZENDESK_API_TOKEN` の権限確認
2. `ZENDESK_SUBDOMAIN` の正確性確認
3. Help Center へのアクセス権限確認

**X-User-Email認証の問題**:
```sh
# 動的認証を無効化して確認
ZENDESK_ALLOW_USER_EMAIL=false npm start
```

### Missing required Zendesk configuration

**必須環境変数の未設定**:
```sh
# 設定状況を確認
printenv | grep ZENDESK
```

### LibreChat 統合の問題

**ヘッダーが送信されない**:
- LibreChatのバージョン確認
- `{{LIBRECHAT_USER_EMAIL}}` の展開確認

**接続エラー**:
```yaml
# librechat.yaml でURLを確認
url: http://localhost:3000/mcp  # ポート番号とパスを確認
```

## エンドポイント

ステートレス HTTP Transport では以下のエンドポイントが利用可能：

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/mcp` | POST | MCP リクエスト処理（ステートレス） |
| `/health` | GET | ヘルスチェック |

## ドキュメント

- [実装詳細ドキュメント](docs/dev/03-http-transport/03-DOC-http-transport.md) - HTTP Transport の詳細実装
- [タスクリスト](docs/dev/03-http-transport/03-TASK-http-transport.md) - 開発進捗記録
- [開発ガイドライン](docs/dev/README.md) - 開発プロセス

## ライセンス

MIT License
