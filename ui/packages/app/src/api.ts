import { get } from "svelte/store";
import type { LoadingStatusType } from "./stores";

type StatusResponse =
	| {
			status: "COMPLETE";
			data: {
				duration: number;
				average_duration: number;
				data: Array<unknown>;
			};
	  }
	| {
			status: "QUEUED";
			data: number;
	  }
	| {
			status: "PENDING";
			data: null;
	  }
	| {
			status: "FAILED";
			data: Record<string, unknown>;
	  };

interface Payload {
	data: Array<unknown>;
	fn_index: number;
	session_hash?: string;
}

declare let BUILD_MODE: string;
declare let BACKEND_URL: string;

interface PostResponse {
	error?: string;
	[x: string]: unknown;
}
const QUEUE_FULL_MSG = "This application is too busy. Keep trying!";
const BROKEN_CONNECTION_MSG = "Connection errored out.";

async function post_data(
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
interface UpdateOutput {
	__type__: string;
	[key: string]: unknown;
}

type Output = {
	data: Array<UpdateOutput | unknown>;
	duration?: number;
	average_duration?: number;
};

const ws_map = new Map<number, WebSocket>();
export const fn =
	(session_hash: string, api_endpoint: string, is_space: boolean) =>
	async ({
		action,
		payload,
		queue,
		backend_fn,
		frontend_fn,
		output_data,
		queue_callback,
		loading_status,
		cancels
	}: {
		action: string;
		payload: Payload;
		queue: boolean;
		backend_fn: boolean;
		frontend_fn: Function | undefined;
		output_data?: Output["data"];
		queue_callback: Function;
		loading_status: LoadingStatusType;
		cancels: Array<number>;
	}): Promise<unknown> => {
		const fn_index = payload.fn_index;

		payload.session_hash = session_hash;
		if (frontend_fn !== undefined) {
			payload.data = await frontend_fn(payload.data.concat(output_data));
		}
		if (backend_fn == false) {
			return payload;
		}

		if (queue && ["predict", "interpret"].includes(action)) {
			loading_status.update(
				fn_index as number,
				"pending",
				queue,
				null,
				null,
				null,
				null
			);

			function send_message(fn: number, data: any) {
				ws_map.get(fn)?.send(JSON.stringify(data));
			}
			const _host = new URL(api_endpoint).host;
			var ws_endpoint = is_space
				? _host
				: api_endpoint === "api/"
				? location.href
				: api_endpoint;
			var ws_protocol = ws_endpoint.startsWith("https") ? "wss:" : "ws:";
			var ws_path = location.pathname === "/" ? "/" : location.pathname;
			var ws_host =
				BUILD_MODE === "dev" || location.origin === "http://localhost:3000"
					? BACKEND_URL.replace("http://", "").slice(0, -1)
					: is_space
					? _host
					: location.host;
			const WS_ENDPOINT = `${ws_protocol}//${ws_host}${ws_path}queue/join`;

			var websocket = new WebSocket(WS_ENDPOINT);
			ws_map.set(fn_index, websocket);

			websocket.onclose = (evt) => {
				if (!evt.wasClean) {
					loading_status.update(
						fn_index,
						"error",
						queue,
						null,
						null,
						null,
						BROKEN_CONNECTION_MSG
					);
				}
			};

			websocket.onmessage = async function (event) {
				const data = JSON.parse(event.data);

				switch (data.msg) {
					case "send_data":
						send_message(fn_index, payload);
						break;
					case "send_hash":
						ws_map.get(fn_index)?.send(
							JSON.stringify({
								session_hash: session_hash,
								fn_index: fn_index
							})
						);
						break;
					case "queue_full":
						loading_status.update(
							fn_index,
							"error",
							queue,
							null,
							null,
							null,
							QUEUE_FULL_MSG
						);
						websocket.close();
						return;
					case "estimation":
						loading_status.update(
							fn_index,
							get(loading_status)[data.fn_index]?.status || "pending",
							queue,
							data.queue_size,
							data.rank,
							data.rank_eta,
							null
						);
						break;
					case "process_generating":
						loading_status.update(
							fn_index,
							data.success ? "generating" : "error",
							queue,
							null,
							null,
							data.output.average_duration,
							!data.success ? data.output.error : null
						);
						if (data.success) {
							queue_callback(data.output);
						}
						break;
					case "process_completed":
						loading_status.update(
							fn_index,
							data.success ? "complete" : "error",
							queue,
							null,
							null,
							data.output.average_duration,
							!data.success ? data.output.error : null
						);
						if (data.success) {
							queue_callback(data.output);
						}
						websocket.close();
						return;
					case "process_starts":
						loading_status.update(
							fn_index,
							"pending",
							queue,
							data.rank,
							0,
							null,
							null
						);
						break;
				}
			};
		} else {
			loading_status.update(
				fn_index as number,
				"pending",
				queue,
				null,
				null,
				null,
				null
			);

			var [output, status_code] = await post_data(api_endpoint + action + "/", {
				...payload,
				session_hash
			});
			if (status_code == 200) {
				loading_status.update(
					fn_index,
					"complete",
					queue,
					null,
					null,
					output.average_duration as number,
					null
				);
				// Cancelled jobs are set to complete
				if (cancels.length > 0) {
					cancels.forEach((fn_index) => {
						loading_status.update(
							fn_index,
							"complete",
							queue,
							null,
							null,
							null,
							null
						);
						ws_map.get(fn_index)?.close();
					});
				}
			} else {
				loading_status.update(
					fn_index,
					"error",
					queue,
					null,
					null,
					null,
					output.error
				);
				throw output.error || "API Error";
			}
			return output;
		}
	};
