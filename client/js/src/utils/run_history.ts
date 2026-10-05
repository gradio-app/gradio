import type { GradioEvent, StatusMessage } from "../types";
import {
	app_scope_key,
	apply_component_value,
	delete_record,
	prune_records,
	read_record,
	storage_available,
	write_record,
	type StoredRecord
} from "./browser_storage";

// Run histories are kept in the browser's IndexedDB, next to the sessions'
// saved state and outputs (see `browser_storage.ts`), under the app's root and
// `app_key`. The key is derived from the app's structure, so a history
// survives restarts and is shared by an app's replicas, but two different apps
// served on the same port never share one.
//
// The key also carries the logged-in user, because the history outlives a
// session: without it, whoever logs into an authenticated app next on this
// browser would open the previous user's runs.
//
// Reads are synchronous, from a copy held in memory that is loaded the first
// time an app's history is asked for (`load_run_history` waits for it), and
// listeners are told when it arrives. Writes go to that copy and are saved
// shortly after, merged with what other tabs have saved meanwhile.
const KEY_ROOT = "gradio:run-history:";
const REPLAY_PREFIX = `${KEY_ROOT}replay:v3:`;
// Where earlier versions kept histories, in local storage. They were keyed on
// an id that changed on every restart, so they are deleted rather than moved.
const LEGACY_PREFIXES = [`${KEY_ROOT}v2:`, `${KEY_ROOT}destination:v1:`];
const MAX_RUNS = 100;
// Apps whose history is kept; the least recently used ones go first.
const MAX_APPS = 32;

export type AppId = string | number | null | undefined;

/**
 * Which history to read or write. `Config` satisfies this shape, so callers
 * that hold one can pass it straight through.
 */
export interface RunHistoryScope {
	/** The app's root URL. */
	root?: string;
	/** Identifies the app's structure; see `browser_storage.ts`. */
	app_key?: string;
	/** For apps served by a version of Gradio that sends no `app_key`. */
	app_id?: AppId;
	/** The authenticated user, when the app uses `auth`. */
	username?: string | null;
}

export type RunHistoryStorage =
	| { type: "browser"; bucket_id?: string }
	| { type: "bucket"; bucket_id: string };

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

interface StartRunOptions extends RunHistoryScope {
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

function storage_key(scope: RunHistoryScope | null | undefined): string | null {
	if (typeof window === "undefined") return null;
	const app_key = scope?.app_key ?? scope?.app_id;
	if (app_key === null || app_key === undefined || app_key === "") return null;
	// Encoded so that a username containing the separator cannot be made to
	// collide with another user's key.
	const user = scope?.username
		? `|user:${encodeURIComponent(scope.username)}`
		: "";
	return `${app_scope_key(scope?.root ?? "", String(app_key))}${user}`;
}

function replay_key(scope: RunHistoryScope | null | undefined): string | null {
	const key = storage_key(scope);
	return key ? `${REPLAY_PREFIX}${key}` : null;
}

interface SavedHistory extends StoredRecord {
	runs: StoredRun[];
	destination?: RunHistoryStorage;
}

/** An app's history as held in memory. */
interface HistoryCopy {
	runs: StoredRun[];
	destination: RunHistoryStorage | null;
	loaded: Promise<void>;
	/** Whether it has changes that are not saved yet. */
	dirty: boolean;
	/** Runs deleted here, so that merging with the saved copy keeps them out. */
	deleted: Set<string>;
	/** When the history was last cleared here; earlier runs saved elsewhere go too. */
	cleared_at: number;
	/**
	 * Runs written here since they were last saved, which take precedence over
	 * the saved copy, each with the number of its latest change.
	 */
	touched: Map<string, number>;
	save_timer: ReturnType<typeof setTimeout> | null;
	/** The save in progress, if any, and whether changes were made during it. */
	saving: Promise<void> | null;
	changed_while_saving: boolean;
}

const histories = new Map<string, HistoryCopy>();
let legacy_cleaned = false;

let channel: BroadcastChannel | null = null;

/**
 * Tells other tabs that a history was saved, so they read it again. Only in
 * a browser, and only once a history is used: an open channel keeps a Node
 * process (e.g. the server-side renderer) from ever exiting.
 */
function history_channel(): BroadcastChannel | null {
	if (
		channel ||
		typeof window === "undefined" ||
		typeof BroadcastChannel === "undefined"
	) {
		return channel;
	}
	channel = new BroadcastChannel("gradio:run-history");
	channel.addEventListener("message", (event: MessageEvent) => {
		const key = event.data?.key;
		const history = typeof key === "string" ? histories.get(key) : undefined;
		if (!history) return;
		// Another tab saved this history: read it again.
		void read_record<SavedHistory>("apps", key).then((saved) => {
			if (!saved) return;
			merge_saved(history, saved);
			notify_run_history_change();
		});
	});
	return channel;
}

function clean_legacy_storage(): void {
	if (legacy_cleaned) return;
	legacy_cleaned = true;
	try {
		for (const key of Object.keys(window.localStorage)) {
			if (LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
				window.localStorage.removeItem(key);
			}
		}
	} catch {
		// Local storage may be disabled by the browser.
	}
}

function by_newest(a: StoredRun, b: StoredRun): number {
	return (Date.parse(b.started_at) || 0) - (Date.parse(a.started_at) || 0);
}

/**
 * Folds a saved copy (which other tabs may have changed) into the one in
 * memory. A run held here is kept as changed here if it was, and otherwise
 * as saved, or dropped if it is no longer saved (another tab deleted it). A
 * run only in the saved copy is added, unless it was deleted here or started
 * before the history was last cleared here.
 */
function merge_saved(history: HistoryCopy, saved: SavedHistory): void {
	const saved_runs = new Map((saved.runs ?? []).map((run) => [run.id, run]));
	const merged: StoredRun[] = [];
	const held = new Set<string>();
	for (const run of history.runs) {
		held.add(run.id);
		if (history.touched.has(run.id)) {
			merged.push(run);
		} else if (saved_runs.has(run.id)) {
			merged.push(saved_runs.get(run.id)!);
		}
	}
	for (const run of saved_runs.values()) {
		if (
			!held.has(run.id) &&
			!history.deleted.has(run.id) &&
			(Date.parse(run.started_at) || 0) > history.cleared_at
		) {
			merged.push(run);
		}
	}
	history.runs = merged.sort(by_newest).slice(0, MAX_RUNS);
	if (history.destination === null && saved.destination) {
		history.destination = saved.destination;
	}
}

function get_history(key: string): HistoryCopy {
	let history = histories.get(key);
	if (history) return history;
	clean_legacy_storage();
	history_channel();
	const created: HistoryCopy = {
		runs: [],
		destination: null,
		loaded: Promise.resolve(),
		dirty: false,
		deleted: new Set(),
		cleared_at: 0,
		touched: new Map(),
		save_timer: null,
		saving: null,
		changed_while_saving: false
	};
	created.loaded = read_record<SavedHistory>("apps", key).then((saved) => {
		if (saved) merge_saved(created, saved);
		if (created.dirty) schedule_save(key, created);
		notify_run_history_change();
	});
	histories.set(key, created);
	return created;
}

function schedule_save(key: string, history: HistoryCopy): void {
	history.dirty = true;
	if (!storage_available()) return;
	// One save at a time: a change made during one is saved after it.
	if (history.saving) {
		history.changed_while_saving = true;
		return;
	}
	if (history.save_timer) return;
	history.save_timer = setTimeout(() => {
		history.save_timer = null;
		start_save(key, history);
	}, 0);
}

function start_save(key: string, history: HistoryCopy): void {
	history.changed_while_saving = false;
	history.saving = save_history(key, history).finally(() => {
		history.saving = null;
		if (history.changed_while_saving) schedule_save(key, history);
	});
}

let change_count = 0;

/**
 * Forgets that the runs in `saved` were changed here, unless they changed
 * again while they were being saved.
 */
function mark_saved(history: HistoryCopy, saved: Map<string, number>): void {
	for (const [id, change] of saved) {
		if (history.touched.get(id) === change) history.touched.delete(id);
	}
}

async function save_history(key: string, history: HistoryCopy): Promise<void> {
	await history.loaded;
	const saving = new Map(history.touched);
	// Pick up what other tabs saved since this one last read it.
	const saved = await read_record<SavedHistory>("apps", key);
	if (saved) merge_saved(history, saved);
	history.dirty = false;
	let runs = history.runs;
	if (runs.length === 0 && !history.destination) {
		await delete_record("apps", key);
		mark_saved(history, saving);
		history_channel()?.postMessage({ key });
		return;
	}
	while (true) {
		const ok = await write_record<SavedHistory>("apps", {
			key,
			updated: Date.now(),
			runs,
			...(history.destination ? { destination: history.destination } : {})
		});
		if (ok || runs.length === 0) break;
		// Most likely out of space: make room by dropping the oldest runs.
		runs = runs.slice(0, Math.floor(runs.length / 2));
	}
	mark_saved(history, saving);
	history_channel()?.postMessage({ key });
	void prune_records("apps", { keep: MAX_APPS, except: key });
}

/** Waits until every change made so far is saved. For tests. */
export async function flush_run_history(): Promise<void> {
	for (const [key, history] of histories) {
		// A save can schedule another when it is done, so loop until neither is left.
		while (history.save_timer || history.saving) {
			if (history.save_timer) {
				clearTimeout(history.save_timer);
				history.save_timer = null;
				start_save(key, history);
			}
			await history.saving;
		}
	}
}

/** Forgets the histories held in memory, as reloading the page does. For tests. */
export function forget_run_histories(): void {
	histories.clear();
	legacy_cleaned = false;
}

/**
 * Loads an app's run history from the browser's storage, if it has not been
 * yet. Reads made before it resolves see only the runs started since.
 */
export async function load_run_history(
	scope: RunHistoryScope | null | undefined
): Promise<void> {
	try {
		const key = storage_key(scope);
		if (key) await get_history(key).loaded;
	} catch (error) {
		console.warn("Could not load the run history.", error);
	}
}

function read_run_history_storage_impl(
	scope: RunHistoryScope | null | undefined
): RunHistoryStorage {
	const key = storage_key(scope);
	if (!key) return { type: "browser" };
	return get_history(key).destination ?? { type: "browser" };
}

function set_run_history_storage_impl(
	scope: RunHistoryScope | null | undefined,
	storage: RunHistoryStorage
): void {
	const key = storage_key(scope);
	if (!key) return;
	const history = get_history(key);
	history.destination =
		storage.type === "browser" && !storage.bucket_id ? null : storage;
	schedule_save(key, history);
	notify_run_history_change();
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

function read_run_history_impl(
	scope: RunHistoryScope | null | undefined
): StoredRun[] {
	const key = storage_key(scope);
	if (!key) return [];
	return get_history(key).runs;
}

/** Marks runs as changed here, and saves the history shortly after. */
function write_runs(
	scope: RunHistoryScope | null | undefined,
	runs: StoredRun[],
	touched: string[]
): void {
	const key = storage_key(scope);
	if (!key) return;
	const history = get_history(key);
	history.runs = runs.slice(0, MAX_RUNS);
	for (const id of touched) history.touched.set(id, ++change_count);
	schedule_save(key, history);
}

function clear_run_history_impl(
	scope: RunHistoryScope | null | undefined
): void {
	const key = storage_key(scope);
	if (!key) return;
	const history = get_history(key);
	history.runs = [];
	history.touched.clear();
	history.cleared_at = Date.now();
	schedule_save(key, history);
	notify_run_history_change();
}

function delete_run_history_impl(
	scope: RunHistoryScope | null | undefined,
	id: string
): void {
	const key = storage_key(scope);
	if (!key) return;
	const history = get_history(key);
	history.deleted.add(id);
	history.touched.delete(id);
	write_runs(
		scope,
		history.runs.filter((run) => run.id !== id),
		[]
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
 * Subscribes to runs being added, deleted or cleared, here or in another tab,
 * and to a history being loaded. Only counts change, not per-run progress, so
 * listeners stay cheap.
 *
 * @returns a function that unsubscribes.
 */
function on_run_history_change_impl(listener: () => void): () => void {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(CHANGE_EVENT, listener);
	return () => {
		window.removeEventListener(CHANGE_EVENT, listener);
	};
}

function stage_run_history_replay_impl(
	scope: RunHistoryScope | null | undefined,
	run: StoredRun
): void {
	const key = replay_key(scope);
	if (!key) return;
	try {
		window.sessionStorage.setItem(key, JSON.stringify(run));
	} catch {
		// Session storage may be disabled by the browser.
	}
}

function consume_run_history_replay_impl(
	scope: RunHistoryScope | null | undefined
): StoredRun | null {
	const key = replay_key(scope);
	if (!key) return null;
	try {
		const value = window.sessionStorage.getItem(key);
		window.sessionStorage.removeItem(key);
		return value ? (JSON.parse(value) as StoredRun) : null;
	} catch {
		return null;
	}
}

/**
 * The parts of an app config a replayed run writes back into. Kept structural
 * so every entry point — the SPA and the SSR app each carry their own `Config`
 * declaration — can hand its config straight over.
 */
export interface ReplayTarget {
	components: { id: number; type: string; props: Record<string, any> }[];
	dependencies: {
		id: number;
		api_name?: string | null;
		inputs: number[];
		outputs: number[];
	}[];
}

function restore_run_impl(config: ReplayTarget, run: StoredRun): boolean {
	const dependency = config.dependencies.find(
		(item) =>
			item.id === run.fn_index ||
			(typeof item.api_name === "string" &&
				`/${item.api_name.replace(/^\//, "")}` === run.api_name)
	);
	if (!dependency) return false;

	const inputs = Array.isArray(run.inputs)
		? run.inputs
		: Object.values((run.inputs ?? {}) as Record<string, unknown>);
	const outputs = Array.isArray(run.outputs)
		? run.outputs
		: run.outputs === null || run.outputs === undefined
			? []
			: [run.outputs];

	const restore = (ids: number[], saved: unknown[]): void => {
		for (const [index, id] of ids.entries()) {
			const component = config.components.find((item) => item.id === id);
			if (!component || index >= saved.length) continue;
			// `gr.State` travels as sealed tokens and is always saved as null, so
			// writing it back would wipe out the component's real default.
			if (component.type === "state") continue;
			// The same way a session's saved values are put back on a reload
			apply_component_value(component.props, saved[index]);
		}
	};

	restore(dependency.inputs, inputs);
	restore(dependency.outputs, outputs);
	return true;
}

function apply_run_history_replay_impl(
	config: ReplayTarget & RunHistoryScope
): boolean {
	const run = consume_run_history_replay_impl(config);
	return run ? restore_run_impl(config, run) : false;
}

function start_run_history_impl(options: StartRunOptions): string | null {
	if (read_run_history_storage_impl(options).type === "bucket") return null;
	const key = storage_key(options);
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
	write_runs(options, [run, ...read_run_history_impl(options)], [run.id]);
	notify_run_history_change();
	return run.id;
}

function update_run_inputs_impl(
	scope: RunHistoryScope | null | undefined,
	id: string | null,
	inputs: unknown
): void {
	if (!id) return;

	const runs = read_run_history_impl(scope);
	const run = runs.find((item) => item.id === id);
	if (!run) return;
	run.inputs = clone_for_storage(inputs);
	write_runs(scope, runs, [id]);
}

function update_run_history_impl(
	scope: RunHistoryScope | null | undefined,
	id: string | null,
	event: GradioEvent
): void {
	if (!id) return;

	const runs = read_run_history_impl(scope);
	const run = runs.find((item) => item.id === id);
	if (!run) return;

	let finished = false;
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
		finished = true;
	} else if (event.type === "status" && event.stage === "error") {
		run.status = "failed";
		run.error =
			typeof event.message === "string"
				? event.message
				: JSON.stringify(event.message || "Unknown error");
		mark_complete(run, event);
		finished = true;
	} else {
		// Logs, renders and progress updates change nothing worth saving, and
		// writing serialises every run we hold.
		return;
	}

	if (finished) {
		last_write.delete(id);
	} else if (run.streamed) {
		// A generator emits an event per chunk. Saving each one would copy the
		// whole history on the main thread over and over, so save at most once
		// an interval and let the run's completion save the rest. The copy in
		// memory, which reads come from, is always up to date.
		const since = Date.now() - (last_write.get(id) ?? 0);
		if (since < STREAM_WRITE_INTERVAL_MS) return;
		last_write.set(id, Date.now());
	}

	write_runs(scope, runs, [id]);
}

const STREAM_WRITE_INTERVAL_MS = 500;
/** When each in-flight streamed run was last written. */
const last_write = new Map<string, number>();

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

export function read_run_history(
	scope: RunHistoryScope | null | undefined
): StoredRun[] {
	return safely(() => read_run_history_impl(scope), []);
}

export function read_run_history_storage(
	scope: RunHistoryScope | null | undefined
): RunHistoryStorage {
	return safely(() => read_run_history_storage_impl(scope), {
		type: "browser"
	});
}

export function set_run_history_storage(
	scope: RunHistoryScope | null | undefined,
	storage: RunHistoryStorage
): void {
	safely(() => set_run_history_storage_impl(scope, storage), undefined);
}

export function clear_run_history(
	scope: RunHistoryScope | null | undefined
): void {
	safely(() => clear_run_history_impl(scope), undefined);
}

export function delete_run_history(
	scope: RunHistoryScope | null | undefined,
	id: string
): void {
	safely(() => delete_run_history_impl(scope, id), undefined);
}

export function stage_run_history_replay(
	scope: RunHistoryScope | null | undefined,
	run: StoredRun
): void {
	safely(() => stage_run_history_replay_impl(scope, run), undefined);
}

export function consume_run_history_replay(
	scope: RunHistoryScope | null | undefined
): StoredRun | null {
	return safely(() => consume_run_history_replay_impl(scope), null);
}

/**
 * Applies the run staged by the history page, if this page load is the one it
 * was staged for. Every entry point that renders an app has to call this, or
 * "Load run" silently does nothing on that entry point.
 *
 * @returns whether a staged run was found and applied.
 */
export function apply_run_history_replay(
	config: ReplayTarget & RunHistoryScope
): boolean {
	return safely(() => apply_run_history_replay_impl(config), false);
}

export function start_run_history(options: StartRunOptions): string | null {
	return safely(() => start_run_history_impl(options), null);
}

export function update_run_inputs(
	scope: RunHistoryScope | null | undefined,
	id: string | null,
	inputs: unknown
): void {
	safely(() => update_run_inputs_impl(scope, id, inputs), undefined);
}

export function update_run_history(
	scope: RunHistoryScope | null | undefined,
	id: string | null,
	event: GradioEvent
): void {
	safely(() => update_run_history_impl(scope, id, event), undefined);
}

export function on_run_history_change(listener: () => void): () => void {
	return safely(
		() => on_run_history_change_impl(() => safely(listener, undefined)),
		() => {}
	);
}
