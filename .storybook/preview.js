import "./theme.css";
import { setupi18n } from "../js/app/src/i18n";
import { Gradio } from "../js/app/src/gradio_helper";
import "../js/theme/src/reset.css";
import "../js/theme/src/global.css";

import "../js/theme/src/pollen.css";
import "../js/theme/src/tokens.css";
import "../js/theme/src/typography.css";

setupi18n();

const preview = {
	args: {
		gradio: new Gradio(
			0,
			document.createElement("div"),
			"light",
			"1.1.1",
			"localhost:9876",
			false
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
	}
};

export default preview;
