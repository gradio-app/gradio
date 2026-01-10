import type { Preview } from "@storybook/svelte-vite";
import GradioContext from "./GradioContext.svelte";
import { setupi18n } from "../js/core/src/i18n";
import { locale } from "svelte-i18n";

import "../js/theme/src/reset.css";
import "../js/theme/src/global.css";
import "../js/theme/src/pollen.css";
import "../js/theme/src/typography.css";
import "../js/storybook/theme.css";

setupi18n();

const withI18n = (
	storyFn: any,
	context: { globals: { locale?: string } }
): any => {
	if (context.globals.locale) {
		locale.set(context.globals.locale);
	}
	return storyFn();
};

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
			test: "todo"
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
	globalTypes: {
		locale: {
			name: "Locale",
			description: "Internationalization locale",
			defaultValue: "en",
			toolbar: {
				icon: "globe",
				items: [
					{ value: "en", title: "English" },
					{ value: "fr", title: "French" },
					{ value: "de", title: "German" },
					{ value: "es", title: "Spanish" },
					{ value: "ar", title: "Arabic", right: true }
				]
			}
		}
	},
	decorators: [
		withI18n,
		() => ({
			Component: GradioContext
		})
	]
};

export default preview;
