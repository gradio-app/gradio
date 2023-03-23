import "@gradio/theme";
import Index from "./Index.svelte";

declare let BUILD_MODE: string;
declare let GRADIO_VERSION: string;

const ENTRY_CSS = "__ENTRY_CSS__";

let FONTS: string | [];

FONTS = "__FONTS_CSS__";

export function mount_css(url: string, target: HTMLElement): Promise<void> {
	const existing_link = document.querySelector(`link[href='${url}']`);

	if (existing_link) return Promise.resolve();

	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = url;
	// @ts-ignore
	target.appendChild(link);

	return new Promise((res, rej) => {
		link.addEventListener("load", () => res());
		link.addEventListener("error", () =>
			rej(new Error(`Unable to preload CSS for ${url}`))
		);
	});
}

function create_custom_element() {
	class GradioApp extends HTMLElement {
		constructor() {
			super();
		}

		async connectedCallback() {
			if (typeof FONTS !== "string") {
				FONTS.forEach((f) => mount_css(f, document.head));
			}

			await mount_css(ENTRY_CSS, document.head);

			const event = new CustomEvent("domchange", {
				bubbles: true,
				cancelable: false,
				composed: true
			});

			var observer = new MutationObserver((mutations) => {
				this.dispatchEvent(event);
			});

			observer.observe(this, { childList: true });

			const host = this.getAttribute("host");
			const space = this.getAttribute("space");
			const src = this.getAttribute("src");

			const control_page_title = this.getAttribute("control_page_title");
			const initial_height = this.getAttribute("initial_height") ?? "300px"; // default: 300px
			const is_embed = this.getAttribute("embed") ?? "true"; // default: true
			const container = this.getAttribute("container") ?? "true"; // default: true
			const info = this.getAttribute("info") ?? true; // default: true
			const autoscroll = this.getAttribute("autoscroll");
			const eager = this.getAttribute("eager");
			const theme = (this.getAttribute("theme") ?? "system") as
				| "system"
				| "light"
				| "dark";

			const app = new Index({
				target: this,
				props: {
					// embed source
					space: space ? space.trim() : space,
					src: src ? src.trim() : src,
					host: host ? host.trim() : host,
					// embed info
					info: info === "false" ? false : true,
					container: container === "false" ? false : true,
					is_embed: is_embed === "false" ? false : true,
					initial_height: initial_height ?? undefined,
					eager: eager === "true" ? true : false,
					// gradio meta info
					version: GRADIO_VERSION,
					theme: theme,
					// misc global behaviour
					autoscroll: autoscroll === "true" ? true : false,
					control_page_title: control_page_title === "true" ? true : false,
					// for gradio docs
					// TODO: Remove -- i think this is just for autoscroll behavhiour, app vs embeds
					app_mode: window.__gradio_mode__ === "app"
				}
			});
		}
	}

	customElements.define("gradio-app", GradioApp);
}

create_custom_element();
