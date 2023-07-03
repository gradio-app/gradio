/** @type { import('@storybook/svelte-vite').StorybookConfig } */
const config = {
	stories: ["../../**/*.mdx", "../../**/*.stories.@(js|jsx|ts|tsx|svelte)"],
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
	docs: {
		autodocs: true
	},
	staticDirs: ["./public"]
};
export default config;
