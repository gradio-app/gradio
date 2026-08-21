import type { StoredRun } from "./run_history";

const BUCKET_ID_RE = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-][a-zA-Z0-9_./-]*$/;

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

function url(root: string, path: string): string {
	return `${root.replace(/\/+$/, "")}/gradio_api/run-history/${path}`;
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

export async function list_bucket_records(
	root: string,
	limit = 50,
	subgraph?: string
): Promise<StoredRun[]> {
	try {
		const params = new URLSearchParams({ limit: String(limit) });
		if (subgraph) params.set("subgraph", subgraph);
		const res = await fetch(`${url(root, "records")}?${params}`, {
			credentials: "include"
		});
		if (!res.ok) return [];
		const data = await res.json();
		return Array.isArray(data?.records) ? data.records : [];
	} catch (e) {
		console.warn("[run-history] list failed:", e);
		return [];
	}
}

export async function push_record_to_bucket(
	root: string,
	record: StoredRun
): Promise<boolean> {
	if (!record?.id || record.status === "running") return false;
	try {
		const res = await fetch(url(root, "records"), {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ record })
		});
		return res.ok;
	} catch (e) {
		console.warn("[run-history] push failed:", e);
		return false;
	}
}

export function delete_record_from_bucket(
	root: string,
	record: Pick<StoredRun, "id" | "started_at">
): void {
	if (!record?.id || !record.started_at) return;
	const params = new URLSearchParams({ timestamp: record.started_at });
	fetch(`${url(root, "records")}/${encodeURIComponent(record.id)}?${params}`, {
		method: "DELETE",
		credentials: "include"
	}).catch(() => {});
}
