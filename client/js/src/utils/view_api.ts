import { ApiInfo, ApiData, Config } from "../types";
import { transform_api_info } from "../helpers";
import semiver from "semiver";
import { API_INFO_URL } from "../constants";
import { Client } from "../client";
import { SPACE_FETCHER_URL } from "../constants";

export async function view_api(this: Client, config?: Config): Promise<any> {
	const { hf_token } = this.options;

	const headers: {
		Authorization?: string;
		"Content-Type": "application/json";
	} = { "Content-Type": "application/json" };

	if (hf_token) {
		headers.Authorization = `Bearer ${hf_token}`;
	}

	try {
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

		if (!response.ok) {
			throw new Error("Error fetching API info");
		}

		let api_info = (await response.json()) as
			| ApiInfo<ApiData>
			| { api: ApiInfo<ApiData> };

		if (config) {
			return transform_api_info(api_info, config, this.api_map);
		}
	} catch (e) {
		"Could not get API info. " + (e as Error).message;
	}
}
