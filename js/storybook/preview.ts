import type { Preview } from "@storybook/svelte";
import "./theme.css";
import { setupi18n } from "../app/src/i18n";
import { Gradio } from "../app/src/gradio_helper";
setupi18n();

const preview: Preview = {
	args: {
		gradio: new Gradio(
			0,
			document.createElement("div"),
			"light",
			"1.1.1",
			"localhost:9876"
		)
	},
	argTypes: {
		gradio: {
			table: {
				disable: true
			}
		}
	},
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/
			}
		},
		options: {
			storySort: {
				order: ["Design System", "Components"]
			}
		}
	}
};

export default preview;
