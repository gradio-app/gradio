import type { StorybookConfig } from "@storybook/svelte-vite";
import { mergeConfig } from "vite";
import turbosnap from "vite-plugin-turbosnap";

const config: StorybookConfig = {
	stories: [
		"../../js/**/*.mdx",
		"../../js/**/*.@(mdx|stories.@(js|jsx|ts|tsx|svelte))",
		"!../../js/**/dist/**"
	],

	addons: [
		"@storybook/addon-links",
		{
			name: "@storybook/addon-svelte-csf",
			options: {
				legacyTemplate: true
			}
		},
		"@storybook/addon-a11y",
		"@chromatic-com/storybook",
		"@storybook/addon-docs"
	],

	framework: {
		name: "@storybook/svelte-vite",
		options: {
			builder: {
				viteConfigPath: "js/storybook/vite.config.js",
				lazyCompilation: false
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
	}
};
export default config;
