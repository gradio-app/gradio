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

export default normal;
