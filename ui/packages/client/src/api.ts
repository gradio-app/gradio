import { process_endpoint, RE_SPACE_NAME } from "./utils";
import type {
	Config,
	Payload,
	PostResponse,
	UploadResponse,
	Status,
	SpaceStatus,
	SpaceStatusCallback,
	status_callback_function
} from "./types";

const QUEUE_FULL_MSG = "This application is too busy. Keep trying!";
const BROKEN_CONNECTION_MSG = "Connection errored out.";

export async function post_data(
	url: string,
	body: unknown
): Promise<[PostResponse, number]> {
	try {
		var response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" }
		});
	} catch (e) {
		return [{ error: BROKEN_CONNECTION_MSG }, 500];
	}
	const output: PostResponse = await response.json();
	return [output, response.status];
}

export async function upload_files(
	root: string,
	files: Array<File>
): Promise<UploadResponse> {
	const formData = new FormData();
	files.forEach((file) => {
		formData.append("files", file);
	});
	try {
		var response = await fetch(`${root}upload`, {
			method: "POST",
			body: formData
		});
	} catch (e) {
		return { error: BROKEN_CONNECTION_MSG };
	}
	const output: UploadResponse["files"] = await response.json();
	return { files: output };
}

export async function client(
	app_reference: string,
	space_status_callback?: SpaceStatusCallback
) {
	const { protocol, host, space_id } = process_endpoint(app_reference);
	const session_hash = Math.random().toString(36).substring(2);
	const ws_map = new Map<number, WebSocket>();
	const last_status: Record<string, Status["status"]> = {};
	let config: Config;

	function config_success(_config: Config) {
		config = _config;
		return {
			config,
			predict
		};
	}

	async function handle_space_sucess(status: SpaceStatus) {
		if (status.status === "running")
			try {
				config = await resolve_config(host);
				return config_success(config);
			} catch (e) {
				throw new Error("Could not get config for this app.");
			}

		if (space_status_callback) space_status_callback(status);
	}

	try {
		config = await resolve_config(host);
		return config_success(config);
	} catch (e) {
		if (space_id) {
			check_space_status(
				space_id,
				RE_SPACE_NAME.test(space_id) ? "space_name" : "subdomain",
				handle_space_sucess
			);
		}
	}

	/**
	 * Run a prediction.
	 * @param endpoint - The prediction endpoint to use.
	 * @param status_callback - A function that is called with the current status of the prediction immediately and every time it updates.
	 * @return Returns the data for the prediction or an error message.
	 */
	async function predict(
		endpoint: string | { fn_index: number },
		payload: Payload,
		status_callback: status_callback_function,
		cancels: number[]
	): Promise<any> {
		if (typeof endpoint === "string") {
			throw new Error("Cannot take a string as an endpoint yet"); // for the future
		}

		const { fn_index } = endpoint;

		if (skip_queue(fn_index, config)) {
			status_callback({
				status: "pending"
			});

			var [output, status_code] = await post_data(`${host}/run/`, {
				...payload,
				session_hash
			});
			if (status_code == 200) {
				status_callback({
					status: "complete",
					eta: output.average_duration
				});

				if (cancels.length > 0) {
					cancels.forEach((fn_index) => {
						status_callback({ status: "complete" });
						ws_map.get(fn_index)?.close();
					});
				}
			} else {
				status_callback({ status: "error", message: output.error });

				throw new Error(output.error || "API Error");
			}
			return output;
		}

		const ws_endpoint = `${protocol}://${host}/queue/join`;

		const websocket = new WebSocket(ws_endpoint);
		ws_map.set(fn_index, websocket);

		websocket.onclose = (evt) => {
			if (!evt.wasClean) {
				status_callback({
					message: BROKEN_CONNECTION_MSG,
					status: "error"
				});
				throw new Error(BROKEN_CONNECTION_MSG);
			}
		};

		websocket.onmessage = async function (event) {
			const _data = JSON.parse(event.data);
			const { type, status, data } = handle_message(
				_data,
				last_status[fn_index]
			);

			if (type === "update" && status) {
				status_callback(status);
				if (status.status === "error") {
					websocket.close();
				}
				throw new Error("Something went wrong.");
			} else if (type === "send") {
				ws_map
					.get(fn_index)
					?.send(JSON.stringify({ ...payload, fn_index, session_hash }));
				return;
			} else if (type === "complete") {
				websocket.close();
			}

			if (data.success) {
				return data;
			}
		};
	}
}

function skip_queue(id: number, config: Config) {
	!!(config?.dependencies?.[id].queue === null
		? config.enable_queue
		: config?.dependencies?.[id].queue) || false;
}

async function resolve_config(endpoint?: string): Promise<Config> {
	if (window.gradio_config) {
		return window.gradio_config;
	} else if (endpoint) {
		let response = await fetch(`${endpoint}/config`);
		if (response.status === 200) {
			const config = await response.json();
			config.root = endpoint;
			return config;
		} else {
			throw new Error("Could not get config.");
		}
	}

	throw new Error("No config or app endpoint found");
}

const RE_DISABLED_DISCUSSION =
	/^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function discussions_enabled(space_id: string) {
	try {
		const r = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/discussions`,
			{
				method: "HEAD"
			}
		);
		const error = r.headers.get("x-error-message");

		if (error && RE_DISABLED_DISCUSSION.test(error)) return false;
		else return true;
	} catch (e) {
		return false;
	}
}

async function check_space_status(
	id: string,
	type: "subdomain" | "space_name",
	space_status_callback: SpaceStatusCallback
) {
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
		space_status_callback({
			status: "error",
			message: "Could not get space status",
			detail: "not_found"
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
			space_status_callback({
				status: "sleeping",
				message: "Space is asleep. Waking it up...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, space_status_callback);
			}, 1000);
			break;
		// poll for status
		case "RUNNING":
		case "RUNNING_BUILDING":
			space_status_callback({
				status: "running",
				message: "",
				detail: stage
			});
			// load_config(source);
			//  launch
			break;
		case "BUILDING":
			space_status_callback({
				status: "building",
				message: "Space is building...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, space_status_callback);
			}, 1000);
			break;
		default:
			space_status_callback({
				status: "error",
				message: "This space is experiencing an issue.",
				detail: stage,
				discussions_enabled: await discussions_enabled(space_name)
			});
			break;
	}
}

function handle_message(
	data: any,
	last_status: Status["status"]
): {
	type: "send" | "update" | "complete" | "generating" | "none";
	data?: any;
	status?: Status;
} {
	switch (data.msg) {
		case "send_data":
			return { type: "send" };
		case "send_hash":
			return { type: "send" };
		case "queue_full":
			return {
				type: "update",
				status: {
					message: QUEUE_FULL_MSG,
					status: "error"
				}
			};
		case "estimation":
			return {
				type: "update",
				status: {
					status: last_status || "pending",
					size: data.queue_size,
					position: data.rank,
					eta: data.rank_eta
				}
			};
		case "progress":
			return {
				type: "update",
				status: {
					status: "pending",
					progress: data.progress_data
				}
			};
		case "process_generating":
			return {
				type: "generating",
				status: {
					message: !data.success ? data.output.error : null,
					status: data.success ? "generating" : "error",
					progress: data.progress_data,
					eta: data.average_duration
				},
				data: data.success ? data.output : null
			};
		case "process_completed":
			return {
				type: "complete",
				status: {
					message: !data.success ? data.output.error : null,
					status: data.success ? "complete" : "error",
					progress: data.progress_data,
					eta: data.output.average_duration
				},
				data: data.success ? data.output : null
			};
		case "process_starts":
			return {
				type: "update",
				status: {
					status: "pending",
					size: data.rank,
					position: 0
				}
			};
	}

	return { type: "none" };
}
