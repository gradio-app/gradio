import { mergeConfig } from "vite";
import turbosnap from "vite-plugin-turbosnap";

const config = {
	stories: ["./Introduction.mdx", "../js/**/*.@(mdx|stories.@(js|jsx|ts|tsx|svelte))"],
	addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "@storybook/addon-svelte-csf",
        "@storybook/addon-a11y",
        "@storybook/addon-mdx-gfm"
    ],
	framework: {
		name: "@storybook/svelte-vite",
		options: {
			builder: {
				viteConfigPath: ".storybook/vite.config.js"
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
								rootDir: `${process.cwd()}/storybook`
							})
						]
					: []
		});
	}
};
export default config;
