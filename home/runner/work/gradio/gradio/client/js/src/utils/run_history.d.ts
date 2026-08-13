import type { GradioEvent } from "../types";
export type AppId = string | number | null | undefined;
/**
 * Which history to read or write. `Config` satisfies this shape, so callers
 * that hold one can pass it straight through.
 */
export interface RunHistoryScope {
    app_id?: AppId;
    /** The authenticated user, when the app uses `auth`. */
    username?: string | null;
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
export declare function run_history_url(root: string, api_prefix?: string): string;
export declare function read_run_history(scope: RunHistoryScope | null | undefined): StoredRun[];
export declare function clear_run_history(scope: RunHistoryScope | null | undefined): void;
export declare function delete_run_history(scope: RunHistoryScope | null | undefined, id: string): void;
export declare function stage_run_history_replay(scope: RunHistoryScope | null | undefined, run: StoredRun): void;
export declare function consume_run_history_replay(scope: RunHistoryScope | null | undefined): StoredRun | null;
export declare function start_run_history(options: StartRunOptions): string | null;
export declare function update_run_inputs(scope: RunHistoryScope | null | undefined, id: string | null, inputs: unknown): void;
export declare function update_run_history(scope: RunHistoryScope | null | undefined, id: string | null, event: GradioEvent): void;
export declare function on_run_history_change(listener: () => void): () => void;
export {};
