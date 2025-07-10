import { z } from "zod";
import { getZendeskClient } from "../utils/zendesk-client.ts";

const SearchArticlesSchema = z.object({
	query: z.string().describe("Search query for articles"),
	locale: z.string().optional().default("ja-jp").describe("Locale for articles"),
	per_page: z.number().optional().default(10).describe("Number of results per page"),
	page: z.number().optional().default(1).describe("Page number"),
});

export const searchArticlesTool = {
	name: "search_articles",
	description: "Search for public articles in Zendesk Help Center",
	inputSchema: {
		type: "object",
		properties: {
			query: { type: "string", description: "Search query for articles" },
			locale: { type: "string", description: "Locale for articles", default: "en-us" },
			per_page: { type: "number", description: "Number of results per page", default: 10 },
			page: { type: "number", description: "Page number", default: 1 },
		},
		required: ["query"],
	},
};

export async function handleSearchArticles(args: any) {
	try {
		const validatedArgs = SearchArticlesSchema.parse(args);
		const client = getZendeskClient();

		const searchParams = {
			query: validatedArgs.query,
			locale: validatedArgs.locale,
			per_page: validatedArgs.per_page,
			page: validatedArgs.page,
		};

		const response = await client.helpcenter.search.searchArticles(searchParams);
		const articles = response.result?.results || [];

		const formattedArticles = articles.map((article: any) => ({
			id: article.id,
			title: article.title,
			url: article.html_url,
			body: article.body ? `${article.body.substring(0, 200)}...` : "",
			created_at: article.created_at,
			updated_at: article.updated_at,
		}));

		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
						{
							success: true,
							count: articles.length,
							page: validatedArgs.page,
							per_page: validatedArgs.per_page,
							articles: formattedArticles,
						},
						null,
						2,
					),
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : "Unknown error occurred",
						},
						null,
						2,
					),
				},
			],
		};
	}
}
