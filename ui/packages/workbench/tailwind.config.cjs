module.exports = {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		"**/@gradio/**/*.{html,js,svelte,ts,css}"
	],

	theme: {
		extend: {},
		fontFamily: {
			sans: ["IBM Plex Sans", "system-ui"]
		}
	},

	plugins: [require("@tailwindcss/forms")]
};
