import type { ApiInfo, ApiData, EndpointInfo, JsApiData } from "../types";
import { API_INFO_URL, BROKEN_CONNECTION_MSG } from "../constants";
import { Client } from "../client";
import { SPACE_FETCHER_URL } from "../constants";
import { join_urls, transform_api_info } from "../helpers/api_info";

async function fetch_api_info(
	client: Client,
	all_endpoints: boolean
): Promise<ApiInfo<ApiData>> {
	const { token } = client.options;
	const headers: {
		Authorization?: string;
	} = {};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const url = new URL(
		join_urls(client.config!.root, client.api_prefix, API_INFO_URL)
	);
	if (client.page !== null) url.searchParams.set("page", client.page);
	if (all_endpoints) url.searchParams.set("all_endpoints", "True");
	const response = await client.fetch(url, {
		headers,
		credentials: client.options.credentials ?? "same-origin"
	});
	if (!response.ok) {
		throw new Error(BROKEN_CONNECTION_MSG);
	}
	const api_info: ApiInfo<ApiData> | { api: ApiInfo<ApiData> } =
		await response.json();
	return "api" in api_info ? api_info.api : api_info;
}

export async function view_api(this: Client): Promise<any> {
	if (this.api_info) return this.api_info;

	const { config } = this;

	if (!config) {
		return;
	}

	try {
		let api_info: ApiInfo<ApiData> | { api: ApiInfo<ApiData> };
		if (typeof window !== "undefined" && window.gradio_api_info) {
			api_info = window.gradio_api_info;
		} else {
			api_info = await fetch_api_info(this, false);
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

/**
 * The named endpoints with api_visibility="undocumented", which /info lists
 * only when asked for all endpoints. submit() needs their parameters to take
 * named arguments; view_api() still leaves them out.
 */
export async function undocumented_endpoints(
	this: Client
): Promise<Record<string, EndpointInfo<JsApiData>>> {
	const { config } = this;
	if (
		!config?.dependencies?.some(
			(dep) => dep.api_name && dep.api_visibility === "undocumented"
		)
	) {
		return {};
	}
	try {
		const api_info = await fetch_api_info(this, true);
		return transform_api_info(api_info, config, this.api_map).named_endpoints;
	} catch (e) {
		console.error(
			"Could not get the API info of undocumented endpoints. " +
				(e as Error).message
		);
		return {};
	}
}
