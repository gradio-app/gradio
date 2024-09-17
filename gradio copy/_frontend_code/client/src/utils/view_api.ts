import type { ApiInfo, ApiData } from "../types";
import semiver from "semiver";
import { API_INFO_URL, BROKEN_CONNECTION_MSG } from "../constants";
import { Client } from "../client";
import { SPACE_FETCHER_URL } from "../constants";
import { join_urls, transform_api_info } from "../helpers/api_info";

export async function view_api(this: Client): Promise<any> {
	if (this.api_info) return this.api_info;

	const { hf_token } = this.options;
	const { config } = this;

	const headers: {
		Authorization?: string;
		"Content-Type": "application/json";
	} = { "Content-Type": "application/json" };

	if (hf_token) {
		headers.Authorization = `Bearer ${hf_token}`;
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
			if (semiver(config?.version || "2.0.0", "3.30") < 0) {
				response = await this.fetch(SPACE_FETCHER_URL, {
					method: "POST",
					body: JSON.stringify({
						serialize: false,
						config: JSON.stringify(config)
					}),
					headers,
					credentials: "include"
				});
			} else {
				const url = join_urls(config.root, this.api_prefix, API_INFO_URL);
				response = await this.fetch(url, {
					headers,
					credentials: "include"
				});
			}

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
		"Could not get API info. " + (e as Error).message;
	}
}
