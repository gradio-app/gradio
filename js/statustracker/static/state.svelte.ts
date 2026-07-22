import type { ILoadingStatus, LoadingStatusArgs } from "./types.js";

export class LoadingStatus {
	current: Record<string, ILoadingStatus> = {};
	fn_outputs: Record<number, number[]> = {};
	fn_inputs: Record<number, number[]> = {};
	pending_outputs = new Map<number, number>();
	fn_status: Record<number, ILoadingStatus["status"]> = {};
	show_progress: Record<number, "full" | "minimal" | "hidden"> = {};
	cache_event_id = 0;

	register(
		dependency_id: number,
		outputs: number[],
		inputs: number[],
		show_progress: "full" | "minimal" | "hidden"
	): void {
		this.fn_outputs[dependency_id] = outputs;
		this.fn_inputs[dependency_id] = inputs;
		this.show_progress[dependency_id] = show_progress;
	}

	/**
	 * Move in-flight loading status from old component ids to new ones after a
	 * hot-reload remounts the UI with fresh ids.
	 */
	remap_ids(
		fn_index: number,
		old_outputs: number[],
		new_outputs: number[],
		old_inputs: number[],
		new_inputs: number[]
	): void {
		const remap = (old_ids: number[], new_ids: number[]): void => {
			const n = Math.min(old_ids.length, new_ids.length);
			for (let i = 0; i < n; i++) {
				const old_id = old_ids[i];
				const new_id = new_ids[i];
				if (old_id === new_id) continue;
				if (old_id in this.current) {
					this.current[new_id] = {
						...this.current[old_id],
						component_id: new_id
					};
					delete this.current[old_id];
				}
				if (this.pending_outputs.has(old_id)) {
					this.pending_outputs.set(
						new_id,
						this.pending_outputs.get(old_id) as number
					);
					this.pending_outputs.delete(old_id);
				}
			}
			for (let i = new_ids.length; i < old_ids.length; i++) {
				delete this.current[old_ids[i]];
				this.pending_outputs.delete(old_ids[i]);
			}
		};
		remap(old_outputs, new_outputs);
		remap(old_inputs, new_inputs);
		this.fn_outputs[fn_index] = new_outputs;
		this.fn_inputs[fn_index] = new_inputs;
	}

	clear(id: number): void {
		if (id in this.current) {
			//@ts-ignore
			this.current[id] = {};
		}
	}

	update(args: LoadingStatusArgs): void {
		for (const [id, current] of Object.entries(this.current)) {
			if (current.fn_index !== args.fn_index) {
				this.current[id] = {
					...current,
					used_cache: null,
					cache_duration: null,
					avg_time: null,
					cache_event_id: null
				};
			}
		}

		const cache_event_id = args.used_cache ? ++this.cache_event_id : null;
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
				type,
				used_cache,
				cache_duration,
				avg_time
			}) => {
				const prev = this.current[id];
				const time_start =
					status === "pending" ? (prev?.time_start ?? performance.now()) : null;
				let eta_total: number | null = null;
				if (status === "pending" && time_start != null) {
					if (eta != null && (prev?.eta_total == null || prev.eta !== eta)) {
						eta_total = (performance.now() - time_start) / 1000 + eta;
					} else {
						eta_total = prev?.eta_total ?? null;
					}
				}
				this.current[id] = {
					queue: args.queue || false,
					queue_size: queue_size,
					queue_position: queue_position,
					eta: eta,
					component_id: Number(id),
					stream_state: stream_state,
					message: message,
					progress: progress || undefined,
					status,
					fn_index: args.fn_index,
					time_limit,
					time_start,
					eta_total,
					type,
					show_progress: this.show_progress[args.fn_index],
					used_cache,
					cache_duration,
					avg_time,
					cache_event_id
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
			progress_data = null,
			used_cache = null,
			cache_duration = null,
			avg_time = null
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
					type: type,
					used_cache,
					cache_duration,
					avg_time
				};
			})
			.filter((update) => update.type !== "skip");
	}
}
