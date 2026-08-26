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

export function is_valid_bucket_id(id: string): boolean {
	if (!BUCKET_ID_RE.test(id)) return false;
	return !id
		.split("/")
		.some((seg) => seg === "" || seg === "." || seg === "..");
}

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
 * Create the bucket if it does not exist and confirm it is writable. Stores
 * nothing server-side — the caller keeps its own choice and names it on every
 * later request.
 */
export async function connect_bucket(
	root: string,
	bucket_id: string
): Promise<HistoryResult<null>> {
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
		() => null
	);
}

export async function list_user_buckets(
	root: string
): Promise<HistoryResult<string[]>> {
	return request<string[]>(url(root, "buckets"), {}, [], (b) =>
		Array.isArray(b?.buckets) ? b.buckets : []
	);
}

export async function list_bucket_records(
	root: string,
	bucket: string
): Promise<HistoryResult<HistoryRecord[]>> {
	return request(url(root, "records", { bucket }), {}, [], (b) =>
		Array.isArray(b?.records) ? b.records : []
	);
}

export function asset_url(
	root: string,
	bucket: string,
	endpoint: string,
	record_id: string,
	filename: string
): string {
	return url(
		root,
		`records/${encodeURIComponent(endpoint)}/${encodeURIComponent(
			record_id
		)}/assets/${encodeURIComponent(filename)}`,
		{ bucket }
	);
}
