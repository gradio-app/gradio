/**
 * What a session holds in the browser: the `gr.State` values the server
 * sealed, and the values its components were last given.
 *
 * `gr.State`: after an event changes a `gr.State`, the server sends an
 * encrypted token for the new value and a short reference to it. The client
 * sends the reference (or the token itself, when it is small) with every event
 * that reads or writes that state. If the server answering the event does not
 * have the value cached, it responds with 409 and the ids it is missing, and
 * the client retries with the tokens for those ids.
 *
 * Component values: the inputs an event was sent with and the outputs (values
 * or updates) it returned, so that a reloaded page that resumes the session
 * can show what it showed before, without asking the server.
 *
 * Both are saved in one IndexedDB record per session (see `browser_storage.ts`).
 */
export interface StateEntry {
    ref: string;
    token: string;
}
/** What the server sends: a new entry, or null to drop the entry. */
export type StateUpdates = Record<string, StateEntry | null>;
export type StatePayload = Record<string, {
    ref: string;
} | {
    token: string;
}>;
/** Tokens up to this length are always sent in full, saving a round trip. */
export declare const INLINE_STATE_LIMIT: number;
interface ComponentLike {
    id: number;
    type: string;
    props: Record<string, any>;
}
export declare class SessionStore {
    private state;
    private values;
    /** The prefix of the keys of this app's saved sessions */
    private app_prefix;
    private key;
    private app_key;
    private save_timer;
    /** The save in progress, and whether there are changes it does not include. */
    private saving;
    private changed_while_saving;
    /** Whether a saved session was found when this store was attached. */
    found: boolean;
    /**
     * The state to send with an event, for the given component ids. Ids in
     * `force_tokens` are sent in full, whatever their size.
     */
    payload(ids: Iterable<number>, force_tokens?: Iterable<number>): StatePayload;
    /** Applies the `gr.State` changes the server sent with an event. */
    apply(updates: StateUpdates | null | undefined): void;
    get(id: number | string): StateEntry | undefined;
    get size(): number;
    /**
     * Deletes everything saved for this session, in memory and in the browser,
     * and stops saving it.
     */
    forget(): Promise<void>;
    /**
     * Remembers the values `ids` were given (an event's inputs, or the outputs
     * it returned), index-aligned with `values`.
     */
    record(ids: number[], values: unknown[], components: {
        id: number;
        type: string;
    }[]): void;
    /**
     * Puts the saved values back into `components` (an app config's), before
     * it is rendered. Returns whether there were any.
     */
    restore_into(components: ComponentLike[]): boolean;
    /**
     * Loads what was saved for this session of this app, and saves later
     * changes there. What is already in memory takes precedence.
     */
    attach(root: string, app_key: string | undefined, session_hash: string, username?: string | null): Promise<void>;
    /** Saves now, e.g. when the page is hidden, and waits for it. */
    flush(): Promise<void>;
    /**
     * Saves as soon as this task is done, so a burst of changes is saved once
     * and a page reloaded right after a change still has it. A change made
     * while a save is in progress is saved once that save is done, so there is
     * at most one save in flight (e.g. while a generator streams outputs).
     */
    private schedule_save;
    private start_save;
    private save;
}
export {};
