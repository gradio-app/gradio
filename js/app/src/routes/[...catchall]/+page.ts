// import { type LayoutServerLoad } from "./$types";
import { browser } from "$app/environment";

import { Client } from "@gradio/client";
import { create_components } from "@gradio/core";
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
	// console.log("API URL", api_url, "-", location.href, "-");
	const app = await Client.connect(api_url, {
		with_null_state: true,
		events: ["data", "log", "status", "render"]
	});

	if (!app.config) {
		throw new Error("No config found");
	}

	const { create_layout, layout } = create_components();

	await create_layout({
		app,
		components: app.config.components,
		dependencies: app.config.dependencies,
		layout: app.config.layout,
		root: app.config.root + app.config.api_prefix,
		options: {
			fill_height: app.config.fill_height
		}
	});

	const layouts = get(layout);

	return {
		Render: app.config?.auth_required ? Login : Blocks,
		config: app.config,
		api_url,
		layout: layouts,
		app
	};
}
