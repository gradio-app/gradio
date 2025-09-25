import type { Preview } from "@storybook/svelte";
import "./theme.css";
import { setupi18n } from "../core/src/i18n";
import { Gradio, formatter } from "../core/src/gradio_helper";
import "../theme/src/reset.css";
import "../theme/src/global.css";
import { locale } from "svelte-i18n";
import { themes } from "@storybook/theming";
import gradioThemeLight from "./themeLight";
import gradioThemeDark from "./themeDark";

import "../theme/src/pollen.css";
import "../theme/src/typography.css";

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

const withBackgroundSync = (storyFn: any): any => {
	const update = (): void => (
		document.getElementById("sb-bg")?.remove(),
		document.head.insertAdjacentHTML(
			"beforeend",
			`<style id="sb-bg">.sb-show-main{background:${document.body.classList.contains("dark") ? "#333" : "#fff"}!important}</style>`
		)
	);
	!document.getElementById("sb-bg") &&
		(new MutationObserver(update).observe(document.body, {
			attributes: true,
			attributeFilter: ["class"]
		}),
		update());
	return storyFn();
};

const preview: Preview = {
	decorators: [withI18n, withBackgroundSync],
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

	args: {
		gradio: new Gradio(
			0,
			document.createElement("div"),
			"system",
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
		},
		darkMode: {
			dark: { ...gradioThemeDark },
			light: { ...gradioThemeLight },
			current: "light",
			stylePreview: true,
			classTarget: "body"
		}
	},

	tags: ["autodocs"]
};

export default preview;
