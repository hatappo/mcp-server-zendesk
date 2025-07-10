import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Logger } from "pino";

export function setupErrorHandlers(server: Server, logger: Logger): void {
	server.onerror = (error) => {
		logger.error({ error }, "Server error occurred");
	};

	process.on("SIGINT", async () => {
		logger.info("Received SIGINT, shutting down gracefully...");
		await server.close();
		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		logger.info("Received SIGTERM, shutting down gracefully...");
		await server.close();
		process.exit(0);
	});

	process.on("uncaughtException", (error) => {
		logger.fatal({ error }, "Uncaught exception");
		process.exit(1);
	});

	process.on("unhandledRejection", (error) => {
		logger.fatal({ error }, "Unhandled rejection");
		process.exit(1);
	});
}
