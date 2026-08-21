// Client wrappers for /gradio_api/history/*.

import type { StoredRun } from "./run_history";

// Mirrors gradio.routes._bucket_repo_re. Kept in one place so UI and server
// agree on what counts as a well-formed bucket id.
const BUCKET_ID_RE = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-][a-zA-Z0-9_./-]*$/;

export function is_valid_bucket_id(id: string): boolean {
	if (!BUCKET_ID_RE.test(id)) return false;
	return !id
		.split("/")
		.some((seg) => seg === "" || seg === "." || seg === "..");
}

interface BucketResponse {
	ok?: boolean;
	reason?: string;
	detail?: string;
	records?: StoredRun[];
}

export interface BucketInfo {
	id: string;
	private?: boolean;
}

function history_url(root: string, path: string): string {
	return `${root.replace(/\/+$/, "")}/gradio_api/history/${path}`;
}

async function post(
	root: string,
	path: string,
	body: unknown
): Promise<BucketResponse> {
	const res = await fetch(history_url(root, path), {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`bucket ${path}: ${res.status}`);
	return res.json();
}

/** Fetch the caller's own HF Hub buckets. Returns [] when unauthenticated. */
export async function list_user_buckets(root: string): Promise<BucketInfo[]> {
	try {
		const res = await fetch(history_url(root, "buckets"), {
			credentials: "include"
		});
		if (!res.ok) return [];
		const data = await res.json();
		return Array.isArray(data?.buckets) ? data.buckets : [];
	} catch {
		return [];
	}
}

/** Verify (or auto-create) a bucket. Reason is `auth` | `no_permission` | `unknown` | `network`. */
export async function ensure_bucket(
	root: string,
	bucket_id: string
): Promise<{ ok: boolean; reason?: string; detail?: string }> {
	if (!bucket_id) return { ok: false, reason: "invalid_bucket" };
	try {
		const res = await fetch(history_url(root, "ensure"), {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ bucket_id })
		});
		return await res.json();
	} catch (e: any) {
		return { ok: false, reason: "network", detail: String(e) };
	}
}

/** Fetch records from a bucket. Silently returns [] on any failure. */
export async function list_bucket_records(
	root: string,
	bucket_id: string,
	limit = 100
): Promise<StoredRun[]> {
	if (!bucket_id) return [];
	try {
		const data = await post(root, "list", { bucket_id, limit });
		return Array.isArray(data?.records) ? data.records : [];
	} catch (e) {
		console.warn("[bucket] list failed:", e);
		return [];
	}
}

/** Mirror a completed run to the bucket. Returns true on server-accepted,
 *  false on any failure (network, auth, rate limit). Failures are logged. */
export async function push_record_to_bucket(
	root: string,
	bucket_id: string,
	record: StoredRun
): Promise<boolean> {
	if (!bucket_id || !record?.id) return false;
	if (record.status === "running") return false;
	try {
		const res = await post(root, "push", { bucket_id, record });
		return res?.ok !== false;
	} catch (e) {
		console.warn("[bucket] push failed:", e);
		return false;
	}
}

/** Mirror a deletion to the bucket. Fire-and-forget. */
export function delete_record_from_bucket(
	root: string,
	bucket_id: string,
	record: Pick<StoredRun, "id" | "started_at">
): void {
	if (!bucket_id || !record?.id) return;
	post(root, "delete", {
		bucket_id,
		id: record.id,
		timestamp: record.started_at
	}).catch(() => {});
}
