import tw_colors from "tailwindcss/colors";

export const ordered_colors = [
	"red",
	"green",
	"blue",
	"yellow",
	"purple",
	"teal",
	"orange",
	"cyan",
	"lime",
	"pink"
] as const;
interface ColorPair {
	primary: number;
	secondary: number;
}

interface Colors {
	red: ColorPair;
	green: ColorPair;
	blue: ColorPair;
	yellow: ColorPair;
	purple: ColorPair;
	teal: ColorPair;
	orange: ColorPair;
	cyan: ColorPair;
	lime: ColorPair;
	pink: ColorPair;
}

// https://play.tailwindcss.com/ZubQYya0aN
export const color_values = [
	{ color: "red", primary: 600, secondary: 100 },
	{ color: "green", primary: 600, secondary: 100 },
	{ color: "blue", primary: 600, secondary: 100 },
	{ color: "yellow", primary: 500, secondary: 100 },
	{ color: "purple", primary: 600, secondary: 100 },
	{ color: "teal", primary: 600, secondary: 100 },
	{ color: "orange", primary: 600, secondary: 100 },
	{ color: "cyan", primary: 600, secondary: 100 },
	{ color: "lime", primary: 500, secondary: 100 },
	{ color: "pink", primary: 600, secondary: 100 }
] as const;

export const colors = color_values.reduce(
	(acc, { color, primary, secondary }) => ({
		...acc,
		[color]: {
			primary: tw_colors[color][primary],
			secondary: tw_colors[color][secondary]
		}
	}),
	{} as Colors
);
