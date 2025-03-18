// import { type LayoutServerLoad } from "./$types";
import { browser } from "$app/environment";

import { Client } from "@gradio/client";
import {
	create_components,
	type ComponentMeta,
	type Dependency
} from "@gradio/core";
import { get } from "svelte/store";
import type { Config } from "@gradio/client";

import Blocks from "@gradio/core/blocks";
import Login from "@gradio/core/login";

export async function load({
	url,
	data: { server, port, local_dev_mode, custom_path }
}): Promise<{
	Render: typeof Login | typeof Blocks;
	config: Config;
	api_url: string;
	layout: unknown;
	app: Client;
}> {
	const api_url =
		browser && !local_dev_mode ? new URL(".", location.href).href : server;
	const deepLink = url.searchParams.get("deep_link");
	const app = await Client.connect(api_url, {
		with_null_state: true,
		events: ["data", "log", "status", "render"],
		query_params: deepLink ? { deep_link: deepLink } : undefined
	});

	if (!app.config) {
		throw new Error("No config found");
	}

	let page_config = app.get_url_config(url);

	const { create_layout, layout } = create_components(undefined);

	console.log("app.config.root", app.config.root);
	console.log("app.config.api_prefix", app.config.api_prefix);

	await create_layout({
		app,
		components: page_config.components,
		dependencies: page_config.dependencies,
		layout: page_config.layout,
		root: app.config.root + app.config.api_prefix,
		options: {
			fill_height: app.config.fill_height
		}
	});

	const layouts = get(layout);

	return {
		Render: app.config?.auth_required ? Login : Blocks,
		config: page_config,
		api_url,
		layout: layouts,
		app
	};
}
