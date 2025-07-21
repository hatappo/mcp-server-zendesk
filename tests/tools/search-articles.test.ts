import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleSearchArticles, searchArticlesTool } from "../../src/tools/search-articles.ts";

// Mock Zendesk client
const mockSearchArticles = vi.fn();
vi.mock("../../src/utils/zendesk-client.ts", () => ({
	getZendeskClient: vi.fn(() => ({
		helpcenter: {
			search: {
				searchArticles: mockSearchArticles,
			},
		},
	})),
}));

describe("Search Articles Tool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("searchArticlesTool definition", () => {
		it("should have correct tool definition", () => {
			expect(searchArticlesTool.name).toBe("search_articles");
			expect(searchArticlesTool.description).toBe("Search for public articles in Zendesk Help Center");
			expect(searchArticlesTool.inputSchema.type).toBe("object");
			expect(searchArticlesTool.inputSchema.required).toEqual(["query"]);
		});
	});

	describe("handleSearchArticles", () => {
		it("should handle successful search", async () => {
			const mockResponse = {
				results: [
					{
						id: 1,
						title: "Test Article",
						html_url: "https://example.zendesk.com/hc/articles/1",
						body: "This is a test article content",
						created_at: "2023-01-01T00:00:00Z",
						updated_at: "2023-01-01T00:00:00Z",
					},
				],
			};

			mockSearchArticles.mockResolvedValue(mockResponse);

			const result = await handleSearchArticles({
				query: "test",
				locale: "en-us",
				per_page: 10,
				page: 1,
			});

			expect(result.content[0].type).toBe("text");
			const response = JSON.parse(result.content[0].text);
			expect(response.success).toBe(true);
			expect(response.count).toBe(1);
			expect(response.articles).toHaveLength(1);
			expect(response.articles[0].title).toBe("Test Article");
		});

		it("should handle validation errors", async () => {
			const result = await handleSearchArticles({
				// Missing required query parameter
				locale: "en-us",
			});

			expect(result.content[0].type).toBe("text");
			const response = JSON.parse(result.content[0].text);
			expect(response.success).toBe(false);
			expect(response.error).toContain("Required");
		});

		it("should handle API errors", async () => {
			mockSearchArticles.mockRejectedValue(
				new Error("API Error"),
			);

			const result = await handleSearchArticles({
				query: "test",
			});

			expect(result.content[0].type).toBe("text");
			const response = JSON.parse(result.content[0].text);
			expect(response.success).toBe(false);
			expect(response.error).toBe("API Error");
		});

		it("should truncate long article body", async () => {
			const longBody = "a".repeat(300);
			const mockResponse = {
				results: [
					{
						id: 1,
						title: "Test Article",
						html_url: "https://example.zendesk.com/hc/articles/1",
						body: longBody,
						created_at: "2023-01-01T00:00:00Z",
						updated_at: "2023-01-01T00:00:00Z",
					},
				],
			};

			mockSearchArticles.mockResolvedValue(mockResponse);

			const result = await handleSearchArticles({ query: "test" });

			const response = JSON.parse(result.content[0].text);
			expect(response.articles[0].body).toBe(`${"a".repeat(200)}...`);
		});
	});
});