import "@gradio/theme/src/reset.css";
import "@gradio/theme/src/global.css";
import "@gradio/theme/src/pollen.css";
import "@gradio/theme/src/typography.css";
import { client, upload_files } from "@gradio/client";
import { mount_css } from "./css";
import Index from "./Index.svelte";
import type { ThemeMode } from "./components/types";

declare let BUILD_MODE: string;
declare let GRADIO_VERSION: string;

const ENTRY_CSS = "__ENTRY_CSS__";

let FONTS: string | [];

FONTS = "__FONTS_CSS__";

function create_custom_element(): void {
	class GradioApp extends HTMLElement {
		control_page_title: string | null;
		initial_height: string;
		is_embed: string;
		container: string;
		info: string | true;
		autoscroll: string | null;
		eager: string | null;
		theme_mode: ThemeMode | null;
		host: string | null;
		space: string | null;
		src: string | null;
		app?: Index;
		loading: boolean;
		updating: { name: string; value: string } | false;

		constructor() {
			super();
			this.host = this.getAttribute("host");
			this.space = this.getAttribute("space");
			this.src = this.getAttribute("src");

			this.control_page_title = this.getAttribute("control_page_title");
			this.initial_height = this.getAttribute("initial_height") ?? "300px"; // default: 300px
			this.is_embed = this.getAttribute("embed") ?? "true"; // default: true
			this.container = this.getAttribute("container") ?? "true"; // default: true
			this.info = this.getAttribute("info") ?? true; // default: true
			this.autoscroll = this.getAttribute("autoscroll");
			this.eager = this.getAttribute("eager");
			this.theme_mode = this.getAttribute("theme_mode") as ThemeMode | null;
			this.updating = false;
			this.loading = false;
		}

		async connectedCallback(): Promise<void> {
			this.loading = true;

			if (this.app) {
				this.app.$destroy();
			}

			if (typeof FONTS !== "string") {
				FONTS.forEach((f) => mount_css(f, document.head));
			}

			await mount_css(ENTRY_CSS, document.head);

			const event = new CustomEvent("domchange", {
				bubbles: true,
				cancelable: false,
				composed: true
			});

			const observer = new MutationObserver((mutations) => {
				this.dispatchEvent(event);
			});

			observer.observe(this, { childList: true });

			this.app = new Index({
				target: this,
				props: {
					// embed source
					space: this.space ? this.space.trim() : this.space,
					src: this.src ? this.src.trim() : this.src,
					host: this.host ? this.host.trim() : this.host,
					// embed info
					info: this.info === "false" ? false : true,
					container: this.container === "false" ? false : true,
					is_embed: this.is_embed === "false" ? false : true,
					initial_height: this.initial_height,
					eager: this.eager === "true" ? true : false,
					// gradio meta info
					version: GRADIO_VERSION,
					theme_mode: this.theme_mode,
					// misc global behaviour
					autoscroll: this.autoscroll === "true" ? true : false,
					control_page_title: this.control_page_title === "true" ? true : false,
					// injectables
					client,
					upload_files,
					// for gradio docs
					// TODO: Remove -- i think this is just for autoscroll behavhiour, app vs embeds
					app_mode: window.__gradio_mode__ === "app"
				}
			});

			if (this.updating) {
				this.setAttribute(this.updating.name, this.updating.value);
			}

			this.loading = false;
		}

		static get observedAttributes(): ["src", "space", "host"] {
			return ["src", "space", "host"];
		}

		attributeChangedCallback(
			name: string,
			old_val: string,
			new_val: string
		): void {
			if (
				(name === "host" || name === "space" || name === "src") &&
				new_val !== old_val
			) {
				this.updating = { name, value: new_val };
				if (this.loading) return;

				if (this.app) {
					this.app.$destroy();
				}

				this.space = null;
				this.host = null;
				this.src = null;

				if (name === "host") {
					this.host = new_val;
				} else if (name === "space") {
					this.space = new_val;
				} else if (name === "src") {
					this.src = new_val;
				}

				this.app = new Index({
					target: this,
					props: {
						// embed source
						space: this.space ? this.space.trim() : this.space,
						src: this.src ? this.src.trim() : this.src,
						host: this.host ? this.host.trim() : this.host,
						// embed info
						info: this.info === "false" ? false : true,
						container: this.container === "false" ? false : true,
						is_embed: this.is_embed === "false" ? false : true,
						initial_height: this.initial_height,
						eager: this.eager === "true" ? true : false,
						// gradio meta info
						version: GRADIO_VERSION,
						theme_mode: this.theme_mode,
						// misc global behaviour
						autoscroll: this.autoscroll === "true" ? true : false,
						control_page_title:
							this.control_page_title === "true" ? true : false,
						// injectables
						client,
						upload_files,
						// for gradio docs
						// TODO: Remove -- i think this is just for autoscroll behavhiour, app vs embeds
						app_mode: window.__gradio_mode__ === "app"
					}
				});

				this.updating = false;
			}
		}
	}
	if (!customElements.get("gradio-app"))
		customElements.define("gradio-app", GradioApp);
}

create_custom_element();
