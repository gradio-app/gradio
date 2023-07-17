export default {
	use: {
		screenshot: "only-on-failure",
		trace: "retain-on-failure"
	},
	testMatch: /.*.spec.ts/,
	testDir: "..",
	globalSetup: "./playwright-setup.js"
};
