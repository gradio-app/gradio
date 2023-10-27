import type { StorybookConfig } from "@storybook/svelte-vite";

const config: StorybookConfig = {
	stories: [
		"../../js/**/*.mdx",
		"../../js/**/*.stories.@(js|jsx|ts|tsx|svelte|mdx)"
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-svelte-csf",
		"@storybook/addon-a11y"
	],
	framework: {
		name: "@storybook/svelte-vite",
		options: {
			builder: {
				viteConfigPath: "js/storybook/vite.config.js"
			}
		}
	},
	staticDirs: ["./public"]
};
export default config;
