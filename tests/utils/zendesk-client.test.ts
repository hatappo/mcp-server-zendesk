import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getZendeskClient } from "../../src/utils/zendesk-client.ts";

// Mock node-zendesk
vi.mock("node-zendesk", () => ({
	default: {
		createClient: vi.fn(() => ({
			helpcenter: {
				search: {
					searchArticles: vi.fn(),
				},
			},
			tickets: {
				create: vi.fn(),
			},
		})),
	},
}));

describe("Zendesk Client", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = {
			...originalEnv,
			ZENDESK_SUBDOMAIN: "test-subdomain",
			ZENDESK_USERNAME: "test@example.com",
			ZENDESK_API_TOKEN: "test-token",
		};
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.clearAllMocks();
	});

	it("should create a Zendesk client with correct configuration", () => {
		const client = getZendeskClient();
		expect(client).toBeDefined();
	});

	it("should throw error when environment variables are missing", () => {
		// Reset modules to clear the client cache
		vi.resetModules();
		process.env = {};

		const { getZendeskClient } = require("../../src/utils/zendesk-client.ts");
		expect(() => getZendeskClient()).toThrow(
			"Missing required Zendesk configuration",
		);
	});

	it("should reuse existing client instance", () => {
		const client1 = getZendeskClient();
		const client2 = getZendeskClient();
		expect(client1).toBe(client2);
	});
});