import { Client } from "../client";
import type { Dependency, PredictReturn } from "../types";

export async function predict<T = unknown>(
	this: Client,
	endpoint: string | number,
	data: unknown[] | Record<string, unknown> = {}
): Promise<PredictReturn<T>> {
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

	const app = this.submit(endpoint, data, null, null, true);
	let result: unknown;

	for await (const message of app) {
		if (message.type === "data") {
			data_returned = true;
			result = message;
			if (status_complete) {
				return result as PredictReturn<T>;
			}
		}

		if (message.type === "status") {
			if (message.stage === "error") {
				// Throw a real `Error` (rather than the raw status object) so that
				// uncaught failures surface a readable message instead of
				// crashing Node with `ERR_UNHANDLED_REJECTION ... reason "#<Object>"`.
				// The status fields are preserved on the error for callers that
				// inspect them.
				const { message: error_message, ...status } = message;
				const error = new Error(
					(typeof error_message === "string"
						? error_message
						: error_message && JSON.stringify(error_message)) ||
						"An unknown error occurred while making a prediction."
				);
				Object.assign(error, status);
				throw error;
			}
			if (message.stage === "complete") {
				status_complete = true;
				// if complete message comes after data, resolve here
				if (data_returned) {
					return result as PredictReturn<T>;
				}
			}
		}
	}

	return result as PredictReturn<T>;
}
