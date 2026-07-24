import type { Config } from "../types";

export interface ResumableJob {
	event_id: string;
	fn_index: number;
}

interface ResumableSession {
	app_id?: string;
	root: string;
	session_hash: string;
	events: ResumableJob[];
	expires_at: number;
}

const STORAGE_KEY = "gradio_active_session";
const COOKIE_NAME = "gradio_active_session";
const RESUME_TTL_SECONDS = 600;

function read_session(): ResumableSession | null {
	if (typeof sessionStorage === "undefined") return null;

	try {
		const value = sessionStorage.getItem(STORAGE_KEY);
		if (!value) return null;
		const session = JSON.parse(value) as ResumableSession;
		if (session.expires_at <= Date.now()) {
			sessionStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return session;
	} catch {
		return null;
	}
}

function cookie_value(cookies: string): string | null {
	const cookie = cookies
		.split(";")
		.map((value) => value.trim())
		.find((value) => value.startsWith(`${COOKIE_NAME}=`));
	const value = cookie?.slice(COOKIE_NAME.length + 1).split(";")[0];
	return value ? decodeURIComponent(value) : null;
}

function cookie_path(root: string): string {
	try {
		return new URL(root).pathname || "/";
	} catch {
		return "/";
	}
}

function write_session(session: ResumableSession): void {
	if (typeof sessionStorage === "undefined") return;

	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
		if (typeof document !== "undefined") {
			document.cookie = `${COOKIE_NAME}=${encodeURIComponent(session.session_hash)}; Path=${cookie_path(session.root)}; Max-Age=${RESUME_TTL_SECONDS}; SameSite=Lax`;
		}
	} catch {
		return;
	}
}

function remove_session(session: ResumableSession): void {
	try {
		if (typeof sessionStorage !== "undefined") {
			sessionStorage.removeItem(STORAGE_KEY);
		}
		if (typeof document !== "undefined") {
			document.cookie = `${COOKIE_NAME}=; Path=${cookie_path(session.root)}; Max-Age=0; SameSite=Lax`;
		}
	} catch {
		return;
	}
}

export function get_resumable_session_hash(cookies?: string): string | null {
	const session = read_session();
	if (session) {
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

	const cookie_string =
		cookies ?? (typeof document !== "undefined" ? document.cookie : "");
	return cookie_value(cookie_string);
}

export function get_resumable_events(
	config: Config,
	session_hash: string
): ResumableJob[] {
	const session = read_session();
	if (
		!session ||
		session.session_hash !== session_hash ||
		session.root !== config.root ||
		(session.app_id && session.app_id !== config.app_id)
	) {
		if (session) remove_session(session);
		return [];
	}
	return session.events;
}

export function track_resumable_event(
	config: Config,
	session_hash: string,
	event: ResumableJob
): void {
	const current = read_session();
	const events =
		current?.session_hash === session_hash && current.root === config.root
			? current.events.filter(({ event_id }) => event_id !== event.event_id)
			: [];

	write_session({
		app_id: config.app_id,
		root: config.root,
		session_hash,
		events: [...events, event],
		expires_at: Date.now() + RESUME_TTL_SECONDS * 1000
	});
}

export function clear_resumable_event(event_id: string): void {
	const session = read_session();
	if (!session) return;

	const events = session.events.filter((event) => event.event_id !== event_id);
	if (events.length === 0) {
		remove_session(session);
	} else {
		write_session({ ...session, events });
	}
}
