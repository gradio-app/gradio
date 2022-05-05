import { writable } from "svelte/store";

export interface LoadingStatus {
	eta: number | null;
	status: "pending" | "error" | "complete";
	queue_position: number | null;
	outputs: Array<number>;
}

function create_loading_status_store() {
	const store = writable<Record<string, Omit<LoadingStatus, "outputs">>>({});

	const fn_outputs: Array<Array<number>> = [];
	const pending_outputs = new Map<number, number>();
	const fn_status: Array<LoadingStatus["status"]> = [];

	function update(
		fn_index: number,
		status: LoadingStatus["status"],
		position: LoadingStatus["queue_position"],
		eta: LoadingStatus["eta"]
	) {
		const outputs = fn_outputs[fn_index];
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

		store.update((outputs) => {
			outputs_to_update.forEach(({ id, queue_position, eta, status }) => {
				outputs[id] = {
					queue_position,
					eta: eta || outputs[id]?.eta,
					status
				};
			});

			return outputs;
		});

		fn_status[fn_index] = status;
	}

	function register(index: number, outputs: Array<number>) {
		fn_outputs[index] = outputs;
	}

	return {
		update,
		register,
		subscribe: store.subscribe,
		get_status_for_fn(i: number) {
			return fn_status[i];
		}
	};
}

export const loading_status = create_loading_status_store();
