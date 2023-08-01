import semiver from "semiver";

import {
	process_endpoint,
	RE_SPACE_NAME,
	map_names_to_ids,
	discussions_enabled,
	get_space_hardware,
	set_space_hardware,
	set_space_timeout,
	hardware_types
} from "./utils.js";

import type {
	EventType,
	EventListener,
	ListenerMap,
	Event,
	Payload,
	PostResponse,
	UploadResponse,
	Status,
	SpaceStatus,
	SpaceStatusCallback,
	FileData
} from "./types.js";

import type { Config } from "./types.js";

type event = <K extends EventType>(
	eventType: K,
	listener: EventListener<K>
) => SubmitReturn;
type predict = (
	endpoint: string | number,
	data?: unknown[],
	event_data?: unknown
) => Promise<unknown>;

type client_return = {
	predict: predict;
	config: Config;
	submit: (
		endpoint: string | number,
		data?: unknown[],
		event_data?: unknown
	) => SubmitReturn;
	view_api: (c?: Config) => Promise<ApiInfo<JsApiData>>;
};

type SubmitReturn = {
	on: event;
	off: event;
	cancel: () => Promise<void>;
	destroy: () => void;
	finish: () => Promise<unknown>;
};

const QUEUE_FULL_MSG = "This application is too busy. Keep trying!";
const BROKEN_CONNECTION_MSG = "Connection errored out.";

export let NodeBlob;

export async function duplicate(
	app_reference: string,
	options: {
		hf_token: `hf_${string}`;
		private?: boolean;
		status_callback: SpaceStatusCallback;
		hardware?: (typeof hardware_types)[number];
		timeout?: number;
	}
): Promise<client_return> {
	const { hf_token, private: _private, hardware, timeout } = options;

	if (hardware && !hardware_types.includes(hardware)) {
		throw new Error(
			`Invalid hardware type provided. Valid types are: ${hardware_types
				.map((v) => `"${v}"`)
				.join(",")}.`
		);
	}
	const headers = {
		Authorization: `Bearer ${hf_token}`
	};

	const user = (
		await (
			await fetch(`https://huggingface.co/api/whoami-v2`, {
				headers
			})
		).json()
	).name;

	const space_name = app_reference.split("/")[1];
	const body: {
		repository: string;
		private?: boolean;
	} = {
		repository: `${user}/${space_name}`
	};

	if (_private) {
		body.private = true;
	}

	try {
		const response = await fetch(
			`https://huggingface.co/api/spaces/${app_reference}/duplicate`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json", ...headers },
				body: JSON.stringify(body)
			}
		);

		if (response.status === 409) {
			return client(`${user}/${space_name}`, options);
		}
		const duplicated_space = await response.json();

		let original_hardware;

		if (!hardware) {
			original_hardware = await get_space_hardware(app_reference, hf_token);
		}

		const requested_hardware = hardware || original_hardware || "cpu-basic";
		await set_space_hardware(
			`${user}/${space_name}`,
			requested_hardware,
			hf_token
		);

		await set_space_timeout(`${user}/${space_name}`, timeout || 300, hf_token);
		return client(duplicated_space.url, options);
	} catch (e: any) {
		throw new Error(e);
	}
}

interface Client {
	post_data: (
		url: string,
		body: unknown,
		token?: `hf_${string}`
	) => Promise<[PostResponse, number]>;
	upload_files: (
		root: string,
		files: File[],
		token?: `hf_${string}`
	) => Promise<UploadResponse>;
	client: (
		app_reference: string,
		options: {
			hf_token?: `hf_${string}`;
			status_callback?: SpaceStatusCallback;
			normalise_files?: boolean;
		}
	) => Promise<client_return>;
	handle_blob: (
		endpoint: string,
		data: unknown[],
		api_info: ApiInfo<JsApiData>,
		token?: `hf_${string}`
	) => Promise<unknown[]>;
}

export function api_factory(fetch_implementation: typeof fetch): Client {
	return { post_data, upload_files, client, handle_blob };

	async function post_data(
		url: string,
		body: unknown,
		token?: `hf_${string}`
	): Promise<[PostResponse, number]> {
		const headers: {
			Authorization?: string;
			"Content-Type": "application/json";
		} = { "Content-Type": "application/json" };
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
		try {
			var response = await fetch_implementation(url, {
				method: "POST",
				body: JSON.stringify(body),
				headers
			});
		} catch (e) {
			return [{ error: BROKEN_CONNECTION_MSG }, 500];
		}
		const output: PostResponse = await response.json();
		return [output, response.status];
	}

	async function upload_files(
		root: string,
		files: (Blob | File)[],
		token?: `hf_${string}`
	): Promise<UploadResponse> {
		const headers: {
			Authorization?: string;
		} = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
		const chunkSize = 1000;
		const uploadResponses = [];
		for (let i = 0; i < files.length; i += chunkSize) {
			const chunk = files.slice(i, i + chunkSize);		
			const formData = new FormData();
			chunk.forEach((file) => {
				formData.append("files", file);
			});
			try {
				var response = await fetch_implementation(`${root}/upload`, {
					method: "POST",
					body: formData,
					headers
				});
			} catch (e) {
				return { error: BROKEN_CONNECTION_MSG };
			}
			const output: UploadResponse["files"] = await response.json();
            uploadResponses.push(...output);
		}
		return { files: uploadResponses };
	}

	async function client(
		app_reference: string,
		options: {
			hf_token?: `hf_${string}`;
			status_callback?: SpaceStatusCallback;
			normalise_files?: boolean;
		} = { normalise_files: true }
	): Promise<client_return> {
		return new Promise(async (res) => {
			const { status_callback, hf_token, normalise_files } = options;
			const return_obj = {
				predict,
				submit,
				view_api
				// duplicate
			};

			const transform_files = normalise_files ?? true;
			if (typeof window === "undefined" || !("WebSocket" in window)) {
				const ws = await import("ws");
				NodeBlob = (await import("node:buffer")).Blob;
				//@ts-ignore
				global.WebSocket = ws.WebSocket;
			}

			const { ws_protocol, http_protocol, host, space_id } =
				await process_endpoint(app_reference, hf_token);

			const session_hash = Math.random().toString(36).substring(2);
			const last_status: Record<string, Status["stage"]> = {};
			let config: Config;
			let api_map: Record<string, number> = {};

			let jwt: false | string = false;

			if (hf_token && space_id) {
				jwt = await get_jwt(space_id, hf_token);
			}

			async function config_success(_config: Config): Promise<client_return> {
				config = _config;
				api_map = map_names_to_ids(_config?.dependencies || []);
				try {
					api = await view_api(config);
				} catch (e) {
					console.error(`Could not get api details: ${e.message}`);
				}

				return {
					config,
					...return_obj
				};
			}
			let api: ApiInfo<JsApiData>;
			async function handle_space_sucess(status: SpaceStatus): Promise<void> {
				if (status_callback) status_callback(status);
				if (status.status === "running")
					try {
						config = await resolve_config(
							fetch_implementation,
							`${http_protocol}//${host}`,
							hf_token
						);

						const _config = await config_success(config);
						res(_config);
					} catch (e) {
						console.error(e);
						if (status_callback) {
							status_callback({
								status: "error",
								message: "Could not load this space.",
								load_status: "error",
								detail: "NOT_FOUND"
							});
						}
					}
			}

			try {
				config = await resolve_config(
					fetch_implementation,
					`${http_protocol}//${host}`,
					hf_token
				);

				const _config = await config_success(config);
				res(_config);
			} catch (e) {
				console.error(e);
				if (space_id) {
					check_space_status(
						space_id,
						RE_SPACE_NAME.test(space_id) ? "space_name" : "subdomain",
						handle_space_sucess
					);
				} else {
					if (status_callback)
						status_callback({
							status: "error",
							message: "Could not load this space.",
							load_status: "error",
							detail: "NOT_FOUND"
						});
				}
			}

			function predict(
				endpoint: string,
				data: unknown[],
				event_data?: unknown
			): Promise<unknown> {
				let data_returned = false;
				let status_complete = false;
				return new Promise((res, rej) => {
					const app = submit(endpoint, data, event_data);

					app
						.on("data", (d) => {
							data_returned = true;
							if (status_complete) {
								app.destroy();
							}
							res(d);
						})
						.on("status", (status) => {
							if (status.stage === "error") rej(status);
							if (status.stage === "complete" && data_returned) {
								app.destroy();
							}
							if (status.stage === "complete") {
								status_complete = true;
							}
						});
				});
			}

			function submit(
				endpoint: string | number,
				data: unknown[],
				event_data?: unknown
			): SubmitReturn {
				let fn_index: number;
				let api_info;

				if (typeof endpoint === "number") {
					fn_index = endpoint;
					api_info = api.unnamed_endpoints[fn_index];
				} else {
					const trimmed_endpoint = endpoint.replace(/^\//, "");

					fn_index = api_map[trimmed_endpoint];
					api_info = api.named_endpoints[endpoint.trim()];
				}

				if (typeof fn_index !== "number") {
					throw new Error(
						"There is no endpoint matching that name of fn_index matching that number."
					);
				}

				let websocket: WebSocket;

				const _endpoint = typeof endpoint === "number" ? "/predict" : endpoint;
				let payload: Payload;
				let complete: false | Record<string, any> = false;
				const listener_map: ListenerMap<EventType> = {};

				handle_blob(
					`${http_protocol}//${host + config.path}`,
					data,
					api_info,
					hf_token
				).then((_payload) => {
					payload = { data: _payload || [], event_data, fn_index };
					if (skip_queue(fn_index, config)) {
						fire_event({
							type: "status",
							endpoint: _endpoint,
							stage: "pending",
							queue: false,
							fn_index,
							time: new Date()
						});

						post_data(
							`${http_protocol}//${host + config.path}/run${
								_endpoint.startsWith("/") ? _endpoint : `/${_endpoint}`
							}`,
							{
								...payload,
								session_hash
							},
							hf_token
						)
							.then(([output, status_code]) => {
								const data = transform_files
									? transform_output(
											output.data,
											api_info,
											config.root,
											config.root_url
									  )
									: output.data;
								if (status_code == 200) {
									fire_event({
										type: "data",
										endpoint: _endpoint,
										fn_index,
										data: data,
										time: new Date()
									});

									fire_event({
										type: "status",
										endpoint: _endpoint,
										fn_index,
										stage: "complete",
										eta: output.average_duration,
										queue: false,
										time: new Date()
									});
								} else {
									fire_event({
										type: "status",
										stage: "error",
										endpoint: _endpoint,
										fn_index,
										message: output.error,
										queue: false,
										time: new Date()
									});
								}
							})
							.catch((e) => {
								fire_event({
									type: "status",
									stage: "error",
									message: e.message,
									endpoint: _endpoint,
									fn_index,
									queue: false,
									time: new Date()
								});
							});
					} else {
						fire_event({
							type: "status",
							stage: "pending",
							queue: true,
							endpoint: _endpoint,
							fn_index,
							time: new Date()
						});

						let url = new URL(`${ws_protocol}://${host}${config.path}
							/queue/join`);

						if (jwt) {
							url.searchParams.set("__sign", jwt);
						}

						websocket = new WebSocket(url);

						websocket.onclose = (evt) => {
							if (!evt.wasClean) {
								fire_event({
									type: "status",
									stage: "error",
									broken: true,
									message: BROKEN_CONNECTION_MSG,
									queue: true,
									endpoint: _endpoint,
									fn_index,
									time: new Date()
								});
							}
						};

						websocket.onmessage = function (event) {
							const _data = JSON.parse(event.data);
							const { type, status, data } = handle_message(
								_data,
								last_status[fn_index]
							);

							if (type === "update" && status && !complete) {
								// call 'status' listeners
								fire_event({
									type: "status",
									endpoint: _endpoint,
									fn_index,
									time: new Date(),
									...status
								});
								if (status.stage === "error") {
									websocket.close();
								}
							} else if (type === "hash") {
								websocket.send(JSON.stringify({ fn_index, session_hash }));
								return;
							} else if (type === "data") {
								websocket.send(JSON.stringify({ ...payload, session_hash }));
							} else if (type === "complete") {
								complete = status;
							} else if (type === "log") {
								fire_event({
									type: "log",
									log: data.log,
									level: data.level,
									endpoint: _endpoint,
									fn_index
								});
							} else if (type === "generating") {
								fire_event({
									type: "status",
									time: new Date(),
									...status,
									stage: status?.stage!,
									queue: true,
									endpoint: _endpoint,
									fn_index
								});
							}
							if (data) {
								fire_event({
									type: "data",
									time: new Date(),
									data: transform_files
										? transform_output(
												data.data,
												api_info,
												config.root,
												config.root_url
										  )
										: data.data,
									endpoint: _endpoint,
									fn_index
								});

								if (complete) {
									fire_event({
										type: "status",
										time: new Date(),
										...complete,
										stage: status?.stage!,
										queue: true,
										endpoint: _endpoint,
										fn_index
									});
									websocket.close();
								}
							}
						};

						// different ws contract for gradio versions older than 3.6.0
						//@ts-ignore
						if (semiver(config.version || "2.0.0", "3.6") < 0) {
							addEventListener("open", () =>
								websocket.send(JSON.stringify({ hash: session_hash }))
							);
						}
					}
				});

				function fire_event<K extends EventType>(event: Event<K>): void {
					const narrowed_listener_map: ListenerMap<K> = listener_map;
					const listeners = narrowed_listener_map[event.type] || [];
					listeners?.forEach((l) => l(event));
				}

				function on<K extends EventType>(
					eventType: K,
					listener: EventListener<K>
				): SubmitReturn {
					const narrowed_listener_map: ListenerMap<K> = listener_map;
					const listeners = narrowed_listener_map[eventType] || [];
					narrowed_listener_map[eventType] = listeners;
					listeners?.push(listener);

					return { on, off, cancel, destroy, finish };
				}

				async function finish() {
					return new Promise((res, rej) => {
						const eventType = "status";
						const fn = (status) => {
							if (status.stage === "error") rej(status);
							if (status.stage === "complete") {
								res(true);
							}
						};
						const narrowed_listener_map = listener_map;
						const listeners = narrowed_listener_map[eventType] || [];
						narrowed_listener_map[eventType] = listeners;
						listeners?.push(fn);
					});
				}

				function off<K extends EventType>(
					eventType: K,
					listener: EventListener<K>
				): SubmitReturn {
					const narrowed_listener_map: ListenerMap<K> = listener_map;
					let listeners = narrowed_listener_map[eventType] || [];
					listeners = listeners?.filter((l) => l !== listener);
					narrowed_listener_map[eventType] = listeners;

					return { on, off, cancel, destroy, finish };
				}

				async function cancel(): Promise<void> {
					const _status: Status = {
						stage: "complete",
						queue: false,
						time: new Date()
					};
					complete = _status;
					fire_event({
						..._status,
						type: "status",
						endpoint: _endpoint,
						fn_index: fn_index
					});

					if (websocket && websocket.readyState === 0) {
						websocket.addEventListener("open", () => {
							websocket.close();
						});
					} else {
						websocket.close();
					}

					try {
						await fetch_implementation(
							`${http_protocol}//${host + config.path}/reset`,
							{
								headers: { "Content-Type": "application/json" },
								method: "POST",
								body: JSON.stringify({ fn_index, session_hash })
							}
						);
					} catch (e) {
						console.warn(
							"The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
						);
					}
				}

				function destroy(): void {
					for (const event_type in listener_map) {
						listener_map[event_type as "data" | "status"].forEach((fn) => {
							off(event_type as "data" | "status", fn);
						});
					}
				}

				return {
					on,
					off,
					cancel,
					destroy,
					finish
				};
			}

			async function view_api(config?: Config): Promise<ApiInfo<JsApiData>> {
				if (api) return api;

				const headers: {
					Authorization?: string;
					"Content-Type": "application/json";
				} = { "Content-Type": "application/json" };
				if (hf_token) {
					headers.Authorization = `Bearer ${hf_token}`;
				}
				let response: Response;
				// @ts-ignore
				if (semiver(config.version || "2.0.0", "3.30") < 0) {
					response = await fetch_implementation(
						"https://gradio-space-api-fetcher-v2.hf.space/api",
						{
							method: "POST",
							body: JSON.stringify({
								serialize: false,
								config: JSON.stringify(config)
							}),
							headers
						}
					);
				} else {
					response = await fetch_implementation(`${config.root}/info`, {
						headers
					});
				}

				if (!response.ok) {
					throw new Error(BROKEN_CONNECTION_MSG);
				}

				let api_info = (await response.json()) as
					| ApiInfo<ApiData>
					| { api: ApiInfo<ApiData> };
				if ("api" in api_info) {
					api_info = api_info.api;
				}

				if (
					api_info.named_endpoints["/predict"] &&
					!api_info.unnamed_endpoints["0"]
				) {
					api_info.unnamed_endpoints[0] = api_info.named_endpoints["/predict"];
				}

				const x = transform_api_info(api_info, config, api_map);
				return x;
			}
		});
	}

	async function handle_blob(
		endpoint: string,
		data: unknown[],
		api_info: ApiInfo<JsApiData>,
		token?: `hf_${string}`
	): Promise<unknown[]> {
		const blob_refs = await walk_and_store_blobs(
			data,
			undefined,
			[],
			true,
			api_info
		);

		return Promise.all(
			blob_refs.map(async ({ path, blob, data, type }) => {
				if (blob) {
					const file_url = (await upload_files(endpoint, [blob], token))
						.files[0];
					return { path, file_url, type };
				}
				return { path, base64: data, type };
			})
		).then((r) => {
			r.forEach(({ path, file_url, base64, type }) => {
				if (base64) {
					update_object(data, base64, path);
				} else if (type === "Gallery") {
					update_object(data, file_url, path);
				} else if (file_url) {
					const o = {
						is_file: true,
						name: `${file_url}`,
						data: null
						// orig_name: "file.csv"
					};
					update_object(data, o, path);
				}
			});

			return data;
		});
	}
}

export const { post_data, upload_files, client, handle_blob } =
	api_factory(fetch);

function transform_output(
	data: any[],
	api_info: any,
	root_url: string,
	remote_url?: string
): unknown[] {
	return data.map((d, i) => {
		if (api_info.returns?.[i]?.component === "File") {
			return normalise_file(d, root_url, remote_url);
		} else if (api_info.returns?.[i]?.component === "Gallery") {
			return d.map((img) => {
				return Array.isArray(img)
					? [normalise_file(img[0], root_url, remote_url), img[1]]
					: [normalise_file(img, root_url, remote_url), null];
			});
		} else if (typeof d === "object" && d?.is_file) {
			return normalise_file(d, root_url, remote_url);
		}
		return d;
	});
}

function normalise_file(
	file: FileData[],
	root: string,
	root_url: string | null
): FileData[];
function normalise_file(
	file: FileData | string,
	root: string,
	root_url: string | null
): FileData;
function normalise_file(
	file: null,
	root: string,
	root_url: string | null
): null;
function normalise_file(file, root, root_url): FileData[] | FileData | null {
	if (file == null) return null;
	if (typeof file === "string") {
		return {
			name: "file_data",
			data: file
		};
	} else if (Array.isArray(file)) {
		const normalized_file: (FileData | null)[] = [];

		for (const x of file) {
			if (x === null) {
				normalized_file.push(null);
			} else {
				normalized_file.push(normalise_file(x, root, root_url));
			}
		}

		return normalized_file as FileData[];
	} else if (file.is_file) {
		if (!root_url) {
			file.data = root + "/file=" + file.name;
		} else {
			file.data = "/proxy=" + root_url + "file=" + file.name;
		}
	}
	return file;
}

interface ApiData {
	label: string;
	type: {
		type: any;
		description: string;
	};
	component: string;
	example_input?: any;
}

interface JsApiData {
	label: string;
	type: string;
	component: string;
	example_input: any;
}

interface EndpointInfo<T extends ApiData | JsApiData> {
	parameters: T[];
	returns: T[];
}
interface ApiInfo<T extends ApiData | JsApiData> {
	named_endpoints: {
		[key: string]: EndpointInfo<T>;
	};
	unnamed_endpoints: {
		[key: string]: EndpointInfo<T>;
	};
}

function get_type(
	type: { [key: string]: any },
	component: string,
	serializer: string,
	signature_type: "return" | "parameter"
): string {
	switch (type.type) {
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

function get_description(
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
	return type.description;
}

function transform_api_info(
	api_info: ApiInfo<ApiData>,
	config: Config,
	api_map: Record<string, number>
): ApiInfo<JsApiData> {
	const new_data = {
		named_endpoints: {},
		unnamed_endpoints: {}
	};
	for (const key in api_info) {
		const cat = api_info[key];

		for (const endpoint in cat) {
			const dep_index = config.dependencies[endpoint]
				? endpoint
				: api_map[endpoint.replace("/", "")];

			const info = cat[endpoint];
			new_data[key][endpoint] = {};
			new_data[key][endpoint].parameters = {};
			new_data[key][endpoint].returns = {};
			new_data[key][endpoint].type = config.dependencies[dep_index].types;
			new_data[key][endpoint].parameters = info.parameters.map(
				({ label, component, type, serializer }) => ({
					label,
					component,
					type: get_type(type, component, serializer, "parameter"),
					description: get_description(type, serializer)
				})
			);

			new_data[key][endpoint].returns = info.returns.map(
				({ label, component, type, serializer }) => ({
					label,
					component,
					type: get_type(type, component, serializer, "return"),
					description: get_description(type, serializer)
				})
			);
		}
	}

	return new_data;
}

async function get_jwt(
	space: string,
	token: `hf_${string}`
): Promise<string | false> {
	try {
		const r = await fetch(`https://huggingface.co/api/spaces/${space}/jwt`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const jwt = (await r.json()).token;

		return jwt || false;
	} catch (e) {
		console.error(e);
		return false;
	}
}

function update_object(object, newValue, stack): void {
	while (stack.length > 1) {
		object = object[stack.shift()];
	}

	object[stack.shift()] = newValue;
}

export async function walk_and_store_blobs(
	param,
	type = undefined,
	path = [],
	root = false,
	api_info = undefined
): Promise<
	{
		path: string[];
		data: string | false;
		type: string;
		blob: Blob | false;
	}[]
> {
	if (Array.isArray(param)) {
		let blob_refs = [];

		await Promise.all(
			param.map(async (v, i) => {
				let new_path = path.slice();
				new_path.push(i);

				const array_refs = await walk_and_store_blobs(
					param[i],
					root ? api_info?.parameters[i]?.component || undefined : type,
					new_path,
					false,
					api_info
				);

				blob_refs = blob_refs.concat(array_refs);
			})
		);

		return blob_refs;
	} else if (globalThis.Buffer && param instanceof globalThis.Buffer) {
		const is_image = type === "Image";
		return [
			{
				path: path,
				blob: is_image ? false : new NodeBlob([param]),
				data: is_image ? `${param.toString("base64")}` : false,
				type
			}
		];
	} else if (
		param instanceof Blob ||
		(typeof window !== "undefined" && param instanceof File)
	) {
		if (type === "Image") {
			let data;

			if (typeof window !== "undefined") {
				// browser
				data = await image_to_data_uri(param);
			} else {
				const buffer = await param.arrayBuffer();
				data = Buffer.from(buffer).toString("base64");
			}

			return [{ path, data, type, blob: false }];
		}
		return [{ path: path, blob: param, type, data: false }];
	} else if (typeof param === "object") {
		let blob_refs = [];
		for (let key in param) {
			if (param.hasOwnProperty(key)) {
				let new_path = path.slice();
				new_path.push(key);
				blob_refs = blob_refs.concat(
					await walk_and_store_blobs(
						param[key],
						undefined,
						new_path,
						false,
						api_info
					)
				);
			}
		}
		return blob_refs;
	}
	return [];
}

function image_to_data_uri(blob: Blob): Promise<string | ArrayBuffer> {
	return new Promise((resolve, _) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
}

function skip_queue(id: number, config: Config): boolean {
	return (
		!(config?.dependencies?.[id]?.queue === null
			? config.enable_queue
			: config?.dependencies?.[id]?.queue) || false
	);
}

async function resolve_config(
	fetch_implementation: typeof fetch,
	endpoint?: string,
	token?: `hf_${string}`
): Promise<Config> {
	const headers: { Authorization?: string } = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	if (
		typeof window !== "undefined" &&
		window.gradio_config &&
		location.origin !== "http://localhost:9876"
	) {
		const path = window.gradio_config.root;
		const config = window.gradio_config;
		config.root = endpoint + config.root;
		return { ...config, path: path };
	} else if (endpoint) {
		let response = await fetch_implementation(`${endpoint}/config`, {
			headers
		});

		if (response.status === 200) {
			const config = await response.json();
			config.path = config.path ?? "";
			config.root = endpoint;
			return config;
		}
		throw new Error("Could not get config.");
	}

	throw new Error("No config or app endpoint found");
}

async function check_space_status(
	id: string,
	type: "subdomain" | "space_name",
	status_callback: SpaceStatusCallback
): Promise<void> {
	let endpoint =
		type === "subdomain"
			? `https://huggingface.co/api/spaces/by-subdomain/${id}`
			: `https://huggingface.co/api/spaces/${id}`;
	let response;
	let _status;
	try {
		response = await fetch(endpoint);
		_status = response.status;
		if (_status !== 200) {
			throw new Error();
		}
		response = await response.json();
	} catch (e) {
		status_callback({
			status: "error",
			load_status: "error",
			message: "Could not get space status",
			detail: "NOT_FOUND"
		});
		return;
	}

	if (!response || _status !== 200) return;
	const {
		runtime: { stage },
		id: space_name
	} = response;

	switch (stage) {
		case "STOPPED":
		case "SLEEPING":
			status_callback({
				status: "sleeping",
				load_status: "pending",
				message: "Space is asleep. Waking it up...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, status_callback);
			}, 1000); // poll for status
			break;
		case "PAUSED":
			status_callback({
				status: "paused",
				load_status: "error",
				message:
					"This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
				detail: stage,
				discussions_enabled: await discussions_enabled(space_name)
			});
			break;
		case "RUNNING":
		case "RUNNING_BUILDING":
			status_callback({
				status: "running",
				load_status: "complete",
				message: "",
				detail: stage
			});
			// load_config(source);
			//  launch
			break;
		case "BUILDING":
			status_callback({
				status: "building",
				load_status: "pending",
				message: "Space is building...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, status_callback);
			}, 1000);
			break;
		default:
			status_callback({
				status: "space_error",
				load_status: "error",
				message: "This space is experiencing an issue.",
				detail: stage,
				discussions_enabled: await discussions_enabled(space_name)
			});
			break;
	}
}

function handle_message(
	data: any,
	last_status: Status["stage"]
): {
	type: "hash" | "data" | "update" | "complete" | "generating" | "log" | "none";
	data?: any;
	status?: Status;
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
					eta: data.average_duration
				},
				data: data.success ? data.output : null
			};
		case "process_completed":
			if ("error" in data.output) {
				return {
					type: "update",
					status: {
						queue,
						message: data.output.error as string,
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
					eta: data.output.average_duration
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
					success: data.success
				}
			};
	}

	return { type: "none", status: { stage: "error", queue } };
}
