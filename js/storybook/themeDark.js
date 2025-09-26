import { create } from "@storybook/theming/create";
import LogoDark from "./public/gradio-dark.svg";

export default create({
	base: "dark",
	brandTitle: "Gradio Storybook",
	brandUrl: "https://gradio.app",
	brandImage: LogoDark,
	brandTarget: "_blank",

	fontBase: '"IBM Plex Sans", sans-serif',
	fontCode: "monospace"
});
