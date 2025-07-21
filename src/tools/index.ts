import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Logger } from "pino";
import { createTicketTool, handleCreateTicket } from "./create-ticket.ts";
import { handleSearchArticles, searchArticlesTool } from "./search-articles.ts";

export function setupTools(server: Server, logger: Logger): void {
	logger.info("Setting up tools...");

	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return {
			tools: [searchArticlesTool, createTicketTool],
		};
	});

	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args } = request.params;

		switch (name) {
			case "search_articles":
				return await handleSearchArticles(args);
			case "create_ticket":
				return await handleCreateTicket(args);
			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	});

	logger.info("Tools setup completed");
}
