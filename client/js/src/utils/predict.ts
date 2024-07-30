import { Client } from "../client";
import type { Dependency, PredictReturn } from "../types";

export async function predict(
	this: Client,
	endpoint: string | number,
	data: unknown[] | Record<string, unknown> = {}
): Promise<PredictReturn> {
	let data_returned = false;
	let status_complete = false;
	let dependency: Dependency;

	if (!this.config) {
		throw new Error("Could not resolve app config");
	}

	if (typeof endpoint === "number") {
		dependency = this.config.dependencies.find((dep) => dep.id == endpoint)!;
	} else {
		const trimmed_endpoint = endpoint.replace(/^\//, "");
		dependency = this.config.dependencies.find(
			(dep) => dep.id == this.api_map[trimmed_endpoint]
		)!;
	}

	return new Promise(async (resolve, reject) => {
		const app = this.submit(endpoint, data, null, null, true);
		let result: unknown;

		for await (const message of app) {
			if (message.type === "data") {
				if (status_complete) {
					resolve(result as PredictReturn);
				}
				data_returned = true;
				result = message;
			}

			if (message.type === "status") {
				if (message.stage === "error") reject(message);
				if (message.stage === "complete") {
					status_complete = true;
					// if complete message comes after data, resolve here
					if (data_returned) {
						resolve(result as PredictReturn);
					}
				}
			}
		}
	});
}
