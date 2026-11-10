import type { ILoadingStatus, LoadingStatusArgs } from "./types.js";

export class LoadingStatus {
	current: Record<string, ILoadingStatus> = {};
	fn_outputs: Record<number, number[]> = {};
	fn_inputs: Record<number, number[]> = {};
	/** The latest status of each fn still running, per output, oldest first */
	running_fns = new Map<number, Map<number, ILoadingStatus>>();
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
				const running = this.running_fns.get(old_id);
				if (running) {
					for (const [fn, entry] of running) {
						running.set(fn, { ...entry, component_id: new_id });
					}
					this.running_fns.set(new_id, running);
					this.running_fns.delete(old_id);
				}
			}
			for (let i = new_ids.length; i < old_ids.length; i++) {
				delete this.current[old_ids[i]];
				this.running_fns.delete(old_ids[i]);
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
				// Time from this fn's own last status, not another fn's on the output
				const own = this.running_fns.get(id)?.get(args.fn_index);
				const prev =
					own ??
					(this.current[id]?.fn_index === args.fn_index
						? this.current[id]
						: undefined);
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
				const entry: ILoadingStatus = {
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
				// Track every output, also one typed as an input here because the
				// update has a stream_state; that input still gets its own entry
				const shown = this.fn_outputs[args.fn_index].includes(Number(id))
					? this.track_output(id, entry)
					: entry;
				this.current[id] = type === "input" ? entry : shown;
			}
		);
	}

	is_running(fn_index: number): boolean {
		for (const running of this.running_fns.values()) {
			if (running.has(fn_index)) return true;
		}
		return false;
	}

	/**
	 * Record an fn's status for an output and return what the output shows:
	 * while any fn writing it is still running, the newest status of those
	 * that show progress (or the newest one if none do), otherwise this one.
	 */
	track_output(id: number, entry: ILoadingStatus): ILoadingStatus {
		const running = this.running_fns.get(id) ?? new Map();
		running.delete(entry.fn_index);
		if (
			entry.status === "pending" ||
			entry.status === "generating" ||
			entry.status === "streaming"
		) {
			running.set(entry.fn_index, entry);
		}
		if (running.size === 0) {
			this.running_fns.delete(id);
			return entry;
		}
		this.running_fns.set(id, running);
		const newest_first = [...running.values()].reverse();
		return (
			newest_first.find((e) => e.show_progress !== "hidden") ?? newest_first[0]
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
		const inputs = this.fn_inputs[fn_index];

		const all_ids = [...new Set(outputs.concat(inputs))];

		return all_ids
			.map((id) => {
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
					status,
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
