#!/usr/bin/env node
import dotenv from "dotenv-flow";
import { handleGetArticleContent } from "../dist/tools/get-article-content.js";
import { handleSearchArticles } from "../dist/tools/search-articles.js";
import { setupLogger } from "../dist/utils/logger.js";
import { requestContext } from "../dist/utils/request-context.js";

// 環境変数を読み込み
dotenv.config();

// モックAuthContextを作成する関数
function createMockAuthContext(overrides = {}) {
	return {
		userEmail: "test@example.com",
		isUserEmailAllowed: true,
		effectiveUsername: "test@example.com",
		...overrides,
	};
}

async function main() {
	console.log("🚀 Starting Zendesk API Integration Test\n");

	// 環境変数チェック
	const requiredEnvVars = ["ZENDESK_SUBDOMAIN", "ZENDESK_USERNAME", "ZENDESK_API_TOKEN"];
	const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

	if (missingVars.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missingVars.join(", ")}\nPlease set these variables in your .env.local file.`,
		);
	}

	console.log("✅ Environment variables configured");
	console.log(`Zendesk subdomain: ${process.env.ZENDESK_SUBDOMAIN}`);
	console.log(`Username: ${process.env.ZENDESK_USERNAME}`);
	console.log("");

	// リクエストコンテキストを作成
	const logger = setupLogger();
	const authContext = createMockAuthContext({
		effectiveUsername: process.env.ZENDESK_USERNAME,
	});

	// 記事検索テスト
	console.log("🔍 Testing Zendesk Article Search...");

	const searchResult = await requestContext.run({ authContext, logger }, async () => {
		return handleSearchArticles({
			query: "PJMO",
			per_page: 3,
			page: 1,
		});
	});

	const searchResponse = JSON.parse(searchResult.content[0].text);

	if (!searchResponse.success) {
		throw new Error(`Article search failed: ${searchResponse.error}`);
	}

	console.log("✅ Article search successful!");
	console.log(`Found ${searchResponse.count} articles:`);

	searchResponse.articles.forEach((article, index) => {
		console.log(`  ${index + 1}. ${article.title}`);
		console.log(`     URL: ${article.url}`);
		console.log(`     Body: ${article.body}`);
		console.log("");
	});

	// 検索結果から最初の記事IDを取得して記事内容取得をテスト
	if (searchResponse.articles.length > 0) {
		const firstArticleId = searchResponse.articles[0].id;
		console.log(`\n📄 Testing Get Article Content for article ID: ${firstArticleId}...`);

		const contentResult = await requestContext.run({ authContext, logger }, async () => {
			return handleGetArticleContent({
				article_id: firstArticleId,
				locale: "ja",
			});
		});

		const contentResponse = JSON.parse(contentResult.content[0].text);

		if (!contentResponse.success) {
			throw new Error(`Article retrieval failed: ${contentResponse.error}`);
		}

		console.log("✅ Article retrieval successful!");
		console.log(`Title: ${contentResponse.article.title}`);
		console.log(`URL: ${contentResponse.article.url}`);
		console.log(`Body (first 200 chars): ${contentResponse.article.body?.substring(0, 200)}...`);
		console.log(`Created: ${contentResponse.article.created_at}`);
		console.log(`Updated: ${contentResponse.article.updated_at}`);
	} else {
		console.log("⚠️  No articles found in search results, skipping article content test");
	}

	console.log("\n✅ Integration test completed successfully");
}

// スクリプトが直接実行された場合にのみmain関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await main();
	} catch (error) {
		console.error("❌ Integration test failed:", error);
		process.exit(1);
	}
}
