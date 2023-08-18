import type { Preview } from "@storybook/svelte";
import "./theme.css";
import { setupi18n } from "../app/src/i18n";

setupi18n();

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/
			}
		}
	}
};

export default preview;
