import { get } from "svelte/store";
import { loading_status } from "./stores";

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

const WS_ENDPOINT =
	BUILD_MODE === "dev" || location.origin === "http://localhost:3000"
		? `ws://${BACKEND_URL.replace("http://", "")}queue/join`
		: `ws://${location.host}/queue/join`;
console.log(BACKEND_URL);
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
	(session_hash: string, api_endpoint: string) =>
	async ({
		action,
		payload,
		queue,
		backend_fn,
		frontend_fn,
		output_data,
		queue_callback
	}: {
		action: string;
		payload: Payload;
		queue: boolean;
		backend_fn: boolean;
		frontend_fn: Function | undefined;
		output_data?: Output["data"];
		queue_callback: Function;
	}): Promise<unknown> => {
		const fn_index = payload.fn_index;

		if (frontend_fn !== undefined) {
			payload.data = await frontend_fn(payload.data.concat(output_data));
		}
		if (backend_fn == false) {
			return payload;
		}

		if (queue && ["predict", "interpret"].includes(action)) {
			loading_status.update(fn_index as number, "pending", null, null, null);

			function send_message(fn: number, data: any) {
				ws_map.get(fn).connection.send(JSON.stringify(data));
			}

			if (ws_map.get(fn_index)) {
				send_message(fn_index, payload);
			} else {
				console.log(api_endpoint);
				const websocket_data = {
					connection: new WebSocket(WS_ENDPOINT),
					hash: Math.random().toString(36).substring(2)
				};

				ws_map.set(fn_index, websocket_data);

				websocket_data.connection.onopen = () => {
					send_message(fn_index, { hash: session_hash });
				};

				websocket_data.connection.onclose = () => {
					console.log("close");
				};

				websocket_data.connection.onmessage = function (event) {
					const data = JSON.parse(event.data);

					switch (data.msg) {
						case "send_data":
							send_message(fn_index, payload);
							break;
						case "estimation":
							loading_status.update(
								fn_index,
								get(loading_status)[data.fn_index]?.status || "pending",
								data.queue_size,
								data.rank,
								data.avg_process_time
							);
							break;
						case "process_completed":
							loading_status.update(
								fn_index,
								"complete",
								null,
								null,
								data.output.average_duration
							);
							queue_callback(data.output);
							break;
						case "process_starts":
							loading_status.update(fn_index, "pending", data.rank, 0, null);
							break;
					}
				};
			}
		} else {
			loading_status.update(fn_index as number, "pending", null, null, null);

			const output = await post_data(api_endpoint + action + "/", {
				...payload,
				session_hash
			});

			loading_status.update(
				fn_index,
				"complete",
				null,
				null,
				output.average_duration as number
			);

			return output;
		}
	};
