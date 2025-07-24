#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv-flow";
import { setupTools } from "./tools/index.ts";
import { setupErrorHandlers } from "./utils/error-handler.ts";
import { setupLogger } from "./utils/logger.ts";

dotenv.config();

const logger = setupLogger();

async function main() {
	try {
		logger.info("Starting MCP Zendesk Server...");

		const server = new Server(
			{
				name: "mcp-server-zendesk",
				version: "0.1.0",
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		setupErrorHandlers(server, logger);
		setupTools(server, logger);

		const transport = new StdioServerTransport();
		await server.connect(transport);

		logger.info("MCP Zendesk Server started successfully");
	} catch (error) {
		logger.error({ error }, "Failed to start MCP Zendesk Server");
		process.exit(1);
	}
}

try {
	await main();
} catch (error) {
	console.error("Unhandled error:", error);
	process.exit(1);
}
