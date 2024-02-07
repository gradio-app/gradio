import { defineConfig } from "@playwright/test";

const base = defineConfig({
	use: {
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
		permissions: ["clipboard-read", "clipboard-write", "microphone"],
		bypassCSP: true,
		launchOptions: {
			args: [
				"--disable-web-security",
				"--use-fake-device-for-media-stream",
				"--use-fake-ui-for-media-stream",
				"--use-file-for-fake-audio-capture=../gradio/test_data/test_audio.wav"
			]
		}
	},
	expect: { timeout: 15000 },
	timeout: 15000,
	testMatch: /.*.spec.ts/,
	testDir: "..",
	workers: process.env.CI ? 1 : undefined
});

const normal = defineConfig(base, {
	globalSetup: "./playwright-setup.js"
});
normal.projects = undefined; // Explicitly unset this field due to https://github.com/microsoft/playwright/issues/28795

const lite = defineConfig(base, {
	webServer: {
		command: "pnpm --filter @gradio/app dev:lite",
		url: "http://localhost:9876/lite.html",
		reuseExistingServer: !process.env.CI
	},
	testMatch: [
		"**/file_component_events.spec.ts",
		"**/chatbot_multimodal.spec.ts",
		"**/kitchen_sink.spec.ts"
	],
	// testIgnore: [
	// 	"**/chatbot_multimodal.spec.ts",
	// 	"**/cancel_events.spec.ts",
	// 	"**/clear_components.spec.ts", // `gr.Image()` with remote image is not supported in lite because it calls `httpx.stream` through `processing_utils.save_url_to_cache()`.
	// 	"**/load_space.spec.ts" // `gr.load()`, which calls `httpx.get` is not supported in lite.
	// ],
	workers: 1
});
lite.projects = undefined; // Explicitly unset this field due to https://github.com/microsoft/playwright/issues/28795

export default !!process.env.GRADIO_E2E_TEST_LITE ? lite : normal;
