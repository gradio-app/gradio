const production = !process.env.ROLLUP_WATCH;
module.exports = {
	purge: {
		content: ["./src/**/*.svelte"],
		enabled: production // disable purge in dev
	},
	mode: "jit",
	darkMode: "class", // or 'media' or 'class'
	theme: {
		extend: {}
	},
	variants: {
		extend: {}
	},
	plugins: []
};
