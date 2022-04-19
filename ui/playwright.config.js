export default {
	use: {
		screenshot: "only-on-failure",
		trace: "retain-on-failure"
	},
	globalSetup: "./playwright-setup.js"
};
