const production = !process.env.ROLLUP_WATCH;
module.exports = {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		"**/@gradio/**/*.{html,js,svelte,ts,css}"
	],

	mode: "jit",
	darkMode: "class",

	theme: {
		extend: {
			colors: {
				"gray-950": "#0B0F19"
			}
		},
		fontFamily: {
			mono: ["monospace"],
			sans: ["IBM Plex Sans", "system-ui"]
		}
	},

	plugins: [require("@tailwindcss/forms")]
};
