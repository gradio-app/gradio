import { type Writable, writable, get } from "svelte/store";

export interface LoadingStatus {
	eta: number | null;
	status: "pending" | "error" | "complete" | "generating";
	queue: boolean;
	queue_position: number | null;
	queue_size?: number;
	fn_index: number;
	message?: string | null;
	scroll_to_output?: boolean;
	show_progress?: "full" | "minimal" | "hidden";
	progress?: {
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}[];
}

export type LoadingStatusCollection = Record<number, LoadingStatus>;

interface LoadingStatusStore {
	update: (status: LoadingStatus) => void;
	subscribe: Writable<LoadingStatusCollection>["subscribe"];
	register: (index: number, inputs: number[], outputs: number[]) => void;
	get_status_for_fn: (i: number) => LoadingStatus["status"];
	get_inputs_to_update: () => Map<number, string>;
}

export function create_loading_status_store(): LoadingStatusStore {
	const store = writable<LoadingStatusCollection>({});

	const fn_inputs: number[][] = [];
	const fn_outputs: number[][] = [];
	const pending_outputs = new Map<number, number>();
	const pending_inputs = new Map<number, number>();

	const inputs_to_update = new Map<number, string>();
	const fn_status: LoadingStatus["status"][] = [];

	function update({
		fn_index,
		status,
		queue = true,
		size,
		position = null,
		eta = null,
		message = null,
		progress
	}: {
		fn_index: LoadingStatus["fn_index"];
		status: LoadingStatus["status"];
		queue?: LoadingStatus["queue"];
		size?: LoadingStatus["queue_size"];
		position?: LoadingStatus["queue_position"];
		eta?: LoadingStatus["eta"];
		message?: LoadingStatus["message"];
		progress?: LoadingStatus["progress"];
	}): void {
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
				queue_size: size,
				eta: eta,
				status: new_status,
				message: message,
				progress: progress
			};
		});

		inputs.forEach((id) => {
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

		store.update((outputs: LoadingStatusCollection) => {
			outputs_to_update.forEach(
				({
					id,
					queue_position,
					queue_size,
					eta,
					status,
					message,
					progress
				}) => {
					outputs[id] = {
						queue: queue,
						queue_size: queue_size,
						queue_position: queue_position,
						eta: eta,
						message: message,
						progress,
						status,
						fn_index
					};
				}
			);

			return outputs;
		});
		fn_status[fn_index] = status;
	}

	function register(index: number, inputs: number[], outputs: number[]): void {
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

export type LoadingStatusType = ReturnType<typeof create_loading_status_store>;
