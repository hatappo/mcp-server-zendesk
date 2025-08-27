import { vi, beforeEach } from "vitest";
import { setupLogger } from "../../src/utils/logger.js";
import type { AuthContext } from "../../src/utils/auth-context.js";
import type { RequestContext } from "../../src/utils/request-context.js";

/**
 * テスト用のモックAuthContextを作成
 */
export function createMockAuthContext(overrides?: Partial<AuthContext>): AuthContext {
	return {
		userEmail: "test@example.com",
		isUserEmailAllowed: true,
		effectiveUsername: "test@example.com",
		...overrides,
	};
}

/**
 * テスト用のモックRequestContextを作成
 */
export function createMockRequestContext(
	authContext?: AuthContext,
): RequestContext {
	return {
		authContext: authContext || createMockAuthContext(),
		logger: setupLogger(),
	};
}

/**
 * リクエストコンテキストをモックし、テスト実行をラップするヘルパー
 */
export async function runWithMockContext<T>(
	fn: () => Promise<T>,
	context?: RequestContext,
): Promise<T> {
	const requestContext = await import("../../src/utils/request-context.js");
	const mockContext = context || createMockRequestContext();
	
	return requestContext.requestContext.run(mockContext, fn);
}

/**
 * リクエストコンテキストのモックを設定するためのテストセットアップヘルパー
 */
export function setupRequestContextMocks() {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
		
		// 環境変数を設定
		vi.stubEnv("ZENDESK_SUBDOMAIN", "test-subdomain");
		vi.stubEnv("ZENDESK_USERNAME", "test@example.com");
		vi.stubEnv("ZENDESK_API_TOKEN", "test-token");
		vi.stubEnv("ZENDESK_ALLOW_USER_EMAIL", "true");
	});
}