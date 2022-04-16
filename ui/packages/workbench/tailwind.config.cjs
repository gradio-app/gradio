const defaultTheme = require('tailwindcss/defaultTheme');
const production = !process.env.ROLLUP_WATCH;

module.exports = {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		"**/@gradio/**/*.{html,js,svelte,ts,css}"
	],

	theme: {
		extend: {
			fontFamily: {
				sans: ['Source Sans Pro', ...defaultTheme.fontFamily.sans],
				mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
			},
			colors: {
				'orange': {
					'50': '#FFDAB8',
					'100': '#FFD0A3',
					'200': '#FFBB7A',
					'300': '#FFA652',
					'400': '#FF9129',
					'500': '#FF7C00',
					'600': '#C76100',
					'700': '#8F4500',
					'800': '#572A00',
					'900': '#1F0F00'
				},
			}
		},
	},
	mode: "jit",
	darkMode: "class", // or 'media' or 'class'

	variants: {
		extend: {}
	},
	plugins: [require("@tailwindcss/forms")]
};
