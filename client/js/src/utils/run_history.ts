import type { GradioEvent, StatusMessage } from "../types";

const STORAGE_PREFIX = "gradio:run-history:v1:";
const REPLAY_PREFIX = "gradio:run-history:replay:v1:";
const MAX_RUNS = 100;

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
}

interface StartRunOptions {
	root: string;
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

function storage_key(root: string): string | null {
	if (typeof window === "undefined") return null;

	try {
		if (!window.localStorage) return null;
		const root_url = new URL(root || "/", window.location.href);
		const path = root_url.pathname.replace(/\/$/, "") || "/";
		return `${STORAGE_PREFIX}${path}`;
	} catch {
		return null;
	}
}

function replay_key(root: string): string | null {
	const key = storage_key(root);
	return key ? key.replace(STORAGE_PREFIX, REPLAY_PREFIX) : null;
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

export function read_run_history(root: string): StoredRun[] {
	const key = storage_key(root);
	if (!key) return [];

	try {
		const value = JSON.parse(window.localStorage.getItem(key) || "[]");
		return Array.isArray(value) ? value : [];
	} catch {
		return [];
	}
}

function write_run_history(root: string, runs: StoredRun[]): void {
	const key = storage_key(root);
	if (!key) return;

	let next = runs.slice(0, MAX_RUNS);
	while (next.length > 0) {
		try {
			window.localStorage.setItem(key, JSON.stringify(next));
			return;
		} catch {
			next = next.slice(0, -1);
		}
	}
	try {
		window.localStorage.removeItem(key);
	} catch {
		// Run history must never interfere with an app submission.
	}
}

export function clear_run_history(root: string): void {
	const key = storage_key(root);
	if (!key) return;
	try {
		window.localStorage.removeItem(key);
	} catch {
		// Storage may be disabled by the browser.
	}
	notify_run_history_change();
}

export function delete_run_history(root: string, id: string): void {
	write_run_history(
		root,
		read_run_history(root).filter((run) => run.id !== id)
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
export function on_run_history_change(listener: () => void): () => void {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(CHANGE_EVENT, listener);
	window.addEventListener("storage", listener);
	return () => {
		window.removeEventListener(CHANGE_EVENT, listener);
		window.removeEventListener("storage", listener);
	};
}

export function stage_run_history_replay(root: string, run: StoredRun): void {
	const key = replay_key(root);
	if (!key) return;
	try {
		window.sessionStorage.setItem(key, JSON.stringify(run));
	} catch {
		// Session storage may be disabled by the browser.
	}
}

export function consume_run_history_replay(root: string): StoredRun | null {
	const key = replay_key(root);
	if (!key) return null;
	try {
		const value = window.sessionStorage.getItem(key);
		window.sessionStorage.removeItem(key);
		return value ? (JSON.parse(value) as StoredRun) : null;
	} catch {
		return null;
	}
}

export function start_run_history(options: StartRunOptions): string | null {
	const key = storage_key(options.root);
	if (!key) return null;

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
	write_run_history(options.root, [run, ...read_run_history(options.root)]);
	notify_run_history_change();
	return run.id;
}

export function update_run_inputs(
	root: string,
	id: string | null,
	inputs: unknown
): void {
	if (!id) return;

	const runs = read_run_history(root);
	const run = runs.find((item) => item.id === id);
	if (!run) return;
	run.inputs = clone_for_storage(inputs);
	write_run_history(root, runs);
}

export function update_run_history(
	root: string,
	id: string | null,
	event: GradioEvent
): void {
	if (!id) return;

	const runs = read_run_history(root);
	const run = runs.find((item) => item.id === id);
	if (!run) return;

	if (event.type === "data") {
		run.outputs = clone_for_storage(event.data);
	} else if (
		event.type === "status" &&
		event.original_msg === "process_starts"
	) {
		mark_process_start(run, event.time);
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

	write_run_history(root, runs);
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
	// queue reports on every completed run (not just cached ones).
	const server_duration =
		typeof event.cache_duration === "number" && event.cache_duration >= 0
			? event.cache_duration * 1000
			: null;
	run.duration_ms =
		server_duration ??
		Math.max(
			0,
			completed.getTime() - Date.parse(run.process_started_at || run.started_at)
		);
}
