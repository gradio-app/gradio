const ts = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

const ts_rules_disabled = Object.keys(ts.rules).reduce(
	(acc, rule) => ({
		...acc,
		[`@typescript-eslint/${rule}`]: "off"
	}),
	{}
);

const js_rules_disabled = Object.keys(js.configs.all.rules).reduce(
	(acc, rule) => ({
		...acc,
		[`${rule}`]: "off"
	}),
	{}
);

module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "./tsconfig.json",
		extraFileExtensions: [".svelte"] // This is a required setting in `@typescript-eslint/parser` v4.24.0.
	},
	env: {
		browser: true,
		node: true
	},
	overrides: [
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
			// Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
			parserOptions: {
				parser: "@typescript-eslint/parser"
			}
		}
	],
	extends: [
		// add more generic rule sets here, such as:
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:svelte/recommended"
	],
	rules: {
		...ts_rules_disabled,
		...js_rules_disabled,
		"no-console": [2, { allow: ["warn", "error"] }],
		"no-constant-condition": 2,
		"no-dupe-args": 2,
		"no-extra-boolean-cast": 2,
		"no-unexpected-multiline": 2,
		"no-unreachable": 2,
		"valid-jsdoc": 2,
		"array-callback-return": 2,
		complexity: 2,
		"no-else-return": 2,
		"no-useless-return": 2,
		"no-shadow": 2,
		"no-undef": 2,
		"@typescript-eslint/adjacent-overload-signatures": 2,
		"@typescript-eslint/explicit-function-return-type": 2,
		"@typescript-eslint/consistent-type-exports": 2,
		"@typescript-eslint/ban-types": 2,
		"@typescript-eslint/array-type": 2,
		"@typescript-eslint/no-inferrable-types": 2

		// override/add rules settings here, such as:
		// 'svelte/rule-name': 'error'
	}
};
