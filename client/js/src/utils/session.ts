import type { Config } from "../types";

export interface ResumableJob {
	event_id: string;
	fn_index: number;
}

interface ResumableSession {
	// Identifies the app's structure, the same across restarts and replicas
	app_key?: string;
	root: string;
	session_hash: string;
	events: ResumableJob[];
	// The pages this tab has shown in the session, whose load events have run.
	pages?: string[];
	// Whether a visible page is using the session. A page gives it up while
	// hidden, so that the page replacing it (after a refresh, or when the
	// browser reloads a discarded tab) picks it up, whereas a duplicated tab
	// copies it from a page that is still using it and starts its own.
	in_use?: boolean;
}

// The data a session saves (its gr.State tokens and component values) is in
// IndexedDB (see `session_store.ts`); this is only the tab's pointer to it.
const STORAGE_KEY = "gradio_active_session";

function read_session(): ResumableSession | null {
	if (typeof sessionStorage === "undefined") return null;

	try {
		const value = sessionStorage.getItem(STORAGE_KEY);
		if (!value) return null;
		return JSON.parse(value) as ResumableSession;
	} catch {
		return null;
	}
}

function write_session(session: ResumableSession): void {
	if (typeof sessionStorage === "undefined") return;

	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
	} catch {
		return;
	}
}

function remove_session(): void {
	try {
		if (typeof sessionStorage !== "undefined") {
			sessionStorage.removeItem(STORAGE_KEY);
		}
	} catch {
		return;
	}
}

function is_session(
	session: ResumableSession | null,
	config: Config,
	session_hash: string
): session is ResumableSession {
	return (
		!!session &&
		session.session_hash === session_hash &&
		session.root === config.root &&
		session.app_key === config.app_key
	);
}

/** Forgets the session this tab is using, so that its next load starts a new one. */
export function forget_session(): void {
	remove_session();
}

export function get_resumable_session_hash(): string | null {
	const session = read_session();
	if (session && !session.in_use) {
		if (typeof location === "undefined") return session.session_hash;
		try {
			const root = new URL(session.root);
			if (
				root.origin === location.origin &&
				location.pathname.startsWith(root.pathname)
			) {
				return session.session_hash;
			}
		} catch {
			return null;
		}
	}
	return null;
}

/** Whether this tab was using `session_hash` for this app. */
export function has_session(config: Config, session_hash: string): boolean {
	return is_session(read_session(), config, session_hash);
}

/** Whether this tab has already shown the config's page in `session_hash`. */
export function has_shown_page(config: Config, session_hash: string): boolean {
	const session = read_session();
	return (
		is_session(session, config, session_hash) &&
		!!session.pages?.includes(config.current_page ?? "")
	);
}

/** Remember that this tab is using `session_hash`, for as long as it is open. */
export function track_session(config: Config, session_hash: string): void {
	const session = read_session();
	const current = is_session(session, config, session_hash) ? session : null;
	const pages = new Set(current?.pages).add(config.current_page ?? "");
	write_session({
		app_key: config.app_key,
		root: config.root,
		session_hash,
		events: current?.events ?? [],
		pages: [...pages],
		in_use: true
	});
}

export function set_session_in_use(in_use: boolean): void {
	const session = read_session();
	if (session) write_session({ ...session, in_use });
}

export function get_resumable_events(
	config: Config,
	session_hash: string
): ResumableJob[] {
	const session = read_session();
	if (!is_session(session, config, session_hash)) {
		if (session) remove_session();
		return [];
	}
	return session.events;
}

export function track_resumable_event(
	config: Config,
	session_hash: string,
	event: ResumableJob
): void {
	const session = read_session();
	const current = is_session(session, config, session_hash) ? session : null;
	const events = (current?.events ?? []).filter(
		({ event_id }) => event_id !== event.event_id
	);

	write_session({
		...current,
		app_key: config.app_key,
		root: config.root,
		session_hash,
		events: [...events, event]
	});
}

export function clear_resumable_event(event_id: string): void {
	const session = read_session();
	if (!session) return;

	const events = session.events.filter((event) => event.event_id !== event_id);
	write_session({ ...session, events });
}
