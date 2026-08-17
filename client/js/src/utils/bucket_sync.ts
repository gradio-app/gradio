// Client-side wrappers for the `/gradio_api/history/*` bucket routes plus
// per-app configuration in localStorage. Callers opt into durable bucket
// storage; when configured, run records are mirrored to a private HF Hub
// bucket alongside the localStorage history.
//
// See #13638 for the backend primitive that serves these routes.

import type { RunHistoryScope, StoredRun } from "./run_history";

const CONFIG_PREFIX = "gradio:run-history:bucket:v2:";

export interface BucketSyncConfig {
	enabled: boolean;
	bucket_id: string;
}

export interface BucketInfo {
	id: string;
	private?: boolean;
}

function config_key(scope: RunHistoryScope | null | undefined): string | null {
	if (typeof window === "undefined") return null;
	const app_id = scope?.app_id;
	if (app_id === null || app_id === undefined || app_id === "") return null;
	try {
		if (!window.localStorage) return null;
		const user = scope?.username
			? `:user:${encodeURIComponent(scope.username)}`
			: "";
		return `${CONFIG_PREFIX}${app_id}${user}`;
	} catch {
		return null;
	}
}

/** Read the caller's bucket-sync preference for this app + user pair. */
export function get_bucket_sync_config(
	scope: RunHistoryScope | null | undefined
): BucketSyncConfig {
	const key = config_key(scope);
	if (!key) return { enabled: false, bucket_id: "" };
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return { enabled: false, bucket_id: "" };
		const parsed = JSON.parse(raw);
		return {
			enabled: Boolean(parsed?.enabled),
			bucket_id: String(parsed?.bucket_id ?? "")
		};
	} catch {
		return { enabled: false, bucket_id: "" };
	}
}

export function set_bucket_sync_config(
	scope: RunHistoryScope | null | undefined,
	config: BucketSyncConfig
): void {
	const key = config_key(scope);
	if (!key) return;
	try {
		window.localStorage.setItem(key, JSON.stringify(config));
	} catch {
		// nothing to do — this is opt-in, treat storage failure as "not configured"
	}
}

function history_url(root: string, path: string): string {
	return `${root.replace(/\/+$/, "")}/gradio_api/history/${path}`;
}

async function post(root: string, path: string, body: unknown): Promise<any> {
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
	} catch {
		return [];
	}
}

/** Mirror a completed run to the bucket. Fire-and-forget; failures are silent. */
export function push_record_to_bucket(
	root: string,
	bucket_id: string,
	record: StoredRun
): void {
	if (!bucket_id || !record?.id) return;
	// Only push terminal records — the bucket represents durable outcomes,
	// not in-progress state. The route accepts anything with an id but
	// mirroring "running" records adds noise.
	if (record.status === "running") return;
	post(root, "push", { bucket_id, record }).catch(() => {});
}

/** Mirror a deletion to the bucket. Fire-and-forget. */
export function delete_record_from_bucket(
	root: string,
	bucket_id: string,
	record: Pick<StoredRun, "id" | "started_at">
): void {
	if (!bucket_id || !record?.id) return;
	// The backend derives the bucket path from (id, timestamp); it uses the
	// record's own timestamp so we send `started_at` — the record's canonical
	// creation time.
	post(root, "delete", {
		bucket_id,
		id: record.id,
		timestamp: record.started_at
	}).catch(() => {});
}

/**
 * Merge local runs with bucket records, preferring the newer version of any
 * shared id and sorting newest-first by `started_at`.
 */
export function merge_runs(local: StoredRun[], remote: StoredRun[]): StoredRun[] {
	const by_id = new Map<string, StoredRun>();
	for (const r of [...remote, ...local]) {
		const existing = by_id.get(r.id);
		if (!existing || (r.completed_at ?? "") > (existing.completed_at ?? "")) {
			by_id.set(r.id, r);
		}
	}
	return [...by_id.values()].sort((a, b) =>
		(b.started_at ?? "").localeCompare(a.started_at ?? "")
	);
}
