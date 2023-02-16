import "@gradio/theme";
import Index from "./Index.svelte";

declare let BUILD_MODE: string;
declare let GRADIO_VERSION: string;

const ENTRY_CSS = "__ENTRY_CSS__";

let FONTS: string | [];

FONTS = "__FONTS_CSS__";

function mount_css(url: string, target: HTMLElement): Promise<void> {
	if (BUILD_MODE === "dev") return Promise.resolve();

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
		theme: "light" | "dark";

		constructor() {
			super();

			this.theme = "light";
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
			const initial_height = this.getAttribute("initial_height");
			const is_embed = this.getAttribute("embed") ?? true;
			const minimal = this.getAttribute("minimal") ? true : false;
			let autoscroll = this.getAttribute("autoscroll");

			const app = new Index({
				target: this,
				props: {
					space,
					src,
					host,
					is_embed: !!is_embed,
					minimal,
					autoscroll: autoscroll === "true" ? true : false,
					version: GRADIO_VERSION,
					app_mode: window.__gradio_mode__ === "app",
					initial_height: initial_height ?? undefined,

					theme: this.theme,
					control_page_title:
						control_page_title && control_page_title === "true" ? true : false
				}
			});
		}
	}

	customElements.define("gradio-app", GradioApp);
}

create_custom_element();
