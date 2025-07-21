import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupLogger } from "../../src/utils/logger.ts";

describe("Logger", () => {
	const originalEnv = process.env;

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should create a logger with default log level", () => {
		process.env = { ...originalEnv };
		delete process.env.LOG_LEVEL;

		const logger = setupLogger();
		expect(logger).toBeDefined();
		expect(logger.level).toBe("info");
	});

	it("should create a logger with custom log level", () => {
		process.env = { ...originalEnv, LOG_LEVEL: "debug" };

		const logger = setupLogger();
		expect(logger).toBeDefined();
		expect(logger.level).toBe("debug");
	});

	it("should create a logger for production environment", () => {
		process.env = { ...originalEnv, NODE_ENV: "production" };

		const logger = setupLogger();
		expect(logger).toBeDefined();
	});
});