import { Client } from "../client";
import type { SubmitReturn, PredictOptions } from "../types";

export async function predict(
	this: Client,
	endpoint_or_options: string | number | PredictOptions,
	data?: unknown[]
): Promise<SubmitReturn> {
	let endpoint: string | number;
	let resolved_data: unknown[] = [];

	if (
		typeof endpoint_or_options === "object" &&
		endpoint_or_options !== null &&
		!Array.isArray(endpoint_or_options) &&
		"endpoint" in endpoint_or_options
	) {
		endpoint = endpoint_or_options.endpoint;
		resolved_data = endpoint_or_options.data || [];
	} else if (
		typeof endpoint_or_options === "string" ||
		typeof endpoint_or_options === "number"
	) {
		endpoint = endpoint_or_options;
		if (data) {
			resolved_data = data;
		}
	} else {
		throw new Error("Invalid arguments passed to predict.");
	}

	let data_returned = false;
	let status_complete = false;

	let dependencyIndex =
		typeof endpoint === "number"
			? endpoint
			: this.api_map[endpoint.toString().replace(/^\//, "")];
	if (!this.config || !this.config.dependencies[dependencyIndex]) {
		throw new Error("Could not resolve app config or invalid endpoint");
	}
	let dependency = this.config.dependencies[dependencyIndex];

	if (dependency?.types.continuous) {
		throw new Error(
			"Cannot call predict on this function as it may run forever. Use submit instead"
		);
	}

	return new Promise(async (resolve, reject) => {
		const app = this.submit(endpoint, resolved_data || []);
		let result: unknown;

		app
			.on("data", (d: unknown) => {
				// if complete message comes before data, resolve here
				if (status_complete) {
					app.destroy();
					resolve(d as SubmitReturn);
				}
				data_returned = true;
				result = d;
			})
			.on("status", (status) => {
				if (status.stage === "error") reject(status);
				if (status.stage === "complete") {
					status_complete = true;
					// if complete message comes after data, resolve here
					if (data_returned) {
						app.destroy();
						resolve(result as SubmitReturn);
					}
				}
			});
	});
}
