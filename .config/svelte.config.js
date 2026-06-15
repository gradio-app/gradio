import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
	preprocess: vitePreprocess(),
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
