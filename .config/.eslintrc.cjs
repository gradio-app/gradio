const ts = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

const ts_rules_disabled = Object.fromEntries(
	Object.keys(ts.rules).map((rule) => [`@typescript-eslint/${rule}`, "off"])
);
const js_rules_disabled = Object.fromEntries(
	Object.keys(js.configs.all.rules).map((rule) => [rule, "off"])
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
		// we want the rules available but we want thtme mostly switched off
		...ts_rules_disabled,
		...js_rules_disabled,
		"no-console": ["off", { allow: ["warn", "error"] }],
		"no-constant-condition": "off",
		"no-dupe-args": "off",
		"no-extra-boolean-cast": "off",
		"no-unexpected-multiline": "off",
		"no-unreachable": "off",
		"valid-jsdoc": "off",
		"array-callback-return": "off",
		complexity: "off",
		"no-else-return": "off",
		"no-useless-return": "off",
		"no-shadow": "off",
		"no-undef": "off",
		"@typescript-eslint/adjacent-overload-signatures": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/consistent-type-exports": "off",
		"@typescript-eslint/ban-types": "off",
		"@typescript-eslint/array-type": "off",
		"@typescript-eslint/no-inferrable-types": "off"

		// override/add rules settings here, such as:
		// 'svelte/rule-name': 'error'
	}
};
