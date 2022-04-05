module.exports = {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		"**/@gradio/**/*.{html,js,svelte,ts}"
	],

	theme: {
		extend: {}
	},

	plugins: [require("@tailwindcss/forms")]
};
