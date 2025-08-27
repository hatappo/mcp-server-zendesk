import { AsyncLocalStorage } from "node:async_hooks";
import type { Logger } from "pino";
import type { AuthContext } from "./auth-context.js";

export interface RequestContext {
	authContext: AuthContext;
	logger: Logger;
}

/**
 * リクエストスコープのコンテキスト管理
 * Node.js の AsyncLocalStorage を使用してリクエスト毎のコンテキストを管理
 */
class RequestContextManager {
	private asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

	/**
	 * リクエストコンテキストを設定して関数を実行
	 */
	run<T>(context: RequestContext, fn: () => Promise<T>): Promise<T> {
		return this.asyncLocalStorage.run(context, fn);
	}

	/**
	 * 現在のリクエストコンテキストを取得
	 */
	getCurrentContext(): RequestContext | undefined {
		return this.asyncLocalStorage.getStore();
	}

	/**
	 * 現在の認証コンテキストを取得
	 */
	getCurrentAuthContext(): AuthContext {
		const context = this.getCurrentContext();
		if (!context) {
			throw new Error("No request context found. This function must be called within a request scope.");
		}
		return context.authContext;
	}

	/**
	 * 現在のロガーを取得
	 */
	getCurrentLogger(): Logger {
		const context = this.getCurrentContext();
		if (!context) {
			throw new Error("No request context found. This function must be called within a request scope.");
		}
		return context.logger;
	}
}

// シングルトンインスタンス
export const requestContext = new RequestContextManager();
