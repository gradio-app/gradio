import type { Preview } from "@storybook/svelte-vite";
import GradioContext from "./GradioContext.svelte";

import "../js/theme/src/reset.css";
import "../js/theme/src/global.css";
import "../js/theme/src/pollen.css";
import "../js/theme/src/typography.css";
import "./theme.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: "todo"
		}
	},
	decorators: [
		() => ({
			Component: GradioContext
		})
	]
};

export default preview;
