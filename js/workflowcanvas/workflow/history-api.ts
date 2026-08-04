// Client-side wrappers for the /gradio_api/history/* core routes.
// Every call sends cookies (OAuth session + write-token) via credentials: "include".

async function historyFetch<T>(
	path: string,
	init: RequestInit = {}
): Promise<T> {
	const res = await fetch(`/gradio_api/history/${path}`, {
		credentials: "include",
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init.headers ?? {})
		}
	});
	return (await res.json()) as T;
}

export interface HistoryListResponse {
	records: any[];
	repo_id: string | null;
}

export interface HistoryOpResponse {
	ok?: boolean;
	error?: string;
	reason?: string;
	repo_id?: string;
	buckets?: { id: string; private?: boolean }[];
}

export function listHistory(
	subgraph: string | null = null,
	limit: number = 50
): Promise<HistoryListResponse> {
	return historyFetch("list", {
		method: "POST",
		body: JSON.stringify({ subgraph, limit })
	});
}

export function pushHistory(record: unknown): Promise<HistoryOpResponse> {
	return historyFetch("push", {
		method: "POST",
		body: JSON.stringify({ record })
	});
}

export function connectHistory(
	repoId: string,
	auto: boolean
): Promise<HistoryOpResponse> {
	return historyFetch("connect", {
		method: "POST",
		body: JSON.stringify({ repo_id: repoId, auto })
	});
}

export function deleteHistory(
	id: string,
	timestamp: string
): Promise<HistoryOpResponse> {
	return historyFetch("delete", {
		method: "POST",
		body: JSON.stringify({ id, timestamp })
	});
}

export function listUserBuckets(): Promise<HistoryOpResponse> {
	return historyFetch("buckets", { method: "GET" });
}
