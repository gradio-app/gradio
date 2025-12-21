import type { Preview } from "@storybook/svelte-vite";
import "../js/theme/src/pollen.css";
import "./theme.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	}
};

export default preview;
