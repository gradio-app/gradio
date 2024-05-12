import { Client } from "../client";
import type { Dependency, SubmitReturn } from "../types";

export async function predict(
	this: Client,
	endpoint: string | number,
	data: unknown[] | Record<string, unknown>
): Promise<SubmitReturn> {
	let data_returned = false;
	let status_complete = false;
	let dependency: Dependency;

	if (!this.config) {
		throw new Error("Could not resolve app config");
	}

	if (typeof endpoint === "number") {
		dependency = this.config.dependencies[endpoint];
	} else {
		const trimmed_endpoint = endpoint.replace(/^\//, "");
		dependency = this.config.dependencies[this.api_map[trimmed_endpoint]];
	}

	if (dependency?.types.continuous) {
		throw new Error(
			"Cannot call predict on this function as it may run forever. Use submit instead"
		);
	}

	return new Promise(async (resolve, reject) => {
		const app = this.submit(endpoint, data);
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
