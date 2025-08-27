# 03 HTTP Transport 対応 - タスクリスト

## 概要

現在のstdio TransportからStreamable HTTP Transportへの移行を行います。LibreChatクライアントとの連携を想定し、X-User-Emailヘッダーから動的にユーザーメールアドレスを取得できるようにします。

## タスクリスト

### 1. プロジェクト構造の整理
- [x] フォルダー名を `docs/dev/03/` から `docs/dev/03-http-transport/` にリネーム
- [x] 要件ファイルを `03-REQ.md` から `03-REQ-http-transport.md` にリネーム
- [x] 本TASKファイル `03-TASK-http-transport.md` を作成

### 2. 依存関係の追加・削除
- [ ] `express` パッケージの追加
- [ ] stdio関連の依存関係を調査・整理

### 3. 新機能の実装
- [ ] `src/server/http.ts` の作成 - HTTP Transportサーバー実装
- [ ] `src/utils/auth-context.ts` の作成 - リクエスト毎の認証コンテキスト管理
- [ ] `src/index.ts` をHTTP Transport専用に変更
- [ ] `src/utils/zendesk-client.ts` に動的メール設定機能を追加
- [ ] `src/tools/create-ticket.ts` にリクエスタメール自動設定機能を追加

### 4. 環境変数の設定
- [ ] `MCP_PORT` - HTTPサーバーポート設定（デフォルト: 3000）
- [ ] `ZENDESK_ALLOW_USER_EMAIL` - ユーザーメールでの認証許可設定（デフォルト: false）

### 5. テストの作成
- [ ] HTTP Transportのユニットテスト
- [ ] X-User-Emailヘッダー処理のテスト
- [ ] 動的認証切り替えのテスト
- [ ] 既存テストの更新（stdio関連の削除）

### 6. ドキュメントの更新
- [ ] `README.md` をHTTP Transport専用に更新
- [ ] `CLAUDE.md` の更新（stdio関連コマンドの削除、HTTP関連コマンドの追加）
- [ ] LibreChat設定例の追加
- [ ] `03-DOC-http-transport.md` の作成（実装詳細ドキュメント）
- [ ] `package.json` の起動スクリプト更新

### 7. 動作確認・テスト
- [ ] ローカルでのHTTP Transport動作確認
- [ ] LibreChat連携テスト用の設定例作成
- [ ] 全テストの実行とパス確認

## 重要な実装ポイント

### セッション管理
- セッションIDベースのトランスポート管理
- セッション初期化時の適切な処理
- セッション終了時のクリーンアップ

### 認証処理
- X-User-Emailヘッダーの優先使用
- 環境変数メールのフォールバック
- Zendesk APIクライアントの動的生成

### エラーハンドリング
- HTTP通信のエラー処理
- 認証失敗時の適切なレスポンス
- セッション管理のエラー処理

## 完了条件

- [ ] 全てのタスクが完了している
- [ ] 全てのテストがパスしている
- [ ] ローカルでHTTP Transportが正常に動作している
- [ ] ドキュメントが最新の実装に更新されている
- [ ] LibreChat設定例が正しく記載されている