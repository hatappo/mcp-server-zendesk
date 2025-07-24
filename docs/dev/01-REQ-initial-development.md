次のアプリケーションを作成します。

## アプリケーション概要

- Remote MCP Server
- Zendesk 上の Public Articles を自由に検索し情報収集できる。
- Zendesk のチケット作成ができる。

## 開発の進め方

- 実行内容をタスクに落とした場合は [task](./task) フォルダに `${seq}-TASK-${task-title}.md` ファイルにその内容を書き出す。
  - `seq`: 01 からはじまる連番。
  - `task-title`: タスクをあらわす簡単な文言。
- 進捗するたびに完了した内容にチェックを付けてください。

## 実装概要

- Streamable HTTP に準拠。
- Zendesk API を活用。
- Zendesk API は API Token で認証。
- Typescript と Nodejs を使用。

## 　活用するツールやライブラリ

提示したものよりおすすめのものがあれば遠慮なく活用してください。また、提示したもの以外もおすすめがあれば提案してください。

### アプリケーション本体に活用するツールやパッケージ

- @modelcontextprotocol/sdk: MCP の実装
- node-zendesk: Zendesk API の利用
- zod: 型バリデーション
- dotenv-flow: 環境変数管理
- pino: ロガー

### 開発環境に活用するツールやパッケージ

- volta で node と npm のバージョンを管理。
- @biomejs/biome: リンタおよびフォーマッタ
- eslint: Biome で対応していない場合に使用
- eslint-plugin-import: import の整頓

### 単体テストに活用するツールやパッケージ

- vitest

## コーディング規約

- Promise より async/await を活用する。

## その他

- 開発エディタは Visual Studio Code とする。
