#!/usr/bin/env node
import { serve } from "@hono/node-server";
import dotenv from "dotenv-flow";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { AuthContextManager } from "./utils/auth-context.js";
import { setupLogger } from "./utils/logger.js";
import { createMcpErrorResponse, createMcpServer, handleMcpRequest } from "./utils/mcp-handler.js";
import { requestContext } from "./utils/request-context.js";

dotenv.config();

const logger = setupLogger();

// Hono アプリケーション作成
const app = new Hono();

// ヘルスチェックエンドポイント
app.get("/health", (c) => {
	return c.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		service: "mcp-server-zendesk",
	});
});

// MCPエンドポイント（ステートレス）
app.post("/mcp", async (c) => {
	try {
		const body = await c.req.json();
		const userEmail = c.req.header("x-user-email");

		logger.debug({ userEmail, method: body.method }, "Processing MCP request");

		// 認証コンテキスト作成（毎回新規）
		const authContextManager = AuthContextManager.getInstance(logger);
		const authContext = authContextManager.createAuthContext({
			userEmail,
			logger,
		});

		// リクエストコンテキスト作成
		const reqContext = {
			authContext,
			logger,
		};

		// リクエストコンテキスト内で処理実行
		return await requestContext.run(reqContext, async () => {
			const { server, transport } = createMcpServer(logger);
			return await handleMcpRequest(c, body, server, transport);
		});
	} catch (error) {
		logger.error({ error }, "Error handling MCP request");
		return createMcpErrorResponse(c, error);
	}
});

// Lambda ハンドラーをエクスポート
export const handler = handle(app);

// ローカル開発用サーバー起動
async function startLocalServer() {
	try {
		logger.info("Starting MCP Zendesk Server (Hono.js)...");

		// 環境変数検証のため AuthContextManager を初期化
		AuthContextManager.getInstance(logger);

		// ポート設定
		const port = process.env.MCP_PORT ? Number.parseInt(process.env.MCP_PORT, 10) : 3000;

		logger.info({ port }, "MCP Zendesk Server started successfully");

		// Hono Node.js サーバー起動
		serve({
			fetch: app.fetch,
			port,
		});
	} catch (error) {
		logger.error({ error }, "Failed to start MCP Zendesk Server");
		process.exit(1);
	}
}

// 本番環境（Lambda）以外でローカルサーバー起動
if (process.env.NODE_ENV !== "production" && process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
	try {
		await startLocalServer();
	} catch (error) {
		console.error("Unhandled error:", error);
		process.exit(1);
	}
}
