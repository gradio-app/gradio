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

const BUCKET_ID_RE = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-][a-zA-Z0-9_./-]*$/;
const RECORD_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const SEGMENT_RE = /^[A-Za-z0-9_.-]{1,80}$/;

export function is_valid_bucket_id(id: string): boolean {
	if (!BUCKET_ID_RE.test(id)) return false;
	return !id
		.split("/")
		.some((seg) => seg === "" || seg === "." || seg === "..");
}

export interface BucketInfo {
	id: string;
	private?: boolean;
}

/** Mirrors `HistoryRecord` in `gradio/history.py`, which in turn mirrors
 * `StoredRun` in `run_history.ts` — the browser-local backend for the same
 * thing. */
export interface HistoryRecord {
	record_id: string;
	owner_id: string;
	app_key: string;
	endpoint: string;
	inputs: unknown;
	outputs: unknown;
	api_name?: string | null;
	fn_index?: number | null;
	page?: string;
	label?: string | null;
	status: string;
	error?: string | null;
	started_at: string;
	completed_at?: string | null;
	duration_ms?: number | null;
	queued_ms?: number | null;
	streamed?: boolean;
	assets: Record<string, string>;
	schema_version: number;
}

export interface HistoryResult<T> {
	ok: boolean;
	status: number;
	data: T;
	detail?: string;
}

function url(
	root: string,
	path: string,
	params?: Record<string, string>
): string {
	const query = params ? `?${new URLSearchParams(params)}` : "";
	const base = root.replace(/\/+$/, "");
	if (base) return `${base}/gradio_api/run-history/${path}${query}`;
	// No configured root. A leading slash would drop any mount subpath
	// (`mount_gradio_app(app, path="/myapp")`), so resolve against the document
	// base, which gradio sets via <base href> on the app shell.
	if (typeof document !== "undefined" && document.baseURI) {
		return new URL(
			`gradio_api/run-history/${path}${query}`,
			document.baseURI
		).toString();
	}
	return `gradio_api/run-history/${path}${query}`;
}

async function parse_error(res: Response): Promise<string> {
	try {
		const j = await res.json();
		return typeof j?.detail === "string" ? j.detail : `${res.status}`;
	} catch {
		return `${res.status}`;
	}
}

async function request<T>(
	input: string,
	init: RequestInit,
	fallback: T,
	pick: (body: any) => T
): Promise<HistoryResult<T>> {
	try {
		const res = await fetch(input, { credentials: "include", ...init });
		if (!res.ok) {
			// An empty list and a failed request are different things: a 401 here
			// means "sign in", not "no runs yet".
			return {
				ok: false,
				status: res.status,
				data: fallback,
				detail: await parse_error(res)
			};
		}
		return { ok: true, status: res.status, data: pick(await res.json()) };
	} catch (e) {
		return { ok: false, status: 0, data: fallback, detail: String(e) };
	}
}

/**
 * Create the bucket if it does not exist and confirm it is private and
 * writable by the caller. Stores nothing server-side — the caller keeps its own
 * choice and names it on every later request.
 */
export async function connect_bucket(
	root: string,
	bucket_id: string
): Promise<HistoryResult<{ bucket_id: string; app_key: string } | null>> {
	if (!is_valid_bucket_id(bucket_id)) {
		return {
			ok: false,
			status: 422,
			data: null,
			detail: "invalid bucket id"
		};
	}
	return request(
		url(root, "connect"),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ bucket_id })
		},
		null,
		(b) => b
	);
}

export async function list_user_buckets(root: string): Promise<BucketInfo[]> {
	const res = await request<BucketInfo[]>(url(root, "buckets"), {}, [], (b) =>
		Array.isArray(b?.buckets) ? b.buckets : []
	);
	return res.data;
}

export async function list_bucket_endpoints(
	root: string,
	bucket: string
): Promise<HistoryResult<string[]>> {
	return request(url(root, "endpoints", { bucket }), {}, [], (b) =>
		Array.isArray(b?.endpoints) ? b.endpoints : []
	);
}

export async function list_bucket_records(
	root: string,
	bucket: string,
	options: { endpoint?: string; limit?: number } = {}
): Promise<HistoryResult<HistoryRecord[]>> {
	const params: Record<string, string> = {
		bucket,
		limit: String(options.limit ?? 50)
	};
	if (options.endpoint) params.endpoint = options.endpoint;
	return request(url(root, "records", params), {}, [], (b) =>
		Array.isArray(b?.records) ? b.records : []
	);
}

export async function get_bucket_record(
	root: string,
	bucket: string,
	endpoint: string,
	record_id: string
): Promise<HistoryRecord | null> {
	if (!RECORD_ID_RE.test(record_id) || !SEGMENT_RE.test(endpoint)) return null;
	const res = await request<HistoryRecord | null>(
		url(
			root,
			`records/${encodeURIComponent(endpoint)}/${encodeURIComponent(record_id)}`,
			{ bucket }
		),
		{},
		null,
		(b) => b
	);
	return res.data;
}

export async function delete_record_from_bucket(
	root: string,
	bucket: string,
	endpoint: string,
	record_id: string
): Promise<HistoryResult<null>> {
	if (!RECORD_ID_RE.test(record_id) || !SEGMENT_RE.test(endpoint)) {
		return { ok: false, status: 422, data: null, detail: "invalid record" };
	}
	return request(
		url(
			root,
			`records/${encodeURIComponent(endpoint)}/${encodeURIComponent(record_id)}`,
			{ bucket }
		),
		{ method: "DELETE" },
		null,
		() => null
	);
}

export async function clear_records(
	root: string,
	bucket: string,
	endpoint?: string
): Promise<HistoryResult<null>> {
	const params: Record<string, string> = { bucket };
	if (endpoint) params.endpoint = endpoint;
	return request(
		url(root, "records", params),
		{ method: "DELETE" },
		null,
		() => null
	);
}

/** Delete asset blobs left behind by a half-completed write. Nothing else can
 * reach them, so only this sweep can reclaim the space. */
export async function sweep_orphan_assets(
	root: string,
	bucket: string
): Promise<HistoryResult<number>> {
	return request(
		url(root, "orphans", { bucket }),
		{ method: "POST" },
		0,
		(b) => (typeof b?.removed === "number" ? b.removed : 0)
	);
}

/** Backend-proxied download URL for a stored asset. Use as `<img src=…>`. */
export function asset_url(
	root: string,
	bucket: string,
	endpoint: string,
	record_id: string,
	asset_id: string
): string {
	return url(
		root,
		`records/${encodeURIComponent(endpoint)}/${encodeURIComponent(
			record_id
		)}/assets/${encodeURIComponent(asset_id)}`,
		{ bucket }
	);
}
