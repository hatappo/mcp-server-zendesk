import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		typecheck: {
			tsconfig: "./tsconfig.test.json",
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "dist/", "*.config.ts"],
		},
	},
});