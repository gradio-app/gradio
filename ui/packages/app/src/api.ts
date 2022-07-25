import { LoadingStatus, loading_status } from "./stores";

type StatusResponse =
	| {
			status: "COMPLETE";
			data: { duration: number; average_duration: number; data: unknown };
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
	data: Record<string, unknown>;
	fn_index: number;
}

// function delay(n: number) {
// 	return new Promise(function (resolve) {
// 		setTimeout(resolve, n * 1000);
// 	});
// }

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

const ws_map = new Map();

export const fn = async (
	session_hash: string,
	api_endpoint: string,
	{
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
		output_data: Array<any>;
		queue_callback: Function;
	}
) => {
	const fn_index = payload.fn_index;
	console.log("REQUEST");

	if (frontend_fn !== undefined) {
		payload.data = await frontend_fn(payload.data.concat(output_data));
	}
	if (backend_fn == false) {
		return payload;
	}

	console.log(queue, action, payload);

	if (queue && ["predict", "interpret"].includes(action)) {
		loading_status.update(fn_index as number, "pending", null, null);

		if (ws_map.get(fn_index)) {
			send_message(fn_index, payload);
		} else {
			const websocket_data = {
				connection: new WebSocket(
					`ws://${api_endpoint
						.replace("http://", "")
						.replace("/api/", "")}/queue/join`
				),
				hash: Math.random().toString(36).substring(2)
			};

			ws_map.set(fn_index, websocket_data);

			websocket_data.connection.onopen = () => {
				console.log("boo", payload);
				send_message(fn_index, { hash: session_hash });

				// setTimeout(() => {
				// 	websocket_data.connection.close();
				// }, 10000);
			};

			websocket_data.connection.onclose = () => {
				console.log("close");
			};

			websocket_data.connection.onmessage = function (event) {
				const data = JSON.parse(event.data);

				switch (data.msg) {
					case "send_data":
						console.log("boo");
						send_message(fn_index, payload);
						break;
					case "estimation":
						console.log("estimation", data);
						loading_status.update(fn_index, "pending", data.queue_size, null);
						break;
					case "process_completed":
						console.log("HELLO", data);
						loading_status.update(
							fn_index,
							"complete",
							null,
							data.output.average_duration
						);
						queue_callback(data.output);
						break;
					case "process_starts":
						loading_status.update(fn_index, "pending", 0, null);
						console.log("processing");
						break;
				}

				// if (event.message === "process_completed") {
				//
				// } else if
			};
		}

		function send_message(fn, data) {
			console.log("hi");
			ws_map.get(fn).connection.send(JSON.stringify(data));
		}

		// const { hash, queue_position } = await post_data<{
		// 	hash: string;
		// 	queue_position: number;
		// }>(api_endpoint + "queue/push/", { ...payload, action, session_hash });

		// loading_status.update(fn_index, "pending", queue_position, null);
	} else {
		loading_status.update(fn_index as number, "pending", null, null);

		const output = await post_data(api_endpoint + action + "/", {
			...payload,
			session_hash
		});

		loading_status.update(
			fn_index,
			"complete",
			null,
			output.average_duration as number
		);

		return await output;
	}
};
