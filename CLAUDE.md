# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zendesk MCP (Model Context Protocol) Server that provides integration with Zendesk APIs. The server runs in **HTTP Transport mode** and exposes tools for searching articles and creating tickets. It's designed for LibreChat integration with dynamic user authentication support via X-User-Email headers.

## Common Development Commands

### Build and Development
```bash
npm run build          # TypeScriptのコンパイル
npm run dev           # 開発モード（ファイル監視付き）
npm start             # ビルド済みコードの実行
npm run start:ts      # TypeScriptを直接実行
```

### Testing
```bash
npm test              # Vitestによる単体テスト実行
npm run test:coverage # カバレッジ付きテスト
npm run test:api      # 実際のZendesk APIとの疎通テスト
npx vitest run tests/tools/search-articles.test.ts  # 単一テストファイルの実行
```

### Code Quality
```bash
npm run lint          # Biomeによるリントチェック
npm run lint:fix      # リント自動修正
npm run format        # コードフォーマットチェック
npm run format:fix    # コードフォーマット自動修正
npm run typecheck     # TypeScriptの型チェック
```

## Architecture Overview

### MCP Server Structure
- **Entry Point**: `src/index.ts` - HTTP Transport サーバーの初期化
- **HTTP Server**: `src/server/http.ts` - Express + StreamableHTTPServerTransport実装
- **Tools**: `src/tools/` - MCPツールの実装（search_articles, get_article_content, create_ticket）
  - 各ツールは独立したモジュールとして実装
  - ツールの登録は`src/tools/index.ts`で集約管理
  - リクエストコンテキスト対応で動的認証をサポート
- **Utilities**: `src/utils/` - 共通ユーティリティ
  - `zendesk-client.ts`: 動的Zendeskクライアント（ユーザー毎のクライアント生成）
  - `auth-context.ts`: リクエスト毎の認証コンテキスト管理
  - `request-context.ts`: AsyncLocalStorageベースのリクエストスコープ管理
  - `logger.ts`: Pinoによる構造化ログ
  - `error-handler.ts`: エラーハンドリングの統一

### Key Design Patterns
1. **HTTP Transport アーキテクチャ**: Express + StreamableHTTPServerTransport
2. **リクエストスコープ管理**: AsyncLocalStorageによるリクエスト毎のコンテキスト分離
3. **動的認証システム**: X-User-Emailヘッダーによるユーザー毎の認証切り替え
4. **セッション管理**: セッションIDベースのトランスポート管理
5. **クライアントキャッシュ**: 効率的なZendeskクライアント再利用
6. **ツールベースアーキテクチャ**: 各機能はMCPツールとして実装
7. **環境変数管理**: dotenv-flowを使用し、`.env`と`.env.local`で階層的に管理
8. **エラーハンドリング**: 統一されたエラーハンドラーとMCPErrorResponseの利用
9. **非同期処理**: async/awaitパターンの一貫した使用
10. **MCP Tool定義**: 各ツールでtool定義とhandler関数を分離し、`src/tools/index.ts`で集約
11. **Zod スキーマ**: パラメータ検証にZodスキーマを使用し、型安全性を確保

## Development Guidelines

### Code Style
- **モジュールシステム**: ESModules (`import/export`) を使用
- **非同期処理**: Promise chainではなくasync/awaitを使用
- **HTTPクライアント**: axiosではなくnative fetchを使用
- **TypeScript実行**: Node.js v24+で直接実行可能

### Testing Strategy
- **フレームワーク**: Vitest
- **テストファイル**: `tests/`ディレクトリに配置、元ファイルと同じディレクトリ構造を維持
- **API疎通テスト**: `scripts/test-api.ts`で実環境テスト（実際のZendesk APIを呼び出し、記事検索と内容取得をテスト）
- **環境変数バリデーション**: 各ツールとAPIテストスクリプトで必須環境変数の存在チェックを実装

### Environment Setup
1. **Node.js管理**: Voltaを使用（package.jsonにバージョン固定）
2. **環境変数**: `.env.local`で個人設定を管理（`.gitignore`に含まれる）
3. **必須環境変数**:
   - `ZENDESK_SUBDOMAIN` - Zendeskサブドメイン
   - `ZENDESK_USERNAME` - 管理者メールアドレス
   - `ZENDESK_API_TOKEN` - Zendesk APIトークン
4. **オプション環境変数**:
   - `MCP_PORT` - HTTPサーバーポート（デフォルト: 3000）
   - `ZENDESK_ALLOW_USER_EMAIL` - X-User-Emailヘッダーの使用許可（デフォルト: false）

## MCP Tool Interface

### search_articles
- **目的**: Zendesk Help Centerの記事検索
- **主要パラメータ**: query (必須), locale, per_page, page
- **実装**: `src/tools/search-articles.ts`

### get_article_content
- **目的**: Zendesk Help Centerの記事内容取得
- **主要パラメータ**: article_id (必須), locale (デフォルト: "ja")
- **実装**: `src/tools/get-article-content.ts`

### create_ticket
- **目的**: Zendeskサポートチケットの作成（動的リクエスタメール対応）
- **主要パラメータ**: subject, comment.body (必須), requester, priority, type, tags
- **動的認証**: X-User-Emailヘッダーからリクエスタメールを自動設定
- **フォールバック**: 明示的なrequester.emailが最優先、次にX-User-Email、最後にZendeskデフォルト
- **実装**: `src/tools/create-ticket.ts`

## Important Notes

1. **HTTP Transport**: Streamable HTTP Transport を使用（stdio は廃止）
2. **リクエストコンテキスト**: AsyncLocalStorageによるスコープ管理が必須
3. **動的認証**: X-User-Emailヘッダーによるユーザー毎の認証切り替え
4. **セッション管理**: セッションIDベースのトランスポート管理
5. **APIレート制限**: Zendesk APIのレート制限に注意
6. **認証**: Basic認証（メールアドレス/token形式）を使用
7. **エラーレスポンス**: MCPErrorResponseで統一的にエラーを返す
8. **ログ出力**: Pinoロガーを使用し、構造化ログを出力
9. **LibreChat統合**: librechat.yamlでのstreamable-http transport設定が必要

## Development Workflow

1. **機能追加時**: 新しいツールは`src/tools/`に追加し、`index.ts`で登録
2. **テスト作成**: 対応するテストファイルを`tests/`に作成
3. **ドキュメント更新**: 必要に応じて`docs/dev/`に開発ドキュメントを追加
4. **コード品質チェック**: コミット前に`npm run lint:fix && npm run format:fix && npm run typecheck`を実行

## Documentation Structure

### 開発ドキュメント (docs/dev/)
- **フォルダ構造**: 各機能ごとに番号付きディレクトリ（01-initial-development/、02-get-article-content/等）
- **ファイル規則**: 
  - `XX-REQ-*.md`: 機能要求・仕様書
  - `XX-TASK-*.md`: 開発タスクリスト
  - `XX-DOC-*.md`: 実装ドキュメント
- **README.md**: 開発ドキュメント全体の目次・概要