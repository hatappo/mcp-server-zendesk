import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getZendeskClient } from "../../src/utils/zendesk-client.ts";
import { createMockAuthContext } from "./test-helpers.js";
import { setupLogger } from "../../src/utils/logger.js";

// Mock node-zendesk
vi.mock("node-zendesk", () => ({
	default: {
		createClient: vi.fn(),
	},
}));

// Mock auth context manager
vi.mock("../../src/utils/auth-context.ts", () => ({
	AuthContextManager: {
		getInstance: vi.fn(() => ({
			getZendeskClientConfig: vi.fn((authContext) => ({
				subdomain: "test-subdomain",
				username: authContext.effectiveUsername,
				token: "test-token",
			})),
		})),
	},
}));

describe("Zendesk Client", () => {
	const originalEnv = process.env;
	let logger: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		process.env = {
			...originalEnv,
			ZENDESK_SUBDOMAIN: "test-subdomain",
			ZENDESK_USERNAME: "test@example.com",
			ZENDESK_API_TOKEN: "test-token",
			ZENDESK_ALLOW_USER_EMAIL: "true",
		};
		logger = setupLogger();

		// Get the mocked createClient function and set its return value
		const nodeZendesk = await import("node-zendesk");
		const mockCreateClient = nodeZendesk.default.createClient as any;
		mockCreateClient.mockImplementation(() => ({
			helpcenter: {
				search: {
					searchArticles: vi.fn(),
				},
				articles: {
					show: vi.fn(),
					showWithLocale: vi.fn(),
				},
			},
			tickets: {
				create: vi.fn(),
			},
		}));
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should create a Zendesk client with correct configuration", async () => {
		const authContext = createMockAuthContext({
			effectiveUsername: "test@example.com",
		});

		const client = getZendeskClient(authContext, logger);
		
		expect(client).toBeDefined();
		
		const nodeZendesk = await import("node-zendesk");
		const mockCreateClient = nodeZendesk.default.createClient as any;
		expect(mockCreateClient).toHaveBeenCalledWith({
			username: "test@example.com",
			token: "test-token",
			subdomain: "test-subdomain",
			helpcenter: true,
		});
	});

	it("should create new client instance for each request (stateless)", async () => {
		const authContext = createMockAuthContext({
			effectiveUsername: "test@example.com",
		});

		const client1 = getZendeskClient(authContext, logger);
		const client2 = getZendeskClient(authContext, logger);
		
		// ステートレス実装では毎回新しいクライアントを作成
		expect(client1).toBeDefined();
		expect(client2).toBeDefined();
		
		const nodeZendesk = await import("node-zendesk");
		const mockCreateClient = nodeZendesk.default.createClient as any;
		expect(mockCreateClient).toHaveBeenCalledTimes(2);
	});

	it("should create clients with correct configuration for different users", async () => {
		const authContext1 = createMockAuthContext({
			effectiveUsername: "user1@example.com",
		});
		const authContext2 = createMockAuthContext({
			effectiveUsername: "user2@example.com",
		});

		const client1 = getZendeskClient(authContext1, logger);
		const client2 = getZendeskClient(authContext2, logger);
		
		expect(client1).toBeDefined();
		expect(client2).toBeDefined();
		
		const nodeZendesk = await import("node-zendesk");
		const mockCreateClient = nodeZendesk.default.createClient as any;
		expect(mockCreateClient).toHaveBeenCalledTimes(2);
		
		// 最初のクライアント作成
		expect(mockCreateClient).toHaveBeenNthCalledWith(1, {
			username: "user1@example.com",
			token: "test-token",
			subdomain: "test-subdomain",
			helpcenter: true,
		});
		
		// 2番目のクライアント作成
		expect(mockCreateClient).toHaveBeenNthCalledWith(2, {
			username: "user2@example.com",
			token: "test-token",
			subdomain: "test-subdomain",
			helpcenter: true,
		});
	});
});