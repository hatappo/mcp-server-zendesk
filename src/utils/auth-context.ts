import type { Logger } from "pino";

export interface AuthContext {
	userEmail?: string;
	isUserEmailAllowed: boolean;
	effectiveUsername: string;
}

export interface AuthContextOptions {
	userEmail?: string;
	logger: Logger;
}

/**
 * 認証コンテキストを管理するクラス
 * リクエストごとのX-User-Emailヘッダーと環境変数の認証設定を管理
 */
export class AuthContextManager {
	private static instance: AuthContextManager;
	private logger: Logger;

	// 環境変数から取得する設定
	private readonly defaultUsername: string;
	private readonly defaultToken: string;
	private readonly defaultSubdomain: string;
	private readonly allowUserEmail: boolean;

	private constructor(logger: Logger) {
		this.logger = logger;

		// 環境変数の検証と取得
		this.defaultSubdomain = process.env.ZENDESK_SUBDOMAIN || "";
		this.defaultUsername = process.env.ZENDESK_USERNAME || "";
		this.defaultToken = process.env.ZENDESK_API_TOKEN || "";
		this.allowUserEmail = process.env.ZENDESK_ALLOW_USER_EMAIL === "true";

		this.validateEnvironmentVariables();
	}

	public static getInstance(logger: Logger): AuthContextManager {
		if (!AuthContextManager.instance) {
			AuthContextManager.instance = new AuthContextManager(logger);
		}
		return AuthContextManager.instance;
	}

	private validateEnvironmentVariables(): void {
		const missing: string[] = [];

		if (!this.defaultSubdomain) missing.push("ZENDESK_SUBDOMAIN");
		if (!this.defaultUsername) missing.push("ZENDESK_USERNAME");
		if (!this.defaultToken) missing.push("ZENDESK_API_TOKEN");

		if (missing.length > 0) {
			throw new Error(
				`Missing required Zendesk configuration: ${missing.join(", ")}. Please set these environment variables.`,
			);
		}

		this.logger.info(
			{
				subdomain: this.defaultSubdomain,
				username: this.defaultUsername,
				allowUserEmail: this.allowUserEmail,
			},
			"Zendesk configuration loaded",
		);
	}

	/**
	 * リクエストから認証コンテキストを作成
	 */
	createAuthContext(options: AuthContextOptions): AuthContext {
		const { userEmail } = options;

		// ユーザーメールが許可されていて、かつヘッダーに含まれている場合
		const shouldUseUserEmail = this.allowUserEmail && userEmail;

		const context: AuthContext = {
			userEmail,
			isUserEmailAllowed: this.allowUserEmail,
			effectiveUsername: shouldUseUserEmail ? userEmail : this.defaultUsername,
		};

		this.logger.debug(
			{
				userEmail,
				effectiveUsername: context.effectiveUsername,
				isUserEmailAllowed: context.isUserEmailAllowed,
			},
			"Created auth context",
		);

		return context;
	}

	/**
	 * 認証コンテキストからZendeskクライアント設定を生成
	 */
	getZendeskClientConfig(context: AuthContext): {
		subdomain: string;
		username: string;
		token: string;
		helpcenter: boolean;
	} {
		return {
			subdomain: this.defaultSubdomain,
			username: `${context.effectiveUsername}/token`,
			token: this.defaultToken,
			helpcenter: true,
		};
	}

	/**
	 * チケット作成時のリクエスタメール設定を取得
	 */
	getRequesterEmail(context: AuthContext, explicitRequesterEmail?: string): string | undefined {
		// 明示的にリクエスタメールが指定されている場合は、それを優先
		if (explicitRequesterEmail) {
			this.logger.debug({ explicitRequesterEmail }, "Using explicitly provided requester email");
			return explicitRequesterEmail;
		}

		// ユーザーメールが許可されていて、かつ提供されている場合
		if (context.isUserEmailAllowed && context.userEmail) {
			this.logger.debug({ userEmail: context.userEmail }, "Using user email as requester email");
			return context.userEmail;
		}

		// それ以外の場合は未設定（Zendeskのデフォルト動作に依存）
		this.logger.debug("No requester email set, using Zendesk default");
		return undefined;
	}

	/**
	 * 設定情報をログ出力用に取得
	 */
	getConfigInfo(): {
		subdomain: string;
		defaultUsername: string;
		allowUserEmail: boolean;
	} {
		return {
			subdomain: this.defaultSubdomain,
			defaultUsername: this.defaultUsername,
			allowUserEmail: this.allowUserEmail,
		};
	}
}
