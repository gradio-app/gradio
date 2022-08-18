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
}

declare let BUILD_MODE: string;
declare let BACKEND_URL: string;

async function post_data<
	Return extends Record<string, unknown> = Record<string, unknown>
>(url: string, body: unknown): Promise<Return> {
	const response = await fetch(url, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" }
	});

	if (response.status !== 200) {
		throw new Error(response.statusText);
	}

	const output: Return = await response.json();
	return output;
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

const ws_map = new Map();

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
		loading_status
	}: {
		action: string;
		payload: Payload;
		queue: boolean;
		backend_fn: boolean;
		frontend_fn: Function | undefined;
		output_data?: Output["data"];
		queue_callback: Function;
		loading_status: LoadingStatusType;
	}): Promise<unknown> => {
		const fn_index = payload.fn_index;

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
				null
			);

			function send_message(fn: number, data: any) {
				ws_map.get(fn).connection.send(JSON.stringify(data));
			}

			var ws_protocol = api_endpoint.startsWith("https") ? "wss:" : "ws:";
			if (is_space) {
				const SPACE_REGEX = /embed\/(.*)\/\+/g;
				var ws_path = Array.from(api_endpoint.matchAll(SPACE_REGEX))[0][1];
				var ws_host = "spaces.huggingface.tech/";
			} else {
				var ws_path = location.pathname === "/" ? "" : location.pathname;
				var ws_host =
					BUILD_MODE === "dev" || location.origin === "http://localhost:3000"
						? BACKEND_URL.replace("http://", "").slice(0, -1)
						: location.host;
			}
			const WS_ENDPOINT = `${ws_protocol}//${ws_host}${ws_path}/queue/join`;

			const websocket_data = {
				connection: new WebSocket(WS_ENDPOINT),
				hash: Math.random().toString(36).substring(2)
			};

			ws_map.set(fn_index, websocket_data);

			websocket_data.connection.onopen = () => {
				console.log("open");
				send_message(fn_index, { hash: session_hash });
			};

			websocket_data.connection.onclose = () => {
				console.log("close");
			};

			websocket_data.connection.onmessage = function (event) {
				const data = JSON.parse(event.data);
				console.log("go", data);

				switch (data.msg) {
					case "send_data":
						send_message(fn_index, payload);
						break;
					case "queue_full":
						alert("Queue full. Try again later.");
						loading_status.update(fn_index, "error", queue, null, null, null);
						websocket_data.connection.close();
						break;
					case "estimation":
						loading_status.update(
							fn_index,
							get(loading_status)[data.fn_index]?.status || "pending",
							queue,
							data.queue_size,
							data.rank,
							data.rank_eta
						);
						break;
					case "process_completed":
						loading_status.update(
							fn_index,
							"complete",
							queue,
							null,
							null,
							data.output.average_duration
						);
						queue_callback(data.output);
						websocket_data.connection.close();
						break;
					case "process_starts":
						loading_status.update(
							fn_index,
							"pending",
							queue,
							data.rank,
							0,
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
				null
			);

			const output = await post_data(api_endpoint + action + "/", {
				...payload,
				session_hash
			});

			loading_status.update(
				fn_index,
				"complete",
				queue,
				null,
				null,
				output.average_duration as number
			);

			return output;
		}
	};
