import type { GradioEvent, StatusMessage } from "../types";

// Keyed on the app id, so two different apps served on the same port never
// share a history. The id is regenerated whenever an app starts, so a restart
// begins a fresh history and leaves the previous one orphaned; `prune_apps`
// keeps those from accumulating.
const KEY_ROOT = "gradio:run-history:";
const STORAGE_PREFIX = `${KEY_ROOT}v2:`;
const REPLAY_PREFIX = `${KEY_ROOT}replay:v2:`;
const MAX_RUNS = 100;
const MAX_APPS = 8;

export type AppId = string | number | null | undefined;

/**
 * Run history is a side effect of submitting, never the point of it, so no
 * failure in here may propagate into the caller and break the app. Every
 * exported function routes through this.
 */
function safely<T>(operation: () => T, fallback: T): T {
	try {
		return operation();
	} catch (error) {
		console.warn("Could not update the run history.", error);
		return fallback;
	}
}

export type RunStatus = "running" | "completed" | "failed";

export interface StoredRunComponent {
	type: string;
	component_class_id: string;
	props: Record<string, unknown>;
}

export interface StoredRun {
	id: string;
	endpoint: string | number;
	api_name: string;
	fn_index: number;
	page: string;
	inputs: unknown;
	outputs: unknown | null;
	input_components?: (StoredRunComponent | null)[];
	output_components?: (StoredRunComponent | null)[];
	status: RunStatus;
	error?: string;
	started_at: string;
	/** When the server started running the function, if it reported queueing. */
	process_started_at?: string;
	completed_at?: string;
	/** How long the function itself took, server-reported where available. */
	duration_ms?: number;
	/** How long the run waited in the queue before the function started. */
	queued_ms?: number;
	/** Whether the run produced its output in chunks, i.e. came from a generator. */
	streamed?: boolean;
}

interface StartRunOptions {
	app_id: AppId;
	endpoint: string | number;
	api_name: string;
	fn_index: number;
	inputs: unknown;
	input_components?: (StoredRunComponent | null)[];
	output_components?: (StoredRunComponent | null)[];
}

/**
 * The URL of the run history page for an app. `root` never carries a trailing
 * slash, so it cannot simply be concatenated with the path.
 */
export function run_history_url(
	root: string,
	api_prefix = "/gradio_api"
): string {
	return `${root.replace(/\/+$/, "")}${api_prefix}/runs`;
}

function storage_key(app_id: AppId): string | null {
	if (typeof window === "undefined") return null;
	if (app_id === null || app_id === undefined || app_id === "") return null;

	try {
		if (!window.localStorage) return null;
		return `${STORAGE_PREFIX}${app_id}`;
	} catch {
		return null;
	}
}

function replay_key(app_id: AppId): string | null {
	const key = storage_key(app_id);
	return key ? key.replace(STORAGE_PREFIX, REPLAY_PREFIX) : null;
}

/** When a run was most recently saved under a key, for deciding what to drop. */
function last_saved_at(key: string): number {
	try {
		const runs = JSON.parse(window.localStorage.getItem(key) || "[]");
		// Runs are stored newest first.
		return Array.isArray(runs) && runs.length
			? Date.parse(runs[0]?.started_at) || 0
			: 0;
	} catch {
		return 0;
	}
}

/**
 * Drops the histories of long-gone app instances. Every restart mints a new app
 * id, so without this the browser would keep every history an app ever had and
 * eventually run out of room for the current one.
 */
function prune_apps(current_key: string): void {
	const keys = Object.keys(window.localStorage).filter((key) =>
		key.startsWith(KEY_ROOT)
	);
	const stale = [
		// Keys written by an older layout can never be read again.
		...keys.filter(
			(key) => !key.startsWith(STORAGE_PREFIX) && !key.startsWith(REPLAY_PREFIX)
		),
		...keys
			.filter((key) => key.startsWith(STORAGE_PREFIX) && key !== current_key)
			.sort((a, b) => last_saved_at(b) - last_saved_at(a))
			.slice(MAX_APPS - 1)
	];
	for (const key of stale) {
		try {
			window.localStorage.removeItem(key);
			window.localStorage.removeItem(
				key.replace(STORAGE_PREFIX, REPLAY_PREFIX)
			);
		} catch {
			// Nothing to do if the browser will not let us clean up.
		}
	}
}

function make_id(): string {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function clone_for_storage(value: unknown): unknown {
	const seen = new WeakSet<object>();
	try {
		return JSON.parse(
			JSON.stringify(value, (_key, item) => {
				if (typeof item === "bigint") return item.toString();
				if (typeof item === "object" && item !== null) {
					if (seen.has(item)) return "[Circular]";
					seen.add(item);
				}
				return item;
			})
		);
	} catch {
		return "[Unserializable value]";
	}
}

function read_run_history_impl(app_id: AppId): StoredRun[] {
	const key = storage_key(app_id);
	if (!key) return [];

	try {
		const value = JSON.parse(window.localStorage.getItem(key) || "[]");
		return Array.isArray(value) ? value : [];
	} catch {
		return [];
	}
}

function write_run_history(app_id: AppId, runs: StoredRun[]): void {
	const key = storage_key(app_id);
	if (!key) return;

	let next = runs.slice(0, MAX_RUNS);
	let pruned = false;
	while (next.length > 0) {
		try {
			window.localStorage.setItem(key, JSON.stringify(next));
			return;
		} catch {
			// Reclaim the space held by app instances that are long gone before
			// giving up on the oldest runs of the current one.
			if (!pruned) {
				pruned = true;
				prune_apps(key);
				continue;
			}
			next = next.slice(0, -1);
		}
	}
	try {
		window.localStorage.removeItem(key);
	} catch {
		// Run history must never interfere with an app submission.
	}
}

function clear_run_history_impl(app_id: AppId): void {
	const key = storage_key(app_id);
	if (!key) return;
	try {
		window.localStorage.removeItem(key);
	} catch {
		// Storage may be disabled by the browser.
	}
	notify_run_history_change();
}

function delete_run_history_impl(app_id: AppId, id: string): void {
	write_run_history(
		app_id,
		read_run_history_impl(app_id).filter((run) => run.id !== id)
	);
	notify_run_history_change();
}

const CHANGE_EVENT = "gradio:run-history-change";

function notify_run_history_change(): void {
	if (typeof window === "undefined") return;
	try {
		window.dispatchEvent(new Event(CHANGE_EVENT));
	} catch {
		// Nothing depends on the notification arriving.
	}
}

/**
 * Subscribes to runs being added, deleted or cleared. `storage` covers other
 * tabs; the custom event covers this one, which `storage` never fires for.
 * Only counts change, not per-run progress, so listeners stay cheap.
 *
 * @returns a function that unsubscribes.
 */
function on_run_history_change_impl(listener: () => void): () => void {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(CHANGE_EVENT, listener);
	window.addEventListener("storage", listener);
	return () => {
		window.removeEventListener(CHANGE_EVENT, listener);
		window.removeEventListener("storage", listener);
	};
}

function stage_run_history_replay_impl(app_id: AppId, run: StoredRun): void {
	const key = replay_key(app_id);
	if (!key) return;
	try {
		window.sessionStorage.setItem(key, JSON.stringify(run));
	} catch {
		// Session storage may be disabled by the browser.
	}
}

function consume_run_history_replay_impl(app_id: AppId): StoredRun | null {
	const key = replay_key(app_id);
	if (!key) return null;
	try {
		const value = window.sessionStorage.getItem(key);
		window.sessionStorage.removeItem(key);
		return value ? (JSON.parse(value) as StoredRun) : null;
	} catch {
		return null;
	}
}

function start_run_history_impl(options: StartRunOptions): string | null {
	const key = storage_key(options.app_id);
	if (!key) return null;

	// A new app id means a new key, so clear out the ones left behind before
	// adding to this one.
	prune_apps(key);

	const run: StoredRun = {
		id: make_id(),
		endpoint: options.endpoint,
		api_name: options.api_name,
		fn_index: options.fn_index,
		page: `${window.location.pathname}${window.location.search}`,
		inputs: clone_for_storage(options.inputs),
		outputs: null,
		...(options.input_components
			? {
					input_components: clone_for_storage(
						options.input_components
					) as (StoredRunComponent | null)[]
				}
			: {}),
		...(options.output_components
			? {
					output_components: clone_for_storage(
						options.output_components
					) as (StoredRunComponent | null)[]
				}
			: {}),
		status: "running",
		started_at: new Date().toISOString()
	};
	write_run_history(options.app_id, [
		run,
		...read_run_history_impl(options.app_id)
	]);
	notify_run_history_change();
	return run.id;
}

function update_run_inputs_impl(
	app_id: AppId,
	id: string | null,
	inputs: unknown
): void {
	if (!id) return;

	const runs = read_run_history_impl(app_id);
	const run = runs.find((item) => item.id === id);
	if (!run) return;
	run.inputs = clone_for_storage(inputs);
	write_run_history(app_id, runs);
}

function update_run_history_impl(
	app_id: AppId,
	id: string | null,
	event: GradioEvent
): void {
	if (!id) return;

	const runs = read_run_history_impl(app_id);
	const run = runs.find((item) => item.id === id);
	if (!run) return;

	if (event.type === "data") {
		run.outputs = clone_for_storage(event.data);
	} else if (
		event.type === "status" &&
		event.original_msg === "process_starts"
	) {
		mark_process_start(run, event.time);
	} else if (
		event.type === "status" &&
		(event.stage === "generating" || event.stage === "streaming")
	) {
		run.streamed = true;
	} else if (event.type === "status" && event.stage === "complete") {
		run.status = "completed";
		mark_complete(run, event);
	} else if (event.type === "status" && event.stage === "error") {
		run.status = "failed";
		run.error =
			typeof event.message === "string"
				? event.message
				: JSON.stringify(event.message || "Unknown error");
		mark_complete(run, event);
	}

	write_run_history(app_id, runs);
}

function mark_process_start(run: StoredRun, time: Date | undefined): void {
	// The queue tells us when the function actually started, which lets us
	// report a runtime that excludes however long the run sat in the queue.
	if (run.process_started_at) return;
	const started = time || new Date();
	run.process_started_at = started.toISOString();
	run.queued_ms = Math.max(0, started.getTime() - Date.parse(run.started_at));
}

function mark_complete(run: StoredRun, event: StatusMessage): void {
	const completed = event.time || new Date();
	run.completed_at = completed.toISOString();
	// `cache_duration` is how long the function took on the server, which the
	// queue reports on every completed run (not just cached ones). A generator
	// reports it per chunk though, so the final value covers only the last one
	// and the elapsed time is the honest number for a streamed run.
	const server_duration =
		!run.streamed &&
		typeof event.cache_duration === "number" &&
		event.cache_duration >= 0
			? event.cache_duration * 1000
			: null;
	run.duration_ms =
		server_duration ??
		Math.max(
			0,
			completed.getTime() - Date.parse(run.process_started_at || run.started_at)
		);
}

// Public API. Each of these is a no-op if anything goes wrong.

export function read_run_history(app_id: AppId): StoredRun[] {
	return safely(() => read_run_history_impl(app_id), []);
}

export function clear_run_history(app_id: AppId): void {
	safely(() => clear_run_history_impl(app_id), undefined);
}

export function delete_run_history(app_id: AppId, id: string): void {
	safely(() => delete_run_history_impl(app_id, id), undefined);
}

export function stage_run_history_replay(app_id: AppId, run: StoredRun): void {
	safely(() => stage_run_history_replay_impl(app_id, run), undefined);
}

export function consume_run_history_replay(app_id: AppId): StoredRun | null {
	return safely(() => consume_run_history_replay_impl(app_id), null);
}

export function start_run_history(options: StartRunOptions): string | null {
	return safely(() => start_run_history_impl(options), null);
}

export function update_run_inputs(
	app_id: AppId,
	id: string | null,
	inputs: unknown
): void {
	safely(() => update_run_inputs_impl(app_id, id, inputs), undefined);
}

export function update_run_history(
	app_id: AppId,
	id: string | null,
	event: GradioEvent
): void {
	safely(() => update_run_history_impl(app_id, id, event), undefined);
}

export function on_run_history_change(listener: () => void): () => void {
	return safely(
		() => on_run_history_change_impl(() => safely(listener, undefined)),
		() => {}
	);
}
