// import { type LayoutServerLoad } from "./$types";
import { browser } from "$app/environment";
import { setupi18n } from "@gradio/core";

import { Client } from "@gradio/client";
import {
	create_components,
	type ComponentMeta,
	type Dependency
} from "@gradio/core";
import { get } from "svelte/store";
import type { Config } from "@gradio/client";
import { MISSING_CREDENTIALS_MSG } from "@gradio/client";

import Blocks from "@gradio/core/blocks";
import Login from "@gradio/core/login";

export async function load({
	url,
	data: { server, port, local_dev_mode }
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
				show_api: false,
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

	const { create_layout, layout } = create_components(undefined);

	await create_layout({
		app,
		components: page_config.components,
		dependencies: page_config.dependencies,
		layout: page_config.layout,
		root: app.config.root + app.config.api_prefix,
		options: {
			fill_height: app.config.fill_height ?? false
		}
	});

	const layouts = get(layout);

	await setupi18n();

	return {
		Render: app.config?.auth_required ? Login : Blocks,
		config: page_config,
		api_url,
		layout: layouts,
		app
	};
}
