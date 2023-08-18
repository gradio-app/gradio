import type { Preview } from "@storybook/svelte";
import "./theme.css";
import { init, getLocaleFromNavigator } from "svelte-i18n";

init({
	fallbackLocale: "en",
	initialLocale: getLocaleFromNavigator()
});

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
