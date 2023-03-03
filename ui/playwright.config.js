export default {
	use: {
		screenshot: "only-on-failure",
		trace: "retain-on-failure"
	},
	globalSetup: "./playwright-setup.js",
	workers: 1,
	webServer: [
		{
			command: "GRADIO_SERVER_PORT=7888 python ../demo/slider_release/run.py",
			port: 7888,
			timeout: 120 * 1000
		}
	]
};
