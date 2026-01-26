// import { type LayoutServerLoad } from "./$types";
import { browser } from "$app/environment";

import { Client } from "@gradio/client";

import type { Config } from "@gradio/client";
import { MISSING_CREDENTIALS_MSG } from "@gradio/client";
import { setupi18n } from "@gradio/core";

export let ssr = true;

export async function load({
	url,
	data: {
		server,
		port,
		local_dev_mode,
		accept_language,
		root_url,
		mount_path,
		cookie,
		auth_required
	},
	route
}): Promise<{
	config: Config;
	api_url: string;
	layout: unknown;
	app: Client | null;
}> {
	let app: Client;
	const api_url =
		browser && !local_dev_mode && root_url
			? new URL(mount_path || "/", root_url).href
			: server;
	const deepLink = url.searchParams.get("deep_link");
	const headers = new Headers();
	if (!browser) {
		headers.append("x-gradio-server", root_url);
		if (cookie) {
			headers.append("Cookie", cookie);
		}
	} else {
		headers.append(
			"x-gradio-server",
			new URL(mount_path, location.origin).href
		);
	}

	// If the server-side check determined auth is required, skip Client.connect
	// This prevents the 401 error on the client during hydration
	if (auth_required) {
		return {
			config: {
				auth_required: true,
				auth_message: "",
				components: [],
				current_page: "",
				dependencies: [],
				layout: {},
				pages: [],
				page: {},
				root: root_url,
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

	try {
		app = await Client.connect(api_url, {
			with_null_state: true,
			events: ["data", "log", "status", "render"],
			query_params: deepLink ? { deep_link: deepLink } : undefined,
			headers,
			cookies: cookies || undefined
		});
	} catch (error: any) {
		const error_message = error.message || "";
		let auth_message = "";
		if (!error_message.includes(MISSING_CREDENTIALS_MSG)) {
			auth_message = error_message.replace(/^Error:?\s*/, "");
		}
		return {
			config: {
				auth_message: auth_message,
				auth_required: true,
				components: [],
				current_page: "",
				dependencies: [],
				layout: {},
				pages: [],
				page: {},
				root: root_url,
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

	await setupi18n(app.config?.i18n_translations || undefined, accept_language);
	return {
		config: page_config,
		api_url,
		app
	};
}
