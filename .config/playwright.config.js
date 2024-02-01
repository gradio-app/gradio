import { defineConfig } from "@playwright/test";

export default defineConfig({
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
	globalSetup: "./playwright-setup.js",
	workers: process.env.CI ? 1 : undefined
});
