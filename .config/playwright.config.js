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
	testMatch: /.*.spec.ts/,
	testDir: "..",
	workers: process.env.CI ? 1 : undefined
});

const normal = defineConfig(base, {
	expect: { timeout: 15000 },
	timeout: 15000,
	globalSetup: "./playwright-setup.js"
});
normal.projects = undefined; // Explicitly unset this field due to https://github.com/microsoft/playwright/issues/28795

const lite = defineConfig(base, {
	webServer: {
		command: "python -m http.server 8000 --directory ../js/lite",
		url: "http://localhost:8000/",
		reuseExistingServer: !process.env.CI
	},
	testIgnore: [
		"**/audio_component_events.spec.ts", // Uploading a file requires ffprobe on the server-side, which is not supported in lite.
		"**/cancel_events.spec.ts", // This sample app uses `time.sleep` which is not supported on Pyodide.
		"**/custom_css.spec.ts", // Media queries is not working somehow.
		"**/clear_components.spec.ts", // `gr.Image()` with remote image is not supported in lite because it calls `httpx.stream` through `processing_utils.save_url_to_cache()`.
		"**/load_space.spec.ts", // `gr.load()`, which calls `httpx.get` is not supported in lite.
		"**/gradio_pdf_demo.spec.ts", // The PDF component is not working on Lite, https://github.com/gradio-app/gradio/issues/7476
		"**/file_explorer_component_events.spec.ts",
		"**/gallery_component_events.spec.ts",
		"**/queue_full_e2e_test.spec.ts"
	],
	expect: { timeout: 60000 },
	timeout: 60000,
	workers: 1
});
lite.projects = undefined; // Explicitly unset this field due to https://github.com/microsoft/playwright/issues/28795

export default !!process.env.GRADIO_E2E_TEST_LITE ? lite : normal;
