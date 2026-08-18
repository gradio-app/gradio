import type { Config } from "../types";

export interface PendingJob {
	event_id: string;
	fn_index: number;
}

interface PendingJobs {
	app_id?: string;
	root: string;
	jobs: PendingJob[];
}

const STORAGE_KEY = "gradio_pending_jobs";

/**
 * Jobs that were submitted but whose result has not arrived yet, remembered so that
 * a page which reloads can pick them back up.
 *
 * Kept in `sessionStorage`, which is scoped to the tab and cleared when it closes —
 * the same lifetime a Gradio session has. A cookie or `localStorage` would be shared
 * across tabs, and two tabs of one app are meant to be independent.
 *
 * Only the job ids are stored, never the session hash. Reattaching by job id lets the
 * work carry on under the session it was submitted from, where its `gr.State` lives,
 * while the reloaded page starts a new session and so keeps the cleared state a reload
 * is supposed to give. Storage may be unavailable — a private window, or an embedded
 * page whose storage is blocked — so every access degrades to remembering nothing.
 */
function read(): PendingJobs | null {
	if (typeof sessionStorage === "undefined") return null;

	try {
		const value = sessionStorage.getItem(STORAGE_KEY);
		return value ? (JSON.parse(value) as PendingJobs) : null;
	} catch {
		return null;
	}
}

function write(pending: PendingJobs | null): void {
	if (typeof sessionStorage === "undefined") return;

	try {
		if (pending === null || pending.jobs.length === 0) {
			sessionStorage.removeItem(STORAGE_KEY);
		} else {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
		}
	} catch {
		return;
	}
}

/** The jobs still outstanding for this app, forgetting any belonging to another. */
export function read_pending_jobs(config: Config): PendingJob[] {
	const pending = read();
	if (!pending) return [];
	if (
		pending.root !== config.root ||
		(pending.app_id && config.app_id && pending.app_id !== config.app_id)
	) {
		// Left behind by a different app on the same origin, which is easily done on
		// localhost, and its ids mean nothing here.
		write(null);
		return [];
	}
	return pending.jobs;
}

export function track_pending_job(config: Config, job: PendingJob): void {
	const pending = read();
	const jobs =
		pending && pending.root === config.root
			? pending.jobs.filter(({ event_id }) => event_id !== job.event_id)
			: [];

	write({ app_id: config.app_id, root: config.root, jobs: [...jobs, job] });
}

export function clear_pending_job(event_id: string): void {
	const pending = read();
	if (!pending) return;

	write({
		...pending,
		jobs: pending.jobs.filter((job) => job.event_id !== event_id)
	});
}
