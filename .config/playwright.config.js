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

// There are Firefox-specific issues such as https://github.com/gradio-app/gradio/pull/9528 so we want to run the tests on Firefox, but Firefox sometimes fails to start in the GitHub Actions environment so we disable it on CI.
const localOnly = (project) => (process.env.CI ? undefined : project);

const normal = defineConfig(base, {
	globalSetup: process.env.CUSTOM_TEST ? undefined : "./playwright-setup.js",
	projects: [
		localOnly({
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
			grep: /@firefox/
		}),
		{
			name: "chrome",
			use: {
				...devices["Desktop Chrome"],
				permissions: ["clipboard-read", "clipboard-write", "microphone"]
			}
		}
	].filter(Boolean)
});

export default normal;
