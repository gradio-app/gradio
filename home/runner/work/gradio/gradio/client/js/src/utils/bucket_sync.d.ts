/**
 * Client for the durable run history in an HF Hub bucket
 * (`/gradio_api/run-history/*`).
 *
 * Read-only by design. Records are written by the server from the run it
 * actually executed — there is no push function here, and nothing in this
 * module can create a record.
 *
 * Every call names the bucket it is talking about. The server holds no
 * per-session binding, so two tabs (or two apps on one origin) cannot end up
 * reading each other's history.
 */
export declare function is_valid_bucket_id(id: string): boolean;
/** Mirrors `HistoryRecord` in `gradio/history.py`. */
export interface HistoryRecord {
    record_id: string;
    endpoint: string;
    inputs: unknown;
    outputs: unknown;
    started_at: string;
    schema_version: number;
}
export interface HistoryResult<T> {
    ok: boolean;
    status: number;
    data: T;
    detail?: string;
}
/**
 * Create the bucket if it does not exist and confirm it is writable. Stores
 * nothing server-side — the caller keeps its own choice and names it on every
 * later request.
 *
 * `token` is the caller's own HF access token. Once the bucket connects, the
 * server keeps it in an HttpOnly cookie for this app and uses it for this
 * browser's history; without one, the request needs an OAuth session or a
 * token kept by an earlier connect.
 */
export declare function connect_bucket(root: string, bucket_id: string, token?: string): Promise<HistoryResult<null>>;
/**
 * Forget the token this browser gave for run history. The server clears its
 * HttpOnly cookie, which page code can't.
 */
export declare function disconnect_bucket(root: string): Promise<HistoryResult<null>>;
export declare function list_user_buckets(root: string): Promise<HistoryResult<string[]>>;
export declare function list_bucket_records(root: string, bucket: string): Promise<HistoryResult<HistoryRecord[]>>;
export declare function asset_url(root: string, bucket: string, endpoint: string, record_id: string, filename: string): string;
