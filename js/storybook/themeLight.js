import { create } from "@storybook/theming/create";
import Logo from "./public/gradio.svg";

export default create({
	base: "light",
	brandTitle: "Gradio Storybook",
	brandUrl: "https://gradio.app",
	brandImage: Logo,
	brandTarget: "_blank",

	fontBase: '"IBM Plex Sans", sans-serif',
	fontCode: "monospace"
});
