#!/usr/bin/env node
import dotenv from "dotenv-flow";
import { handleSearchArticles } from "../src/tools/search-articles.ts";

// 環境変数を読み込み
dotenv.config();

async function testSearchArticles() {
	console.log("🔍 Testing Zendesk Article Search...");

	try {
		const result = await handleSearchArticles({
			query: "アカウント",
			// locale: "ja-jp",
			per_page: 3,
			page: 1,
		});

		const response = JSON.parse(result.content[0].text);
		if (response.success) {
			console.log("✅ Article search successful!");
			console.log(`Found ${response.count} articles:`);
			response.articles.forEach((article: { title: string; url: string; body: string }, index: number) => {
				console.log(`  ${index + 1}. ${article.title}`);
				console.log(`     URL: ${article.url}`);
				console.log(`     Body: ${article.body}`);
				console.log("");
			});
		} else {
			console.log("❌ Article search failed:");
			console.log(`Error: ${response.error}`);
		}
	} catch (error) {
		console.error("❌ Article search error:", error);
	}
}

async function main() {
	console.log("🚀 Starting Zendesk API Integration Test\n");

	// 環境変数チェック
	const requiredEnvVars = ["ZENDESK_SUBDOMAIN", "ZENDESK_USERNAME", "ZENDESK_API_TOKEN"];

	const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
	if (missingVars.length > 0) {
		console.error("❌ Missing required environment variables:");
		missingVars.forEach((varName) => {
			console.error(`  - ${varName}`);
		});
		console.error("\nPlease set these variables in your .env.local file.");
		process.exit(1);
	}

	console.log("✅ Environment variables configured");
	console.log(`Zendesk subdomain: ${process.env.ZENDESK_SUBDOMAIN}`);
	console.log(`Username: ${process.env.ZENDESK_USERNAME}`);
	console.log("");

	// 記事検索テスト
	await testSearchArticles();

	console.log("\n🏁 Integration test completed");
}

// スクリプトが直接実行された場合にのみmain関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("💥 Integration test failed:", error);
		process.exit(1);
	});
}
