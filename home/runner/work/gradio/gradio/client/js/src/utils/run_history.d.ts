import type { Dependency, GradioEvent } from "../types";
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
export type RunHistoryStorage = {
    type: "browser";
    bucket_id?: string;
} | {
    type: "bucket";
    bucket_id: string;
};
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
export declare function run_history_url(root: string, api_prefix?: string): string;
/** Waits until every change made so far is saved. For tests. */
export declare function flush_run_history(): Promise<void>;
/** Forgets the histories held in memory, as reloading the page does. For tests. */
export declare function forget_run_histories(): void;
/**
 * Loads an app's run history from the browser's storage, if it has not been
 * yet. Reads made before it resolves see only the runs started since.
 */
export declare function load_run_history(scope: RunHistoryScope | null | undefined): Promise<void>;
/**
 * The parts of an app config a replayed run writes back into. Kept structural
 * so every entry point — the SPA and the SSR app each carry their own `Config`
 * declaration — can hand its config straight over.
 */
export interface ReplayTarget {
    components: {
        id: number;
        type: string;
        props: Record<string, any>;
    }[];
    dependencies: {
        id: number;
        api_name?: string | null;
        inputs: number[];
        outputs: number[];
    }[];
}
/**
 * Told which values a replayed run wrote, index-aligned with the component
 * ids. A slot it left alone, such as a streaming webcam's frame, is `undefined`.
 */
export type ReplayListener = (ids: number[], values: unknown[]) => void;
/**
 * Whether this call was started by a Timer tick or a page load rather than by
 * the user, including `.then()` steps chained after one. Decided per call, so
 * a function wired to both a button and a Timer is still recorded for clicks.
 * Must match `_is_automatic_run` in `gradio/route_utils.py`.
 */
export declare function is_automatic_run(dependencies: Dependency[], dependency: Dependency, trigger_id: number | null | undefined): boolean;
export declare function read_run_history(scope: RunHistoryScope | null | undefined): StoredRun[];
export declare function read_run_history_storage(scope: RunHistoryScope | null | undefined): RunHistoryStorage;
export declare function set_run_history_storage(scope: RunHistoryScope | null | undefined, storage: RunHistoryStorage): void;
export declare function clear_run_history(scope: RunHistoryScope | null | undefined): void;
export declare function delete_run_history(scope: RunHistoryScope | null | undefined, id: string): void;
export declare function stage_run_history_replay(scope: RunHistoryScope | null | undefined, run: StoredRun): void;
export declare function consume_run_history_replay(scope: RunHistoryScope | null | undefined): StoredRun | null;
/**
 * Applies the run staged by the history page, if this page load is the one it
 * was staged for. Every entry point that renders an app has to call this, or
 * "Load run" silently does nothing on that entry point.
 *
 * Pass `on_restore` to be told which values were written, e.g. to save them
 * in the session (`Client.session_store`) so that a refresh keeps the run
 * that was loaded rather than what the page showed before.
 *
 * @returns whether a staged run was found and applied.
 */
export declare function apply_run_history_replay(config: ReplayTarget & RunHistoryScope, on_restore?: ReplayListener): boolean;
export declare function start_run_history(options: StartRunOptions): string | null;
export declare function update_run_inputs(scope: RunHistoryScope | null | undefined, id: string | null, inputs: unknown): void;
export declare function update_run_history(scope: RunHistoryScope | null | undefined, id: string | null, event: GradioEvent): void;
export declare function on_run_history_change(listener: () => void): () => void;
export {};
