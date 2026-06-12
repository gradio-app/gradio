import type { StorybookConfig } from "@storybook/svelte-vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";

const config: StorybookConfig = {
	stories: [
		"../js/storybook/**/*.mdx",
		"../js/!(dataframe|dataframe-interim|core)/*.stories.svelte",
		"../js/!(dataframe|dataframe-interim|core)/src/**/*.stories.svelte"
	],
	staticDirs: ["../js/spa/public", "../js/storybook/public", "./test_files"],
	addons: [
		{
			name: "@storybook/addon-svelte-csf",
			options: {
				legacyTemplate: true
			}
		},
		"@chromatic-com/storybook",
		"@storybook/addon-vitest",
		"@storybook/addon-a11y",
		"@storybook/addon-docs"
	],
	framework: "@storybook/svelte-vite",
	async viteFinal(config) {
		config.plugins = (config.plugins || []).filter((plugin) => {
			const name = Array.isArray(plugin) ? undefined : (plugin as any)?.name;
			return (
				name !== "storybook:svelte-docgen-plugin" &&
				name !== "vite-plugin-svelte"
			);
		});

		config.plugins.unshift(
			svelte({
				configFile: false,
				// configFile:false means the project's svelte.config.js (and its
				// preprocessing) isn't loaded, so enable TS preprocessing here —
				// matching the main app's config. Without it, Svelte's built-in
				// parser chokes on TS generics in a class `extends` clause
				// (e.g. `extends Gradio<A, B>`).
				preprocess: [vitePreprocess(), sveltePreprocess()],
				// Disabled so workspace @gradio/* .svelte sources go through this
				// (preprocessed) plugin rather than being esbuild-prebundled without
				// preprocessing — the prebundle path can't strip TS generics in a
				// class `extends` clause and fails to parse on Svelte 5.48.
				prebundleSvelteLibraries: false,
				dynamicCompileOptions({ filename }) {
					// Process @storybook/svelte files from node_modules
					if (filename.includes("node_modules/@storybook/svelte")) {
						return { generate: "client" };
					}
				}
			})
		);

		config.resolve = config.resolve || {};
		config.resolve.conditions = [
			"gradio",
			"browser",
			"import",
			"module",
			"default"
		];

		config.optimizeDeps = config.optimizeDeps || {};
		config.optimizeDeps.include = [
			...(config.optimizeDeps.include || []),
			"@storybook/svelte"
		];
		config.optimizeDeps.exclude = [
			...(config.optimizeDeps.exclude || []),
			"@gradio/utils",
			"@gradio/theme"
		];

		return config;
	}
};
export default config;
