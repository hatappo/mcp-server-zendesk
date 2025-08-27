import pkg from "node-zendesk";
import type { Logger } from "pino";
import type { AuthContext } from "./auth-context.js";
import { AuthContextManager } from "./auth-context.js";

const { createClient } = pkg;

/**
 * 認証コンテキストベースでZendeskクライアントを作成
 * Lambda向けの最適化：キャッシュなし、リクエスト毎に新規作成
 */
export function getZendeskClient(authContext: AuthContext, logger: Logger): any {
	const authManager = AuthContextManager.getInstance(logger);
	const config = authManager.getZendeskClientConfig(authContext);

	logger.debug(
		{
			subdomain: config.subdomain,
			username: config.username,
			userEmail: authContext.userEmail,
			effectiveUsername: authContext.effectiveUsername,
		},
		"Creating Zendesk client for Lambda request",
	);

	// リクエスト毎にクライアントを新規作成（ステートレス）
	return createClient({
		username: config.username,
		token: config.token,
		subdomain: config.subdomain,
		helpcenter: true,
	} as any);
}
