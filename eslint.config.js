import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
	{
		files: [
			"src/**/*.js",
			"src/**/*.jsx",
			"src/**/*.ts",
			"src/**/*.tsx",
			"test/**/*.js",
			"test/**/*.jsx",
			"test/**/*.ts",
			"test/**/*.tsx",
			"*.js",
			"*.ts",
		],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			import: importPlugin,
		},
		rules: {
			// 🔢 各行の import 文の並び順（モジュールグループごとに並べる）
			"import/order": [
				"error",
				{
					groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
					alphabetize: { order: "asc", caseInsensitive: true },
					"newlines-between": "always",
				},
			],
			// 🔡 import の中のメンバー順（{ b, a } を { a, b } に）
			"sort-imports": [
				"error",
				{
					ignoreCase: true,
					ignoreDeclarationSort: true, // 行レベルの順序は import/order に任せる
					ignoreMemberSort: false,
				},
			],
		},
	},
]);
