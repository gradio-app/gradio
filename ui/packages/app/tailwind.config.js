const colors = require("tailwindcss/colors");

const defaultTheme = require("tailwindcss/defaultTheme");
const production = !process.env.ROLLUP_WATCH;

const allowed_colors = [
	"red",
	"green",
	"blue",
	"yellow",
	"purple",
	"teal",
	"orange",
	"cyan",
	"lime",
	"pink",
	"black",
	"grey",
	"gray"
];

module.exports = {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		"**/@gradio/**/*.{html,js,svelte,ts,css}"
	],

	theme: {
		extend: {
			fontFamily: {
				sans: ["Source Sans Pro", ...defaultTheme.fontFamily.sans],
				mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono]
			},
			colors: {
				gray: {
					950: "#0b0f19"
				},
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
		extend: {}
	},
	plugins: [require("@tailwindcss/forms")],
	safelist: [
		...allowed_colors.reduce(
			(acc, col) => [
				...acc,
				`!text-${col}-500`,
				`dark:!text-${col}-300`,
				`!bg-${col}-200`,
				`dark:!bg-${col}-700`
			],
			[]
		),
		"!text-gray-700",
		"dark:!text-gray-50",
		"min-h-[350px]",
		"max-h-[55vh]",
		"xl:min-h-[450px]",
		"!rounded-br-none ",
		"!rounded-br-lg",
		"!rounded-bl-none ",
		"!rounded-bl-lg",
		"!rounded-tr-none ",
		"!rounded-tr-lg",
		"!rounded-tl-none",
		"!rounded-tl-lg",
		"!mt-0",
		"!mb-0",
		"!ml-0",
		"!mr-0",
		"!border-t-0",
		"!border-b-0",
		"!border-l-0",
		"!border-r-0",
		"grid-cols-1",
		"grid-cols-2",
		"grid-cols-3",
		"grid-cols-4",
		"grid-cols-5",
		"grid-cols-6",
		"grid-cols-7",
		"grid-cols-8",
		"grid-cols-9",
		"grid-cols-10",
		"grid-cols-11",
		"grid-cols-12",

		"sm:grid-cols-1",
		"sm:grid-cols-2",
		"sm:grid-cols-3",
		"sm:grid-cols-4",
		"sm:grid-cols-5",
		"sm:grid-cols-6",
		"sm:grid-cols-7",
		"sm:grid-cols-8",
		"sm:grid-cols-9",
		"sm:grid-cols-10",
		"sm:grid-cols-11",
		"sm:grid-cols-12",

		"md:grid-cols-1",
		"md:grid-cols-2",
		"md:grid-cols-3",
		"md:grid-cols-4",
		"md:grid-cols-5",
		"md:grid-cols-6",
		"md:grid-cols-7",
		"md:grid-cols-8",
		"md:grid-cols-9",
		"md:grid-cols-10",
		"md:grid-cols-11",
		"md:grid-cols-12",

		"lg:grid-cols-1",
		"lg:grid-cols-2",
		"lg:grid-cols-3",
		"lg:grid-cols-4",
		"lg:grid-cols-5",
		"lg:grid-cols-6",
		"lg:grid-cols-7",
		"lg:grid-cols-8",
		"lg:grid-cols-9",
		"lg:grid-cols-10",
		"lg:grid-cols-11",
		"lg:grid-cols-12",

		"xl:grid-cols-1",
		"xl:grid-cols-2",
		"xl:grid-cols-3",
		"xl:grid-cols-4",
		"xl:grid-cols-5",
		"xl:grid-cols-6",
		"xl:grid-cols-7",
		"xl:grid-cols-8",
		"xl:grid-cols-9",
		"xl:grid-cols-10",
		"xl:grid-cols-11",
		"xl:grid-cols-12",

		"2xl:grid-cols-1",
		"2xl:grid-cols-2",
		"2xl:grid-cols-3",
		"2xl:grid-cols-4",
		"2xl:grid-cols-5",
		"2xl:grid-cols-6",
		"2xl:grid-cols-7",
		"2xl:grid-cols-8",
		"2xl:grid-cols-9",
		"2xl:grid-cols-10",
		"2xl:grid-cols-11",
		"2xl:grid-cols-12"
	]
};
