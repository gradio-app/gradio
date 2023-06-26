import type { StorybookConfig } from "@storybook/svelte-vite";
const config: StorybookConfig = {
	stories: [
		"../**/*.mdx",
		"../**/*.stories.mdx",
		"../**/*.stories.@(js|jsx|ts|tsx|svelte)"
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-svelte-csf"
	],
	framework: {
		name: "@storybook/svelte-vite",
		options: {}
	},
	docs: {
		autodocs: "tag"
	}
};
export default config;
