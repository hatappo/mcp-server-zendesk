/**
 * StreamableHTTPServerTransport用のMockResponseクラス
 * Express.jsのResponseオブジェクトをモックする
 */
export class MockResponse {
	private body: unknown = {};
	private statusCode = 200;
	private headers: Record<string, string> = {};

	/**
	 * JSONレスポンスを設定
	 */
	json(data: unknown): this {
		this.body = data;
		this.headers["Content-Type"] = "application/json";
		return this;
	}

	/**
	 * ステータスコードを設定
	 */
	status(code: number): this {
		this.statusCode = code;
		return this;
	}

	/**
	 * レスポンスボディを設定
	 */
	send(data: unknown): this {
		this.body = data;
		return this;
	}

	/**
	 * レスポンスヘッダーを設定
	 */
	setHeader(name: string, value: string): void {
		this.headers[name] = value;
	}

	/**
	 * レスポンスボディを取得
	 */
	getBody(): unknown {
		return this.body;
	}

	/**
	 * ステータスコードを取得
	 */
	getStatusCode(): number {
		return this.statusCode;
	}

	/**
	 * レスポンスヘッダーを取得
	 */
	getHeaders(): Record<string, string> {
		return this.headers;
	}
}
