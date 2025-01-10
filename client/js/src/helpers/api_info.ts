import {
	HOST_URL,
	INVALID_URL_MSG,
	QUEUE_FULL_MSG,
	SPACE_METADATA_ERROR_MSG
} from "../constants";
import type {
	ApiData,
	ApiInfo,
	Config,
	JsApiData,
	EndpointInfo,
	Status
} from "../types";
import { determine_protocol } from "./init_helpers";

export const RE_SPACE_NAME = /^[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+$/;
export const RE_SPACE_DOMAIN = /.*hf\.space\/{0,1}.*$/;

export async function process_endpoint(
	app_reference: string,
	hf_token?: `hf_${string}`
): Promise<{
	space_id: string | false;
	host: string;
	ws_protocol: "ws" | "wss";
	http_protocol: "http:" | "https:";
}> {
	const headers: { Authorization?: string } = {};
	if (hf_token) {
		headers.Authorization = `Bearer ${hf_token}`;
	}

	const _app_reference = app_reference.trim().replace(/\/$/, "");

	if (RE_SPACE_NAME.test(_app_reference)) {
		// app_reference is a HF space name
		try {
			const res = await fetch(
				`https://huggingface.co/api/spaces/${_app_reference}/${HOST_URL}`,
				{ headers }
			);

			const _host = (await res.json()).host;

			return {
				space_id: app_reference,
				...determine_protocol(_host)
			};
		} catch (e) {
			throw new Error(SPACE_METADATA_ERROR_MSG);
		}
	}

	if (RE_SPACE_DOMAIN.test(_app_reference)) {
		// app_reference is a direct HF space domain
		const { ws_protocol, http_protocol, host } =
			determine_protocol(_app_reference);

		return {
			space_id: host.split("/")[0].replace(".hf.space", ""),
			ws_protocol,
			http_protocol,
			host
		};
	}

	return {
		space_id: false,
		...determine_protocol(_app_reference)
	};
}

export const join_urls = (...urls: string[]): string => {
	try {
		return urls.reduce((base_url: string, part: string) => {
			base_url = base_url.replace(/\/+$/, "");
			part = part.replace(/^\/+/, "");
			return new URL(part, base_url + "/").toString();
		});
	} catch (e) {
		throw new Error(INVALID_URL_MSG);
	}
};

export function transform_api_info(
	api_info: ApiInfo<ApiData>,
	config: Config,
	api_map: Record<string, number>
): ApiInfo<JsApiData> {
	const transformed_info: ApiInfo<JsApiData> = {
		named_endpoints: {},
		unnamed_endpoints: {}
	};

	Object.keys(api_info).forEach((category) => {
		if (category === "named_endpoints" || category === "unnamed_endpoints") {
			transformed_info[category] = {};

			Object.entries(api_info[category]).forEach(
				([endpoint, { parameters, returns }]) => {
					const dependencyIndex =
						config.dependencies.find(
							(dep) =>
								dep.api_name === endpoint ||
								dep.api_name === endpoint.replace("/", "")
						)?.id ||
						api_map[endpoint.replace("/", "")] ||
						-1;

					const dependencyTypes =
						dependencyIndex !== -1
							? config.dependencies.find((dep) => dep.id == dependencyIndex)
									?.types
							: { generator: false, cancel: false };

					if (
						dependencyIndex !== -1 &&
						config.dependencies.find((dep) => dep.id == dependencyIndex)?.inputs
							?.length !== parameters.length
					) {
						const components = config.dependencies
							.find((dep) => dep.id == dependencyIndex)!
							.inputs.map(
								(input) => config.components.find((c) => c.id === input)?.type
							);

						try {
							components.forEach((comp, idx) => {
								if (comp === "state") {
									const new_param = {
										component: "state",
										example: null,
										parameter_default: null,
										parameter_has_default: true,
										parameter_name: null,
										hidden: true
									};

									// @ts-ignore
									parameters.splice(idx, 0, new_param);
								}
							});
						} catch (e) {
							console.error(e);
						}
					}

					const transform_type = (
						data: ApiData,
						component: string,
						serializer: string,
						signature_type: "return" | "parameter"
					): JsApiData => ({
						...data,
						description: get_description(data?.type, serializer),
						type:
							get_type(data?.type, component, serializer, signature_type) || ""
					});

					transformed_info[category][endpoint] = {
						parameters: parameters.map((p: ApiData) =>
							transform_type(p, p?.component, p?.serializer, "parameter")
						),
						returns: returns.map((r: ApiData) =>
							transform_type(r, r?.component, r?.serializer, "return")
						),
						type: dependencyTypes
					};
				}
			);
		}
	});

	return transformed_info;
}

export function get_type(
	type: { type: any; description: string },
	component: string,
	serializer: string,
	signature_type: "return" | "parameter"
): string | undefined {
	if (component === "Api") return type.type;
	switch (type?.type) {
		case "string":
			return "string";
		case "boolean":
			return "boolean";
		case "number":
			return "number";
	}

	if (
		serializer === "JSONSerializable" ||
		serializer === "StringSerializable"
	) {
		return "any";
	} else if (serializer === "ListStringSerializable") {
		return "string[]";
	} else if (component === "Image") {
		return signature_type === "parameter" ? "Blob | File | Buffer" : "string";
	} else if (serializer === "FileSerializable") {
		if (type?.type === "array") {
			return signature_type === "parameter"
				? "(Blob | File | Buffer)[]"
				: `{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}[]`;
		}
		return signature_type === "parameter"
			? "Blob | File | Buffer"
			: `{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}`;
	} else if (serializer === "GallerySerializable") {
		return signature_type === "parameter"
			? "[(Blob | File | Buffer), (string | null)][]"
			: `[{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}, (string | null))][]`;
	}
}

export function get_description(
	type: { type: any; description: string },
	serializer: string
): string {
	if (serializer === "GallerySerializable") {
		return "array of [file, label] tuples";
	} else if (serializer === "ListStringSerializable") {
		return "array of strings";
	} else if (serializer === "FileSerializable") {
		return "array of files or single file";
	}
	return type?.description;
}

/* eslint-disable complexity */
export function handle_message(
	data: any,
	last_status: Status["stage"]
): {
	type:
		| "hash"
		| "data"
		| "update"
		| "complete"
		| "generating"
		| "log"
		| "none"
		| "heartbeat"
		| "streaming"
		| "unexpected_error";
	data?: any;
	status?: Status;
	original_msg?: string;
} {
	const queue = true;
	switch (data.msg) {
		case "send_data":
			return { type: "data" };
		case "send_hash":
			return { type: "hash" };
		case "queue_full":
			return {
				type: "update",
				status: {
					queue,
					message: QUEUE_FULL_MSG,
					stage: "error",
					code: data.code,
					success: data.success
				}
			};
		case "heartbeat":
			return {
				type: "heartbeat"
			};
		case "unexpected_error":
			return {
				type: "unexpected_error",
				status: {
					queue,
					message: data.message,
					stage: "error",
					success: false
				}
			};
		case "estimation":
			return {
				type: "update",
				status: {
					queue,
					stage: last_status || "pending",
					code: data.code,
					size: data.queue_size,
					position: data.rank,
					eta: data.rank_eta,
					success: data.success
				}
			};
		case "progress":
			return {
				type: "update",
				status: {
					queue,
					stage: "pending",
					code: data.code,
					progress_data: data.progress_data,
					success: data.success
				}
			};
		case "log":
			return { type: "log", data: data };
		case "process_generating":
			return {
				type: "generating",
				status: {
					queue,
					message: !data.success ? data.output.error : null,
					stage: data.success ? "generating" : "error",
					code: data.code,
					progress_data: data.progress_data,
					eta: data.average_duration,
					changed_state_ids: data.success
						? data.output.changed_state_ids
						: undefined
				},
				data: data.success ? data.output : null
			};
		case "process_streaming":
			return {
				type: "streaming",
				status: {
					queue,
					message: data.output.error,
					stage: "streaming",
					time_limit: data.time_limit,
					code: data.code,
					progress_data: data.progress_data,
					eta: data.eta
				},
				data: data.output
			};
		case "process_completed":
			if ("error" in data.output) {
				return {
					type: "update",
					status: {
						queue,
						title: data.output.title as string,
						message: data.output.error as string,
						visible: data.output.visible as boolean,
						duration: data.output.duration as number,
						stage: "error",
						code: data.code,
						success: data.success
					}
				};
			}
			return {
				type: "complete",
				status: {
					queue,
					message: !data.success ? data.output.error : undefined,
					stage: data.success ? "complete" : "error",
					code: data.code,
					progress_data: data.progress_data,
					changed_state_ids: data.success
						? data.output.changed_state_ids
						: undefined
				},
				data: data.success ? data.output : null
			};

		case "process_starts":
			return {
				type: "update",
				status: {
					queue,
					stage: "pending",
					code: data.code,
					size: data.rank,
					position: 0,
					success: data.success,
					eta: data.eta
				},
				original_msg: "process_starts"
			};
	}

	return { type: "none", status: { stage: "error", queue } };
}
/* eslint-enable complexity */

/**
 * Maps the provided `data` to the parameters defined by the `/info` endpoint response.
 * This allows us to support both positional and keyword arguments passed to the client
 * and ensures that all parameters are either directly provided or have default values assigned.
 *
 * @param {unknown[] | Record<string, unknown>} data - The input data for the function,
 *        which can be either an array of values for positional arguments or an object
 *        with key-value pairs for keyword arguments.
 * @param {JsApiData[]} parameters - Array of parameter descriptions retrieved from the
 *        `/info` endpoint.
 *
 * @returns {unknown[]} - Returns an array of resolved data where each element corresponds
 *         to the expected parameter from the API. The `parameter_default` value is used where
 *         a value is not provided for a parameter, and optional parameters without defaults are
 * 		   set to `undefined`.
 *
 * @throws {Error} - Throws an error:
 *         - If more arguments are provided than are defined in the parameters.
 *  *      - If no parameter value is provided for a required parameter and no default value is defined.
 *         - If an argument is provided that does not match any defined parameter.
 */

export const map_data_to_params = (
	data: unknown[] | Record<string, unknown> = [],
	endpoint_info: EndpointInfo<JsApiData | ApiData>
): unknown[] => {
	// Workaround for the case where the endpoint_info is undefined
	// See https://github.com/gradio-app/gradio/pull/8820#issuecomment-2237381761
	const parameters = endpoint_info ? endpoint_info.parameters : [];

	if (Array.isArray(data)) {
		if (data.length > parameters.length) {
			console.warn("Too many arguments provided for the endpoint.");
		}
		return data;
	}

	const resolved_data: unknown[] = [];
	const provided_keys = Object.keys(data);

	parameters.forEach((param, index) => {
		if (data.hasOwnProperty(param.parameter_name)) {
			resolved_data[index] = data[param.parameter_name];
		} else if (param.parameter_has_default) {
			resolved_data[index] = param.parameter_default;
		} else {
			throw new Error(
				`No value provided for required parameter: ${param.parameter_name}`
			);
		}
	});

	provided_keys.forEach((key) => {
		if (!parameters.some((param) => param.parameter_name === key)) {
			throw new Error(
				`Parameter \`${key}\` is not a valid keyword argument. Please refer to the API for usage.`
			);
		}
	});

	resolved_data.forEach((value, idx) => {
		if (value === undefined && !parameters[idx].parameter_has_default) {
			throw new Error(
				`No value provided for required parameter: ${parameters[idx].parameter_name}`
			);
		}
	});

	return resolved_data;
};
