import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Context } from "hono";
import type { Logger } from "pino";

import { setupTools } from "../tools/index.js";
import { setupErrorHandlers } from "./error-handler.js";
import { MockResponse } from "./mock-response.js";

/**
 * MCPサーバーとトランスポートを作成
 */
export function createMcpServer(logger: Logger): { server: Server; transport: StreamableHTTPServerTransport } {
	const transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: () => `stateless-${Date.now()}`,
		onsessioninitialized: () => {
			// セッション保存は行わない（ステートレス）
			logger.debug("Session initialized (stateless mode)");
		},
	});

	const server = new Server(
		{
			name: "mcp-server-zendesk",
			version: "0.1.0",
		},
		{
			capabilities: { tools: {} },
		},
	);

	// エラーハンドラー設定
	setupErrorHandlers(server, logger);

	// ツール登録
	setupTools(server, logger);

	return { server, transport };
}

/**
 * HonoコンテキストからMCPリクエスト用のモックオブジェクトを作成
 */
export function createMockRequestResponse(
	c: Context,
	body: unknown,
): {
	mockReq: { body: unknown; headers: Record<string, string>; method: string };
	mockRes: MockResponse;
} {
	const mockReq = {
		body,
		headers: Object.fromEntries(c.req.raw.headers),
		method: "POST",
	};

	const mockRes = new MockResponse();

	return { mockReq, mockRes };
}

/**
 * MCPリクエストを処理し、HonoのResponseを返す
 */
export async function handleMcpRequest(
	c: Context,
	body: unknown,
	server: Server,
	transport: StreamableHTTPServerTransport,
): Promise<Response> {
	// サーバーとトランスポート接続
	await server.connect(transport);

	try {
		const { mockReq, mockRes } = createMockRequestResponse(c, body);

		// MCPリクエスト処理
		// @ts-expect-error - StreamableHTTPServerTransportの型定義が厳密すぎるため
		await transport.handleRequest(mockReq, mockRes, body);

		// レスポンス返却
		const statusCode = mockRes.getStatusCode();
		const responseBody = mockRes.getBody();

		// ステータスコードを設定（200以外の場合のみ）
		if (statusCode !== 200) {
			c.status(statusCode as any);
		}

		// JSONレスポンスを返却
		return c.json(responseBody as any);
	} finally {
		// リソースクリーンアップ（即座に実行）
		await transport.close();
	}
}

/**
 * MCPエラーレスポンスを生成
 */
export function createMcpErrorResponse(c: Context, error: unknown): Response {
	return c.json(
		{
			jsonrpc: "2.0",
			error: {
				code: -32603,
				message: error instanceof Error ? error.message : "Internal server error",
			},
			id: null,
		},
		{ status: 500 },
	);
}
