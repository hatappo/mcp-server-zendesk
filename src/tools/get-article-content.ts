import { z } from "zod";
import { requestContext } from "../utils/request-context.js";
import { getZendeskClient } from "../utils/zendesk-client.js";

const GetArticleContentSchema = z.object({
	article_id: z.number().describe("The ID of the article to retrieve"),
	locale: z.string().optional().default("ja").describe("Locale for the article"),
});

export const getArticleContentTool = {
	name: "get_article_content",
	description: "Get the full content of a specific article from Zendesk Help Center",
	inputSchema: {
		type: "object",
		properties: {
			article_id: { type: "number", description: "The ID of the article to retrieve" },
			locale: { type: "string", description: "Locale for the article", default: "ja" },
		},
		required: ["article_id"],
	},
};

export async function handleGetArticleContent(args: any) {
	try {
		const validatedArgs = GetArticleContentSchema.parse(args);

		// リクエストコンテキストから認証情報とロガーを取得
		const authContext = requestContext.getCurrentAuthContext();
		const logger = requestContext.getCurrentLogger();

		// 認証コンテキストを使用してZendeskクライアントを取得
		const client = getZendeskClient(authContext, logger);

		logger.info(
			{
				article_id: validatedArgs.article_id,
				locale: validatedArgs.locale,
			},
			"Retrieving Zendesk article content",
		);

		// Get article using the node-zendesk client
		// The API path is: /api/v2/help_center/{locale}/articles/{article_id}
		const response = validatedArgs.locale
			? await client.helpcenter.articles.showWithLocale(validatedArgs.locale, validatedArgs.article_id)
			: await client.helpcenter.articles.show(validatedArgs.article_id);

		// node-zendesk returns data in response.result
		const article = response?.result || response;

		if (!article || !article.id) {
			throw new Error("Article not found");
		}

		const formattedArticle = {
			id: article.id,
			title: article.title,
			url: article.html_url || article.url,
			body: article.body,
			created_at: article.created_at,
			updated_at: article.updated_at,
			author_id: article.author_id,
			section_id: article.section_id,
			promoted: article.promoted,
			position: article.position,
			label_names: article.label_names,
			locale: article.locale,
		};

		logger.info(
			{
				article_id: article.id,
				title: article.title,
				locale: article.locale,
			},
			"Zendesk article content retrieved successfully",
		);

		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
						{
							success: true,
							article: formattedArticle,
						},
						null,
						2,
					),
				},
			],
		};
	} catch (error) {
		const logger = requestContext.getCurrentLogger();
		logger.error(
			{
				error,
				article_id: args?.article_id,
				locale: args?.locale,
			},
			"Failed to retrieve Zendesk article content",
		);

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
