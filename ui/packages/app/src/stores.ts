import { writable } from "svelte/store";

export interface LoadingStatus {
	eta: number | null;
	status: "pending" | "error" | "complete";
	queue_position: number | null;
	fn_index: number;
	scroll_to_output?: boolean;
	visible?: boolean;
}

export type LoadingStatusCollection = Record<number, LoadingStatus>;

export function create_loading_status_store() {
	const store = writable<LoadingStatusCollection>({});

	const fn_inputs: Array<Array<number>> = [];
	const fn_outputs: Array<Array<number>> = [];
	const pending_outputs = new Map<number, number>();
	const pending_inputs = new Map<number, number>();

	const inputs_to_update = new Map<number, string>();
	const fn_status: Array<LoadingStatus["status"]> = [];

	function update(
		fn_index: LoadingStatus["fn_index"],
		status: LoadingStatus["status"],
		position: LoadingStatus["queue_position"],
		eta: LoadingStatus["eta"]
	) {
		const outputs = fn_outputs[fn_index];
		const inputs = fn_inputs[fn_index];
		const last_status = fn_status[fn_index];

		const outputs_to_update = outputs.map((id) => {
			let new_status: LoadingStatus["status"];

			const pending_count = pending_outputs.get(id) || 0;

			// from (pending -> error) | complete - decrement pending count
			if (last_status === "pending" && status !== "pending") {
				let new_count = pending_count - 1;

				pending_outputs.set(id, new_count < 0 ? 0 : new_count);

				new_status = new_count > 0 ? "pending" : status;

				// from pending -> pending - do nothing
			} else if (last_status === "pending" && status === "pending") {
				new_status = "pending";

				// (error | complete) -> pending - - increment pending count
			} else if (last_status !== "pending" && status === "pending") {
				new_status = "pending";
				pending_outputs.set(id, pending_count + 1);
			} else {
				new_status = status;
			}

			return {
				id,
				queue_position: position,
				eta: eta,
				status: new_status
			};
		});

		inputs.map((id) => {
			const pending_count = pending_inputs.get(id) || 0;

			// from (pending -> error) | complete - decrement pending count
			if (last_status === "pending" && status !== "pending") {
				let new_count = pending_count - 1;
				pending_inputs.set(id, new_count < 0 ? 0 : new_count);
				inputs_to_update.set(id, status);
			} else if (last_status !== "pending" && status === "pending") {
				pending_inputs.set(id, pending_count + 1);
				inputs_to_update.set(id, status);
			} else {
				inputs_to_update.delete(id);
			}
		});

		store.update((outputs) => {
			outputs_to_update.forEach(({ id, queue_position, eta, status }) => {
				outputs[id] = {
					queue_position,
					eta: eta || outputs[id]?.eta,
					status,
					fn_index
				};
			});

			return outputs;
		});

		fn_status[fn_index] = status;
	}

	function register(
		index: number,
		inputs: Array<number>,
		outputs: Array<number>
	) {
		fn_inputs[index] = inputs;
		fn_outputs[index] = outputs;
	}

	return {
		update,
		register,
		subscribe: store.subscribe,
		get_status_for_fn(i: number) {
			return fn_status[i];
		},
		get_inputs_to_update() {
			return inputs_to_update;
		}
	};
}

export const app_state = writable({ autoscroll: false });
