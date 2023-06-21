const ts = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

const ts_rules_disabled = Object.fromEntries(
	Object.keys(ts.rules).map((rule) => [`@typescript-eslint/${rule}`, "off"])
);
const js_rules_disabled = Object.fromEntries(
	Object.keys(js.configs.all.rules).map((rule) => [rule, "off"])
);

console.log(js_rules_disabled, ts_rules_disabled);
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
			parserOptions: {
				parser: "@typescript-eslint/parser"
			}
		},
		{
			// This is a little tedious but the tsconfig are different for whatever reason
			// We will make them the same (and fix the errors) so we can remove this
			files: ["*client/js/**/*"],
			parserOptions: {
				project: "./client/js//tsconfig.json"
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
		// we want the rules available but we want them mostly switched off
		...ts_rules_disabled,
		...js_rules_disabled,
		"no-console": ["error", { allow: ["warn", "error"] }],
		"no-constant-condition": "error",
		"no-dupe-args": "error",
		"no-extra-boolean-cast": "error",
		"no-unexpected-multiline": "error",
		"no-unreachable": "error",
		"valid-jsdoc": "error",
		"array-callback-return": "error",
		complexity: "error",
		"no-else-return": "error",
		"no-useless-return": "error",
		"no-shadow": "error",
		"no-undef": "error",
		"@typescript-eslint/adjacent-overload-signatures": "error",
		"@typescript-eslint/explicit-function-return-type": "error",
		"@typescript-eslint/consistent-type-exports": "error",
		"@typescript-eslint/ban-types": "error",
		"@typescript-eslint/array-type": "error",
		"@typescript-eslint/no-inferrable-types": "error"

		// override/add rules settings here, such as:
		// 'svelte/rule-name': 'error'
	}
};
