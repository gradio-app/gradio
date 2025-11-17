import type { ILoadingStatus, LoadingStatusArgs } from "./types.js";

export class LoadingStatus {
	current: Record<string, ILoadingStatus> = {};
	fn_outputs: Record<number, number[]> = {};
	fn_inputs: Record<number, number[]> = {};
	pending_outputs = new Map<number, number>();
	fn_status: Record<number, ILoadingStatus["status"]> = {};

	register(dependency_id: number, outputs: number[], inputs: number[]): void {
		this.fn_outputs[dependency_id] = outputs;
		this.fn_inputs[dependency_id] = inputs;
	}

	clear(id: number): void {
		if (id in this.current) {
			//@ts-ignore
			this.current[id] = {};
		}
	}

	update(args: LoadingStatusArgs): void {
		const updates = this.resolve_args(args);

		updates.forEach(
			({
				id,
				queue_position,
				queue_size,
				eta,
				status,
				message,
				progress,
				stream_state,
				time_limit,
				type
			}) => {
				this.current[id] = {
					queue: args.queue || false,
					queue_size: queue_size,
					queue_position: queue_position,
					eta: eta,
					stream_state: stream_state,
					message: message,
					progress: progress || undefined,
					status,
					fn_index: args.fn_index,
					time_limit,
					type
				};
			}
		);
	}

	set_status(id: number, status: ILoadingStatus["status"]): void {
		this.current[id].status = status;
	}

	resolve_args(args: LoadingStatusArgs) {
		const {
			fn_index,
			status,
			size = undefined,
			position = null,
			eta = null,
			message = null,
			stream_state = null,
			time_limit = null,
			progress_data = null
		} = args;

		const outputs = this.fn_outputs[fn_index];
		const last_status = this.fn_status[fn_index];
		const inputs = this.fn_inputs[fn_index];

		const all_ids = outputs.concat(inputs);

		// from (pending -> error) | complete - decrement pending count
		return all_ids
			.map((id) => {
				let new_status: ILoadingStatus["status"];

				const pending_count = this.pending_outputs.get(id) || 0;

				// from (pending -> error) | complete - decrement pending count
				if (last_status === "pending" && status !== "pending") {
					let new_count = pending_count - 1;

					this.pending_outputs.set(id, new_count < 0 ? 0 : new_count);

					new_status = new_count > 0 ? "pending" : status;

					// from pending -> pending - do nothing
				} else if (last_status === "pending" && status === "pending") {
					new_status = "pending";

					// (error | complete) -> pending - - increment pending count
				} else if (last_status !== "pending" && status === "pending") {
					new_status = "pending";
					this.pending_outputs.set(id, pending_count + 1);
				} else {
					new_status = status;
				}

				// We update the status tracker only for input components of streaming events
				// or for outputs of the dependency
				const type = (
					inputs.includes(id) && stream_state
						? "input"
						: outputs.includes(id)
							? "output"
							: "skip"
				) as "input" | "output" | "skip";

				return {
					id,
					queue_position: position,
					queue_size: size,
					eta: eta,
					status: new_status,
					message: message,
					progress: progress_data,
					stream_state: stream_state,
					time_limit,
					type: type
				};
			})
			.filter((update) => update.type !== "skip");
	}
}
