import type { StorybookConfig } from "@storybook/svelte-vite";
import { mergeConfig } from "vite";
import turbosnap from "vite-plugin-turbosnap";

const config: StorybookConfig = {
	stories: [
		"../../js/**/*.mdx",
		"../../js/**/*.@(mdx|stories.@(js|jsx|ts|tsx|svelte))"
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-svelte-csf",
		"@storybook/addon-a11y",
		"@chromatic-com/storybook"
	],
	framework: {
		name: "@storybook/svelte-vite",
		options: {
			builder: {
				viteConfigPath: "js/storybook/vite.config.js"
			}
		}
	},
	staticDirs: ["./public"],
	async viteFinal(config, { configType }) {
		return mergeConfig(config, {
			plugins:
				configType === "PRODUCTION"
					? [
							turbosnap({
								rootDir: `${process.cwd()}/js/storybook`
							})
						]
					: []
		});
	},
	docs: {}
};
export default config;
