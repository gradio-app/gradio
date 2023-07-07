const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
	content: [
		"./src/*.{html,js,css}",
		"./src/**/*.{html,js,svelte,ts,css}",
		"**/@gradio/**/*.{html,js,svelte,ts,css}"
	],

	theme: {
		extend: {
			fontFamily: {
				sans: ["Source Sans Pro", ...defaultTheme.fontFamily.sans],
				mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono]
			},
			colors: {
				orange: {
					50: "#FFF2E5",
					100: "#FFE5CC",
					200: "#FFD8B4",
					300: "#FFB066",
					400: "#FF9633",
					500: "#FF7C00",
					600: "#EE7400",
					700: "#CE6400",
					800: "#A45000",
					900: "#5C2D00"
				}
			}
		}
	},
	mode: "jit",
	darkMode: "class", // or 'media' or 'class'

	variants: {
		extend: {
			visibility: ["group-hover"]
		}
	},

	plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")]
};
