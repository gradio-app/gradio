// import Blocks from "./Blocks.svelte";
// import Login from "./Login.svelte";
// import { Component as Loader } from "./components/StatusTracker";
// import { fn } from "./api";

// import type { ComponentMeta, Dependency, LayoutNode } from "./components/types";

import "@gradio/theme";
import Index from "./Index.svelte";

// let id = -1;
window.__gradio_loader__ = [];

declare let BACKEND_URL: string;
declare let BUILD_MODE: string;
declare let GRADIO_VERSION: string;

const ENTRY_CSS = "__ENTRY_CSS__";
const FONTS = "__FONTS_CSS__";

// import { setupWorker, rest } from "msw";
// import {
// 	RUNNING,
// 	RUNNING_BUILDING,
// 	BUILDING,
// 	RUNTIME_ERROR,
// 	CONFIG_ERROR,
// 	NO_APP_FILE,
// 	BUILD_ERROR
// } from "../test/mocks/embed";

// const BASE_URL = "https://huggingface.co/api/spaces";
// const spaces = [
// 	["pngwn/music-visualizer", RUNNING],
// 	["pngwn/test", BUILDING],
// 	["pngwn/test_two", RUNNING_BUILDING],
// 	["pngwn/AnimeGANv2_v3", NO_APP_FILE],
// 	["pngwn/clear-inputs", CONFIG_ERROR],
// 	["pngwn/altair-charts", RUNTIME_ERROR],
// 	["Gaborandi/PubMed_Downloader", BUILD_ERROR]
// ];
// const worker = setupWorker(
// 	...spaces
// 		.map(([endpoint, mock]) => {
// 			console.log("ENDPOINT: ", `${BASE_URL}/${endpoint}`);
// 			return rest.get(`${BASE_URL}/${endpoint}`, async (req, res, ctx) => {
// 				return res(ctx.json(mock));
// 			});
// 		})
// 		.concat([
// 			rest.get(
// 				`https://huggingface.co/api/spaces/pngwn/test_two/host`,
// 				async (req, res, ctx) => {
// 					return res(
// 						ctx.json({
// 							subdomain: "pngwn-test",
// 							host: "https://pngwn-test.hf.space"
// 						})
// 					);
// 				}
// 			)
// 			// rest.get(
// 			// 	`https://huggingface.co/api/spaces/pngwn/test_two/host`,
// 			// 	async (req, res, ctx) => {
// 			// 		return res(
// 			// 			ctx.json({
// 			// 				subdomain: "pngwn-test",
// 			// 				host: "https://pngwn-test.hf.space"
// 			// 			})
// 			// 		);
// 			// 	}
// 			// )
// 		])
// );
// worker.start();

function mount_css(url: string, target: HTMLElement): Promise<void> {
	if (BUILD_MODE === "dev") return Promise.resolve();

	const existing_link = document.querySelector(`link[href='${url}']`);
	console.log(existing_link);
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
	//@ts-ignore
	typeof FONTS !== "string" && FONTS.map((f) => mount_css(f, document.head));

	class GradioApp extends HTMLElement {
		theme: "light" | "dark";

		constructor() {
			super();

			this.theme = "light";
		}

		async connectedCallback() {
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

			console.log(is_embed);
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
