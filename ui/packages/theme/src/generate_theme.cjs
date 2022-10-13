const tw_theme = require("tailwindcss/defaultTheme");

const { borderRadius } = tw_theme;
const theme = {
	spacing: {
		sm: 0,
		md: 0,
		lg: 0
	},
	dimensions: {},
	border_width: {},
	border_radius: {
		sm: borderRadius.sm,
		md: borderRadius.md,
		lg: borderRadius.lg,
		full: borderRadius.full,
		none: borderRadius.none
	},
	colors: {}
};

console.log(theme);
