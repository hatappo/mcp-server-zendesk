# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zendesk MCP (Model Context Protocol) Server that provides integration with Zendesk APIs. The server runs in stdio mode and exposes tools for searching articles and creating tickets.

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
- **Entry Point**: `src/index.ts` - MCPサーバーの初期化とstdio通信の設定
- **Tools**: `src/tools/` - MCPツールの実装（search_articles, get_article_content, create_ticket）
  - 各ツールは独立したモジュールとして実装
  - ツールの登録は`src/tools/index.ts`で集約管理
- **Utilities**: `src/utils/` - 共通ユーティリティ
  - `zendesk-client.ts`: Zendesk API通信の中央管理
  - `logger.ts`: Pinoによる構造化ログ
  - `error-handler.ts`: エラーハンドリングの統一

### Key Design Patterns
1. **ツールベースアーキテクチャ**: 各機能はMCPツールとして実装
2. **環境変数管理**: dotenv-flowを使用し、`.env`と`.env.local`で階層的に管理
3. **エラーハンドリング**: 統一されたエラーハンドラーとMCPErrorResponseの利用
4. **非同期処理**: async/awaitパターンの一貫した使用

## Development Guidelines

### Code Style
- **モジュールシステム**: ESModules (`import/export`) を使用
- **非同期処理**: Promise chainではなくasync/awaitを使用
- **HTTPクライアント**: axiosではなくnative fetchを使用
- **TypeScript実行**: Node.js v24+で直接実行可能

### Testing Strategy
- **フレームワーク**: Vitest
- **テストファイル**: `tests/`ディレクトリに配置
- **API疎通テスト**: `scripts/test-api.ts`で実環境テスト

### Environment Setup
1. **Node.js管理**: Voltaを使用（package.jsonにバージョン固定）
2. **環境変数**: `.env.local`で個人設定を管理（`.gitignore`に含まれる）
3. **必須環境変数**:
   - `ZENDESK_SUBDOMAIN`
   - `ZENDESK_USERNAME`
   - `ZENDESK_API_TOKEN`

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
- **目的**: Zendeskサポートチケットの作成
- **主要パラメータ**: subject, comment.body (必須), requester, priority, type, tags
- **実装**: `src/tools/create-ticket.ts`

## Important Notes

1. **APIレート制限**: Zendesk APIのレート制限に注意
2. **認証**: Basic認証（メールアドレス/token形式）を使用
3. **エラーレスポンス**: MCPErrorResponseで統一的にエラーを返す
4. **ログ出力**: Pinoロガーを使用し、構造化ログを出力

## Development Workflow

1. **機能追加時**: 新しいツールは`src/tools/`に追加し、`index.ts`で登録
2. **テスト作成**: 対応するテストファイルを`tests/`に作成
3. **ドキュメント更新**: 必要に応じて`docs/dev/`に開発ドキュメントを追加
4. **コード品質チェック**: コミット前に`npm run lint:fix && npm run format:fix && npm run typecheck`を実行