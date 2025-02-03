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
	const app = await Client.connect(api_url, {
		with_null_state: true,
		events: ["data", "log", "status", "render"]
	});

	if (!app.config) {
		throw new Error("No config found");
	}

	let pathname = url.toString().substring(app.config.root.length);
	if (pathname.startsWith("/")) {
		pathname = pathname.substring(1);
	}
	if (pathname.endsWith("/")) {
		pathname = pathname.substring(0, pathname.length - 1);
	}

	let page: string;
	let components: ComponentMeta[] = [];
	let dependencies: Dependency[] = [];
	let _layout: any;
	if (app.config.page !== undefined && pathname in app.config.page) {
		components = app.config.components.filter((c) =>
			app.config!.page[pathname].components.includes(c.id)
		);
		dependencies = app.config.dependencies.filter((d) =>
			app.config!.page[pathname].dependencies.includes(d.id)
		);
		_layout = app.config.page[pathname].layout;
		page = pathname;
	} else {
		components = app.config.components;
		dependencies = app.config.dependencies;
		_layout = app.config.layout;
		page = "";
	}

	const { create_layout, layout } = create_components(undefined);

	await create_layout({
		app,
		components,
		dependencies,
		layout: _layout,
		root: app.config.root + app.config.api_prefix,
		options: {
			fill_height: app.config.fill_height
		}
	});

	const layouts = get(layout);

	return {
		Render: app.config?.auth_required ? Login : Blocks,
		config: {
			...app.config,
			components,
			dependencies,
			layout: _layout,
			current_page: page
		},
		api_url,
		layout: layouts,
		app
	};
}
