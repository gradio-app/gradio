import { Config, ApiInfo, ApiData } from "../types";
import {
	process_endpoint,
	resolve_config,
	map_names_to_ids,
	transform_api_info
} from "../helpers";
import semiver from "semiver";
import { API_INFO_URL, SPACE_FETCHER_URL } from "../constants";
import { Client } from "../Client";

export async function view_api(this: Client, config?: Config): Promise<any> {
	const { hf_token } = this.options;
	let api_map: Record<string, number> = {};

	const { http_protocol, host } = await process_endpoint(
		this.app_reference,
		hf_token ? `hf_${hf_token}` : undefined
	);

	const headers: {
		Authorization?: string;
		"Content-Type": "application/json";
	} = { "Content-Type": "application/json" };

	if (hf_token) {
		headers.Authorization = `Bearer ${hf_token}`;
	}

	try {
		if (!config) {
			try {
				config = await resolve_config(
					fetch,
					`${http_protocol}//${host}`,
					`hf_${hf_token}`
				);
			} catch (e) {
				console.error(e);
			}
		}

		let response: Response;

		if (semiver(config?.version || "2.0.0", "3.30") < 0) {
			response = await fetch(SPACE_FETCHER_URL, {
				method: "POST",
				body: JSON.stringify({
					serialize: false,
					config: JSON.stringify(config)
				}),
				headers
			});
		} else {
			response = await fetch(`${config?.root}/${API_INFO_URL}`, {
				headers
			});
		}

		api_map = map_names_to_ids(config?.dependencies || []);

		if (!response.ok) {
			throw new Error("Error fetching API info");
		}

		let api_info = (await response.json()) as
			| ApiInfo<ApiData>
			| { api: ApiInfo<ApiData> };

		if (config) {
			return transform_api_info(api_info, config, api_map);
		}
	} catch (e) {
		throw new Error("Could not get API info. " + (e as Error).message);
	}
}
