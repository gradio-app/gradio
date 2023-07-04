import type { StorybookConfig } from "@storybook/svelte-vite";
import turbosnap from "vite-plugin-turbosnap";
import { mergeConfig } from "vite";

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
