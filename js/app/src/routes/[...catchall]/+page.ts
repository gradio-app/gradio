// import { type LayoutServerLoad } from "./$types";

import { Client } from "@gradio/client";
import { create_components } from "@gradio/core";
import { get } from "svelte/store";
import type { Config } from "@gradio/client";

declare let BUILD_MODE: string;
const gradio_dev_mode = "dev";
const server_port = 7860;
const host = "";
const space = "";
const src = "";

import Blocks from "@gradio/core/blocks";
import Login from "@gradio/core/login";

import type { PageLoad, PageData } from "./$types";
export async function load({ url }): Promise<{
	Render: typeof Login | typeof Blocks;
	config: Config;
	api_url: string;
	layout: unknown;
	app: Client;
}> {
	const api_url =
		BUILD_MODE === "dev" || gradio_dev_mode === "dev"
			? `http://127.0.0.1:${
					typeof server_port === "number" ? server_port : 7860
				}`
			: host || space || src || url.origin;

	const app = await Client.connect(api_url, {
		with_null_state: true,
		events: ["data", "log", "status", "render"]
	});

	if (!app.config) {
		throw new Error("No config found");
	}

	const { create_layout, layout } = create_components();
	// console.log("create_layout start", create_layout);
	console.log({ app });
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

	// console.log({ layouts });

	return {
		Render: app.config?.auth_required ? Login : Blocks,
		config: app.config,
		api_url: api_url,
		layout: layouts,
		app
	};
}
