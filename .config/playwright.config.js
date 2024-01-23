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
				"--use-fake-ui-for-media-stream"
			]
		}
	},
	expect: { timeout: 60000 },
	timeout: 90000,
	testMatch: /.*.spec.ts/,
	testDir: "..",
	globalSetup: "./playwright-setup.js",
	workers: process.env.CI ? 1 : undefined
});
