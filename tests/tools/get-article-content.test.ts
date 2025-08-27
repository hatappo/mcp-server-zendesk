import { describe, it, expect, vi } from "vitest";
import { handleGetArticleContent } from "../../src/tools/get-article-content.ts";
import { runWithMockContext, setupRequestContextMocks } from "../utils/test-helpers.js";

// Mock Zendesk client
const mockShow = vi.fn();
const mockShowWithLocale = vi.fn();
vi.mock("../../src/utils/zendesk-client.ts", () => ({
	getZendeskClient: vi.fn(() => ({
		helpcenter: {
			articles: {
				show: mockShow,
				showWithLocale: mockShowWithLocale,
			},
		},
	})),
}));

describe("handleGetArticleContent", () => {
	setupRequestContextMocks();

	it("should successfully retrieve an article by ID", async () => {
		const mockArticle = {
			id: 123456,
			title: "Sample Article",
			html_url: "https://example.zendesk.com/hc/en-us/articles/123456",
			body: "<p>This is the article content</p>",
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-02T00:00:00Z",
			author_id: 789,
			section_id: 456,
			promoted: false,
			position: 1,
			label_names: ["guide", "tutorial"],
			locale: "ja-jp",
		};

		mockShowWithLocale.mockResolvedValue({
			result: mockArticle,
		});

		const result = await runWithMockContext(async () => {
			return handleGetArticleContent({
				article_id: 123456,
				locale: "ja-jp",
			});
		});

		expect(mockShowWithLocale).toHaveBeenCalledWith("ja-jp", 123456);
		expect(result.content[0].type).toBe("text");

		const response = JSON.parse(result.content[0].text);
		expect(response.success).toBe(true);
		expect(response.article).toMatchObject({
			id: 123456,
			title: "Sample Article",
			url: "https://example.zendesk.com/hc/en-us/articles/123456",
			body: "<p>This is the article content</p>",
			locale: "ja-jp",
		});
	});

	it("should use default locale when not specified", async () => {
		const mockArticle = {
			id: 123456,
			title: "記事のタイトル",
			html_url: "https://example.zendesk.com/hc/ja/articles/123456",
			body: "<p>記事の内容</p>",
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-02T00:00:00Z",
			author_id: 789,
			section_id: 456,
			promoted: false,
			position: 1,
			label_names: [],
			locale: "ja",
		};

		mockShowWithLocale.mockResolvedValue({
			result: mockArticle,
		});

		const result = await runWithMockContext(async () => {
			return handleGetArticleContent({
				article_id: 123456,
			});
		});

		expect(mockShowWithLocale).toHaveBeenCalledWith("ja", 123456);
		const response = JSON.parse(result.content[0].text);
		expect(response.success).toBe(true);
		expect(response.article.locale).toBe("ja");
	});

	it("should handle article not found error", async () => {
		mockShowWithLocale.mockResolvedValue({
			result: null,
		});

		const result = await runWithMockContext(async () => {
			return handleGetArticleContent({
				article_id: 999999,
				locale: "ja",
			});
		});

		const response = JSON.parse(result.content[0].text);
		expect(response.success).toBe(false);
		expect(response.error).toBe("Article not found");
	});

	it("should handle API errors", async () => {
		mockShowWithLocale.mockRejectedValue(
			new Error("Failed to fetch article: API Error: Forbidden"),
		);

		const result = await runWithMockContext(async () => {
			return handleGetArticleContent({
				article_id: 123456,
				locale: "ja",
			});
		});

		const response = JSON.parse(result.content[0].text);
		expect(response.success).toBe(false);
		expect(response.error).toBe("Failed to fetch article: API Error: Forbidden");
	});

	it("should handle invalid input", async () => {
		const result = await runWithMockContext(async () => {
			return handleGetArticleContent({
				article_id: "not-a-number" as any,
			});
		});

		const response = JSON.parse(result.content[0].text);
		expect(response.success).toBe(false);
		expect(response.error).toContain("Expected number");
	});
});