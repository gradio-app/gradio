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

import { spaces_storage_headers } from "../helpers/spaces_storage";
import { SPACES_STORAGE_BUCKET } from "./run_history";

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
 *
 * `token` is the caller's own HF access token. Once the bucket connects, the
 * server keeps it in an HttpOnly cookie for this app and uses it for this
 * browser's history; without one, the request needs an OAuth session or a
 * token kept by an earlier connect.
 */
export async function connect_bucket(
	root: string,
	bucket_id: string,
	token?: string
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
			body: JSON.stringify(token ? { bucket_id, token } : { bucket_id })
		},
		null,
		() => null
	);
}

/**
 * Forget the token this browser gave for run history. The server clears its
 * HttpOnly cookie, which page code can't.
 */
export async function disconnect_bucket(
	root: string
): Promise<HistoryResult<null>> {
	return request(
		url(root, "disconnect"),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
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

/** Run a storage request, with the viewer's token on Spaces storage. A 401
 * there means the token expired, so ask the Space page again and retry once. */
async function with_storage_headers<T>(
	bucket: string,
	target: string,
	send: (headers: Record<string, string>) => Promise<HistoryResult<T>>
): Promise<HistoryResult<T>> {
	if (bucket !== SPACES_STORAGE_BUCKET) return send({});
	const result = await send(await spaces_storage_headers(target));
	return result.status === 401
		? send(await spaces_storage_headers(target, true))
		: result;
}

export async function list_bucket_records(
	root: string,
	bucket: string
): Promise<HistoryResult<HistoryRecord[]>> {
	const target = url(root, "records", { bucket });
	return with_storage_headers(bucket, target, (headers) =>
		request(target, { headers }, [], (b) =>
			Array.isArray(b?.records) ? b.records : []
		)
	);
}

/** An asset as an object URL, for Spaces storage, whose requests need a
 * header an `<img src>` cannot send. Other buckets use `asset_url` directly. */
export async function fetch_asset_url(
	root: string,
	bucket: string,
	endpoint: string,
	record_id: string,
	filename: string
): Promise<string> {
	const src = asset_url(root, bucket, endpoint, record_id, filename);
	if (bucket !== SPACES_STORAGE_BUCKET) return src;
	const result = await with_storage_headers(bucket, src, async (headers) => {
		try {
			const res = await fetch(src, { credentials: "include", headers });
			return {
				ok: res.ok,
				status: res.status,
				data: res.ok ? URL.createObjectURL(await res.blob()) : src
			};
		} catch {
			return { ok: false, status: 0, data: src };
		}
	});
	return result.data;
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
