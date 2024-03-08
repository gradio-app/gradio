import { Client } from "../client";
import { map_names_to_ids, process_endpoint, resolve_config } from "../helpers";
import { Dependency, SubmitReturn } from "../types";

export async function predict(
	this: Client,
	endpoint: string | number,
	data?: unknown[],
	event_data?: unknown
): Promise<SubmitReturn> {
	const { hf_token } = this.options;

	const { http_protocol, host } =
		(await process_endpoint(this.app_reference, hf_token ?? undefined)) || {};

	if (!http_protocol || !host) {
		throw new Error("Could not get host");
	}

	let config = await resolve_config(
		fetch,
		`${http_protocol}//${host}`,
		hf_token
	);

	if (!config) {
		throw new Error("No config or app_id set");
	}

	let api_map = map_names_to_ids(config?.dependencies || []);

	let dependency: Dependency;

	if (typeof endpoint === "number") {
		dependency = config.dependencies[endpoint];
	} else {
		const trimmed_endpoint = endpoint.replace(/^\//, "");
		dependency = config.dependencies[api_map[trimmed_endpoint]];
	}

	if (dependency?.types.continuous) {
		throw new Error(
			"Cannot call predict on this function as it may run forever. Use submit instead"
		);
	}

	return new Promise(async (resolve, reject) => {
		const app = this.submit(endpoint, data || [], event_data);
		let result: unknown;
		let data_returned = false;
		let status_complete = false;

		app
			.on("data", (d: unknown) => {
				if (status_complete) {
					app.destroy();
					resolve(d as SubmitReturn);
				}
				data_returned = true;
				result = d;
			})
			.on("status", (status: { stage: string }) => {
				if (status.stage === "error") reject(status);
				if (status.stage === "complete") {
					status_complete = true;
					if (data_returned) {
						app.destroy();
						resolve(result as SubmitReturn);
					}
				}
			});
	});
}
