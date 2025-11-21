import type { ApiInfo, ApiData } from "../types";
import { API_INFO_URL, BROKEN_CONNECTION_MSG } from "../constants";
import { Client } from "../client";
import { SPACE_FETCHER_URL } from "../constants";
import { join_urls, transform_api_info } from "../helpers/api_info";

export async function view_api(this: Client): Promise<any> {
	if (this.api_info) return this.api_info;

	const { token } = this.options;
	const { config } = this;

	const headers: {
		Authorization?: string;
		"Content-Type": "application/json";
	} = { "Content-Type": "application/json" };

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	if (!config) {
		return;
	}

	try {
		let response: Response;
		let api_info: ApiInfo<ApiData> | { api: ApiInfo<ApiData> };
		if (typeof window !== "undefined" && window.gradio_api_info) {
			api_info = window.gradio_api_info;
		} else {
			const url = join_urls(config.root, this.api_prefix, API_INFO_URL);
			response = await this.fetch(url, {
				headers,
				credentials: "include"
			});
			if (!response.ok) {
				throw new Error(BROKEN_CONNECTION_MSG);
			}
			api_info = await response.json();
		}
		if ("api" in api_info) {
			api_info = api_info.api;
		}

		if (
			api_info.named_endpoints["/predict"] &&
			!api_info.unnamed_endpoints["0"]
		) {
			api_info.unnamed_endpoints[0] = api_info.named_endpoints["/predict"];
		}

		return transform_api_info(api_info, config, this.api_map);
	} catch (e) {
		throw new Error("Could not get API info. " + (e as Error).message);
	}
}
