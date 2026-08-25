import type { StoredRun } from "./run_history";

const BUCKET_ID_RE = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-][a-zA-Z0-9_./-]*$/;
const RECORD_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

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

export interface HistoryRecord {
	record_id: string;
	owner_id: string;
	app_key: string;
	created_at: string;
	inputs: Record<string, unknown>;
	outputs: Record<string, unknown>;
	assets: Record<string, string>;
	schema_version: number;
	subgraph?: string;
}

function url(root: string, path: string): string {
	const base = root.replace(/\/+$/, "");
	if (base) return `${base}/gradio_api/run-history/${path}`;
	// No configured root. A leading slash would drop any mount subpath
	// (`mount_gradio_app(app, path="/myapp")`), so resolve against the document
	// base, which gradio sets via <base href> on the app shell.
	if (typeof document !== "undefined" && document.baseURI) {
		return new URL(
			`gradio_api/run-history/${path}`,
			document.baseURI
		).toString();
	}
	return `gradio_api/run-history/${path}`;
}

async function parse_error(res: Response): Promise<string> {
	try {
		const j = await res.json();
		return typeof j?.detail === "string" ? j.detail : `${res.status}`;
	} catch {
		return `${res.status}`;
	}
}

export async function connect_bucket(
	root: string,
	bucket_id: string
): Promise<{ ok: boolean; status: number; detail?: string }> {
	if (!is_valid_bucket_id(bucket_id)) {
		return { ok: false, status: 422, detail: "invalid bucket id" };
	}
	try {
		const res = await fetch(url(root, "connect"), {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ bucket_id })
		});
		return {
			ok: res.ok,
			status: res.status,
			detail: res.ok ? undefined : await parse_error(res)
		};
	} catch (e: any) {
		return { ok: false, status: 0, detail: String(e) };
	}
}

export async function disconnect_bucket(root: string): Promise<void> {
	try {
		await fetch(url(root, "disconnect"), {
			method: "POST",
			credentials: "include"
		});
	} catch {}
}

export async function list_user_buckets(root: string): Promise<BucketInfo[]> {
	try {
		const res = await fetch(url(root, "buckets"), { credentials: "include" });
		if (!res.ok) return [];
		const data = await res.json();
		return Array.isArray(data?.buckets) ? data.buckets : [];
	} catch {
		return [];
	}
}

export interface HistoryListResult {
	ok: boolean;
	status: number;
	records: HistoryRecord[];
	detail?: string;
}

export async function list_bucket_records(
	root: string,
	limit = 50
): Promise<HistoryListResult> {
	try {
		const params = new URLSearchParams({ limit: String(limit) });
		const res = await fetch(`${url(root, "records")}?${params}`, {
			credentials: "include"
		});
		if (!res.ok) {
			// An empty list and a failed request are different things: a 409 here
			// means the session lost its bucket, not that the bucket is empty.
			return {
				ok: false,
				status: res.status,
				records: [],
				detail: await parse_error(res)
			};
		}
		const data = await res.json();
		return {
			ok: true,
			status: res.status,
			records: Array.isArray(data?.records) ? data.records : []
		};
	} catch (e) {
		console.warn("[run-history] list failed:", e);
		return { ok: false, status: 0, records: [], detail: String(e) };
	}
}

export async function get_bucket_record(
	root: string,
	record_id: string
): Promise<HistoryRecord | null> {
	if (!RECORD_ID_RE.test(record_id)) return null;
	try {
		const res = await fetch(
			`${url(root, "records")}/${encodeURIComponent(record_id)}`,
			{ credentials: "include" }
		);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

interface PushInput {
	record_id: string;
	inputs?: Record<string, unknown>;
	outputs?: Record<string, unknown>;
	subgraph?: string;
	created_at?: string;
}

export async function push_record_to_bucket(
	root: string,
	record: PushInput | StoredRun
): Promise<{ ok: boolean; status: number; detail?: string }> {
	const rid = (record as any).record_id ?? (record as any).id;
	if (typeof rid !== "string" || !RECORD_ID_RE.test(rid)) {
		return { ok: false, status: 422, detail: "invalid record id" };
	}
	if ((record as StoredRun)?.status === "running") {
		return { ok: false, status: 0, detail: "still running" };
	}
	try {
		const res = await fetch(url(root, "records"), {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...(record as any), record_id: rid })
		});
		return {
			ok: res.ok,
			status: res.status,
			detail: res.ok ? undefined : await parse_error(res)
		};
	} catch (e: any) {
		return { ok: false, status: 0, detail: String(e) };
	}
}

export function delete_record_from_bucket(
	root: string,
	record: { record_id?: string; id?: string }
): void {
	const rid = record?.record_id ?? record?.id;
	if (typeof rid !== "string" || !RECORD_ID_RE.test(rid)) return;
	fetch(`${url(root, "records")}/${encodeURIComponent(rid)}`, {
		method: "DELETE",
		credentials: "include"
	}).catch(() => {});
}

export function clear_records(root: string): Promise<Response> {
	return fetch(url(root, "records"), {
		method: "DELETE",
		credentials: "include"
	});
}

/** Backend-proxied download URL for a stored asset. Use as `<img src=…>`. */
export function asset_url(
	root: string,
	record_id: string,
	asset_id: string
): string {
	return `${url(root, "records")}/${encodeURIComponent(record_id)}/assets/${encodeURIComponent(asset_id)}`;
}
