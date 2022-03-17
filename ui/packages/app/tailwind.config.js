const production = !process.env.ROLLUP_WATCH;
module.exports = {
	content: ["./src/**/*.svelte"],
	mode: "jit",
	darkMode: "class", // or 'media' or 'class'
	variants: {
		extend: {}
	}
};
