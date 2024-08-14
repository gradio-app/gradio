import type { Preview } from "@storybook/svelte";
import "./theme.css";
import { setupi18n } from "../core/src/i18n";
import { Gradio, formatter } from "../core/src/gradio_helper";
import "../theme/src/reset.css";
import "../theme/src/global.css";

import "../theme/src/pollen.css";
// import "../theme/src/tokens.css";
import "../theme/src/typography.css";

setupi18n();

const preview: Preview = {
	args: {
		gradio: new Gradio(
			0,
			document.createElement("div"),
			"light",
			"1.1.1",
			"localhost:9876",
			false,
			null,
			formatter,
			// @ts-ignore
			{ client: { fetch() {}, upload() {} } }
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
		},
		viewport: {
			viewports: {
				mobile: { name: "mobile", styles: { width: "320px", height: "400px" } },
				tablet: { name: "tablet", styles: { width: "640px", height: "800px" } },
				desktop: {
					name: "desktop",
					styles: { width: "1024px", height: "1000px" }
				}
			}
		}
	},

	tags: ["autodocs"]
};

export default preview;
