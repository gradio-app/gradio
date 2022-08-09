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

function delay(n: number) {
	return new Promise(function (resolve) {
		setTimeout(resolve, n * 1000);
	});
}

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

export const fn =
	(session_hash: string, api_endpoint: string) =>
	async ({
		action,
		payload,
		queue,
		backend_fn,
		frontend_fn,
		output_data
	}: {
		action: string;
		payload: Payload;
		queue: boolean;
		backend_fn: boolean;
		frontend_fn: Function | undefined;
		output_data?: Output["data"];
	}): Promise<unknown> => {
		const fn_index = payload.fn_index;

		if (frontend_fn !== undefined) {
			payload.data = await frontend_fn(payload.data.concat(output_data));
		}
		if (backend_fn == false) {
			return payload;
		}

		if (queue && ["predict", "interpret"].includes(action)) {
			loading_status.update(fn_index as number, "pending", null, null);

			const { hash, queue_position } = await post_data<{
				hash: string;
				queue_position: number;
			}>(api_endpoint + "queue/push/", { ...payload, action, session_hash });

			loading_status.update(fn_index, "pending", queue_position, null);

			for (;;) {
				await delay(1);

				const { status, data } = await post_data<StatusResponse>(
					api_endpoint + "queue/status/",
					{
						hash: hash
					}
				);

				if (status === "QUEUED") {
					loading_status.update(fn_index, "pending", data, null);
				} else if (status === "PENDING") {
					loading_status.update(fn_index, "pending", 0, null);
				} else if (status === "FAILED") {
					loading_status.update(fn_index, "error", null, null);

					throw new Error(status);
				} else {
					loading_status.update(
						fn_index,
						"complete",
						null,
						data.average_duration
					);

					return data;
				}
			}
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

			return output;
		}
	};
