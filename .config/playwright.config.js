import { defineConfig, devices } from "@playwright/test";

const base = defineConfig({
	use: {
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
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
	expect: { timeout: 10000 },
	timeout: 30000,
	testMatch: /.*\.spec\.ts/,
	testDir: "..",
	workers: process.env.CI ? 1 : undefined,
	retries: 3
});

const normal = defineConfig(base, {
	globalSetup: process.env.CUSTOM_TEST ? undefined : "./playwright-setup.js",
	projects: [
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
			testMatch: /.stream_(audio|video)_out\.spec\.ts/
		},
		{
			name: "chrome",
			use: {
				...devices["Desktop Chrome"],
				permissions: ["clipboard-read", "clipboard-write", "microphone"]
			},
			testIgnore: /.stream_(audio|video)_out\.spec\.ts/
		}
	]
});

const lite = defineConfig(base, {
	webServer: {
		command: "python -m http.server 8000 --directory ../js/lite",
		url: "http://localhost:8000/",
		reuseExistingServer: !process.env.CI
	},
	testMatch: [
		// "**/file_component_events.spec.ts",
		"**/kitchen_sink.spec.ts",
		"**/gallery_component_events.spec.ts",
		"**/image_remote_url.spec.ts" // To detect the bugs on Lite fixed in https://github.com/gradio-app/gradio/pull/8011 and https://github.com/gradio-app/gradio/pull/8026
		// "**/outbreak_forecast.spec.ts" // To test matplotlib on Lite
	],
	workers: 1,
	retries: 3,
	timeout: 60000,
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] }
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
			testIgnore: "**/kitchen_sink.*" // This test requires the camera permission but it's not supported on FireFox: https://github.com/microsoft/playwright/issues/11714
		}
	]
});

export default !!process.env.GRADIO_E2E_TEST_LITE ? lite : normal;
