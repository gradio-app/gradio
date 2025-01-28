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
	const app = await Client.connect(api_url, {
		with_null_state: true,
		events: ["data", "log", "status", "render"]
	});

	if (!app.config) {
		throw new Error("No config found");
	}

	let pathname = url.pathname;
	if (pathname.startsWith("/")) {
		pathname = pathname.slice(1);
	}
	if (pathname.endsWith("/")) {
		pathname = pathname.slice(0, -1);
	}
	let page_config =
		app.config.page && pathname in app.config.page
			? app.config.page[pathname]
			: app.config;
	let page = app.config.page && pathname in app.config.page ? pathname : "";

	const { create_layout, layout } = create_components(undefined);

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
		config: { ...app.config, ...page_config, current_page: page },
		api_url,
		layout: layouts,
		app
	};
}
