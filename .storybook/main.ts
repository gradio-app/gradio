import type { StorybookConfig } from "@storybook/svelte-vite";
import { join, dirname } from "path";

const config: StorybookConfig = {
	stories: [
		"../js/!(dataframe-interim|_*|core)/*.stories.@(js|ts|svelte)",
		"../js/core/src/*.stories.@(js|ts|svelte)"
	],
	addons: [
		{
			name: "@storybook/addon-svelte-csf",
			options: {
				legacyTemplate: true
			}
		},
		"@storybook/addon-a11y",
		"@storybook/addon-docs"
	],
	framework: {
		name: "@storybook/svelte-vite",
		options: {
			builder: {
				viteConfigPath: join(dirname(import.meta.url.replace("file://", "")), "vite.config.ts")
			}
		}
	}
};

export default config;