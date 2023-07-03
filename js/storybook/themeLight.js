import { create } from "@storybook/theming/create";
import Logo from "./public/gradio.svg";

export default create({
	base: "light",
	brandTitle: "Gradio Storybook",
	brandUrl: "https://gradio.app",
	brandImage: Logo,
	brandTarget: "_blank",

	fontBase: '"Source Sans Pro", sans-serif',
	fontCode: "monospace",

	// theme colours
	colorPrimary: "#101827",
	colorSecondary: "#FF7C01",

	// UI
	appBg: "#ffffff", // change to #101827 in dark mode
	appContentBg: "#ffffff",
	appBorderRadius: 4,

	// text colors
	textColor: "#101827",
	textInverseColor: "#101827",
	textMutedColor: "#101827",

	// toolbar default and active colors
	barTextColor: "#101827",
	barSelectedColor: "#FF7C01",
	barBg: "#ffffff"
});
