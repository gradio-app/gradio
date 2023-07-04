import type { StorybookConfig } from "@storybook/svelte-vite";

const turbosnap = require("vite-plugin-turbosnap");
const { mergeConfig } = require("vite");

const config: StorybookConfig = {
	stories: ["../../**/*.mdx", "../../**/*.stories.@(js|jsx|ts|tsx|svelte)"],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-svelte-csf",
		"@storybook/addon-a11y"
	],
	async viteFinal(viteConfig, { configType }) {
		return mergeConfig(config, {
			plugins:
				configType === "PRODUCTION"
					? [turbosnap({ rootDir: viteConfig.root ?? process.cwd() })]
					: []
		});
	},
	framework: {
		name: "@storybook/svelte-vite",
		options: {
			builder: {
				viteConfigPath: "js/storybook/vite.config.js"
			}
		}
	},
	docs: {
		autodocs: true
	},
	staticDirs: ["./public"]
};
export default config;
