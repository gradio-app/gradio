/**
 * Where the client keeps an app's data in the browser.
 *
 * Two kinds of records share one IndexedDB database:
 * - `sessions`: what a session needs to carry on after the page is reloaded,
 *   keyed by app and session: the `gr.State` tokens the server sealed, and the
 *   values the session's components were last given.
 * - `apps`: what outlives sessions, keyed by app and user: the run history and
 *   where it is stored.
 *
 * Records are scoped by the app's root URL and its `app_key`, which the server
 * derives from the app's structure, so it is the same for every replica and
 * across restarts but changes when the app's components or events do (when
 * saved component ids could mean something else).
 *
 * The small, tab-scoped pointer to the session a tab is using lives in
 * `sessionStorage` instead (see `session.ts`), so that it is not shared by tabs.
 *
 * Storage is best effort: every function resolves (to nothing) rather than
 * reject when IndexedDB is missing (e.g. in Node) or fails.
 */
export type StoreName = "sessions" | "apps";
export interface StoredRecord {
    key: string;
    updated: number;
}
/** Saved sessions not updated for this long are deleted. */
export declare const SESSION_MAX_AGE_MS: number;
export declare function storage_available(): boolean;
export declare function read_record<T extends StoredRecord>(store: StoreName, key: string): Promise<T | undefined>;
/** Saves a record, replacing any with the same key. Returns whether it was saved. */
export declare function write_record<T extends StoredRecord>(store: StoreName, record: T): Promise<boolean>;
export declare function delete_record(store: StoreName, key: string): Promise<void>;
/**
 * Deletes the records not updated for `max_age_ms`, and beyond the `keep`
 * most recently updated ones, sparing `except`.
 */
export declare function prune_records(store: StoreName, { max_age_ms, keep, except, prefix }: {
    max_age_ms?: number;
    keep?: number;
    except?: string;
    /** Only consider records whose key starts with this. */
    prefix?: string;
}): Promise<void>;
/** The key under which an app's records are stored. */
export declare function app_scope_key(root: string, app_key: string | undefined): string;
/**
 * Whether a component is a streaming `gr.Image`, which only takes the webcam.
 * Its value is only ever a frame: the latest one, sent to every event that
 * reads it, or one a stream returned into it. A frame put back would cover
 * the live camera, so it is never restored. A streaming `gr.Audio` sends and
 * shows its own value (a file the user uploaded, generated speech), so it is
 * not one of them. The chunks of a `.stream()` event's own input are left out
 * where the event is submitted.
 */
export declare function is_streaming_webcam(component: {
    type: string;
    props: Record<string, any>;
} | undefined): boolean;
/**
 * What of a value `component` was given can be put back into it: all of it,
 * except the frame of a streaming webcam (an update keeps its other props).
 */
export declare function without_frame(component: {
    type: string;
    props: Record<string, any>;
} | undefined, value: unknown): unknown;
/**
 * Writes a value a component was given into its props, the way the frontend
 * applies it: an update (`{"__type__": "update", ...}`) sets the props it
 * carries, and anything else is the component's new value.
 */
export declare function apply_component_value(props: Record<string, any>, value: unknown): void;
export declare function is_update(value: unknown): value is Record<string, unknown>;
