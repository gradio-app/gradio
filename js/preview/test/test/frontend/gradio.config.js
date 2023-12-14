export default {
	plugins: [
		{
			name: "TEST PLUGIN",
			transform() {
				console.log("TRANFORMING FROM CUSTOM PLUGIN");
			}
		}
	],
	svelte: {
		preprocess: [
			{
				markup() {
					console.log("PREPROCESSING FROM CUSTOM PLUGIN");
				}
			}
		]
	}
};
