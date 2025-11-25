// import { type LayoutServerLoad } from "./$types";
import { browser } from "$app/environment";

import { Client } from "@gradio/client";
import { AppTree, type ComponentMeta, type Dependency } from "@gradio/core";
import { get } from "svelte/store";
import type { Config } from "@gradio/client";
import { MISSING_CREDENTIALS_MSG } from "@gradio/client";
import { setupi18n } from "@gradio/core";

import Blocks from "@gradio/core/blocks";
import Login from "@gradio/core/login";
import { page } from "$app/state";

export let ssr = false;

export async function load({
	url,
	data: { server, port, local_dev_mode, accept_language }
}): Promise<{
	Render: typeof Login | typeof Blocks;
	config: Config;
	api_url: string;
	layout: unknown;
	app: Client | null;
}> {
	let app: Client;
	const api_url =
		browser && !local_dev_mode ? new URL(".", location.href).href : server;
	const deepLink = url.searchParams.get("deep_link");
	try {
		app = await Client.connect(api_url, {
			with_null_state: true,
			events: ["data", "log", "status", "render"],
			query_params: deepLink ? { deep_link: deepLink } : undefined
		});
	} catch (error: any) {
		const error_message = error.message || "";
		let auth_message = "";
		if (!error_message.includes(MISSING_CREDENTIALS_MSG)) {
			auth_message = error_message.replace(/^Error:?\s*/, "");
		}
		return {
			Render: Login,
			config: {
				auth_message: auth_message,
				auth_required: true,
				components: [],
				current_page: "",
				dependencies: [],
				layout: {},
				pages: [],
				page: {},
				root: url.origin,
				space_id: null,
				analytics_enabled: false,
				connect_heartbeat: false,
				css: "",
				js: "",
				theme_hash: 0,
				head: "",
				dev_mode: false,
				enable_queue: false,
				show_error: false,
				fill_height: false,
				fill_width: false,
				mode: "blocks",
				theme: "default",
				title: "",
				version: "",
				api_prefix: "",

				is_space: false,
				is_colab: false,
				footer_links: ["gradio", "settings"],
				stylesheets: [],
				protocol: "sse_v3",
				username: ""
			},
			api_url,
			layout: {},
			app: null
		};
	}

	if (!app.config) {
		throw new Error("No config found");
	}

	let page_config = app.get_url_config(url.toString());

	// const layouts = get(layout);
	await setupi18n(app.config?.i18n_translations || undefined, accept_language);
	return {
		Render: app.config?.auth_required ? Login : Blocks,
		config: page_config,
		api_url,
		app
	};
}
