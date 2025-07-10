import type { Logger } from "pino";
import pino from "pino";

export function setupLogger(): Logger {
	const logLevel = process.env.LOG_LEVEL || "info";
	const isDevelopment = process.env.NODE_ENV !== "production";

	const logger = pino({
		level: logLevel,
		transport: isDevelopment
			? {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss Z",
						ignore: "pid,hostname",
					},
				}
			: undefined,
		formatters: {
			level: (label) => {
				return { level: label };
			},
		},
	});

	return logger;
}

export type { Logger };
