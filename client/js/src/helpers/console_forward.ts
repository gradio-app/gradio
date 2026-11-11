// frame side of the gradio-console postMessage protocol v1, pull model
import { get_zerogpu_origin } from "./zerogpu";

export const CONSOLE_FORWARD_PROTOCOL = "gradio-console";
export const CONSOLE_FORWARD_VERSION = 1;

/** entries kept for the next state reply, older ones are evicted and counted as dropped */
export const CONSOLE_FORWARD_BUFFER_SIZE = 100;
export const CONSOLE_FORWARD_MAX_TEXT = 4096;
/** the console is given back if no valid get arrives this long after page load */
export const CONSOLE_FORWARD_IDLE_MS = 10_000;

const UNSERIALIZABLE = "[Unserializable]";

const CONSOLE_LEVELS = ["log", "info", "warn", "error", "debug"] as const;
type ConsoleLevel = (typeof CONSOLE_LEVELS)[number];

export type ConsoleForwardLevel = ConsoleLevel | "exception" | "rejection";

export interface ConsoleForwardEntry {
	seq: number;
	ts: number;
	level: ConsoleForwardLevel;
	text: string;
	stack?: string;
}

const HUB_ORIGIN = "https://huggingface.co";
const LOCAL_DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

/** the v1 allowlist of parent origins that may send get */
export function is_console_forward_origin_allowed(
	origin: string,
	frame_hostname: string
): boolean {
	if (typeof origin !== "string") return false;
	if (origin === HUB_ORIGIN || LOCAL_DEV_ORIGIN.test(origin)) return true;
	if (typeof frame_hostname === "string" && frame_hostname.includes(".dev.")) {
		return origin === get_zerogpu_origin(frame_hostname);
	}
	return false;
}

type Listener = (event: any) => void;
type Untrack = <T>(fn: () => T) => T;

/** the parts of window the forwarder uses, so tests can pass a fake */
export interface ConsoleForwardHost {
	parent: { postMessage(message: any, target_origin: string): void } | null;
	location: { hostname: string };
	console: Console;
	document?: { readyState: string };
	addEventListener(type: string, listener: Listener): void;
	removeEventListener(type: string, listener: Listener): void;
}

export interface ConsoleForwardOptions {
	/** reported in the state reply, defaults to an empty string */
	gradio_version?: string;
	/** svelte untrack, so converting a logged $state value adds no dependency to the effect that logged it */
	untrack?: Untrack;
}

export interface ConsoleForwarder {
	readonly session_id: string;
	/** fills in a missing gradio version and sets untrack if given */
	configure(options: ConsoleForwardOptions): void;
	uninstall(): void;
}

/** returns null and installs nothing when host is not embedded */
export function install_console_forwarding(
	host: ConsoleForwardHost,
	options: ConsoleForwardOptions = {}
): ConsoleForwarder | null {
	try {
		const parent = host.parent as unknown;
		if (!parent || parent === host) return null;
	} catch {
		return null;
	}

	const session_id = create_session_id();
	let gradio_version = "";
	let untrack: Untrack | null = null;
	configure(options);

	let active = true;
	// true while the forwarder runs, so console calls it triggers are not captured
	let busy = false;
	let seq = 0;
	let dropped = 0;
	let answered = false;
	let idle_timer: ReturnType<typeof setTimeout> | null = null;
	const buffer: ConsoleForwardEntry[] = [];

	function configure(next: ConsoleForwardOptions): void {
		if (!gradio_version && typeof next.gradio_version === "string") {
			gradio_version = next.gradio_version;
		}
		if (typeof next.untrack === "function") untrack = next.untrack;
	}

	function guarded(fn: () => void): void {
		if (busy || !active) return;
		busy = true;
		try {
			fn();
		} catch {
			// never throw into the app
		} finally {
			busy = false;
		}
	}

	function capture(
		level: ConsoleForwardLevel,
		convert: () => { text: string; stack?: string }
	): void {
		guarded(() => {
			const ts = Date.now();
			const result = untrack ? untrack(convert) : convert();
			const entry: ConsoleForwardEntry = {
				seq: ++seq,
				ts,
				level,
				text: truncate(result.text)
			};
			if (typeof result.stack === "string") {
				entry.stack = truncate(result.stack);
			}
			buffer.push(entry);
			if (buffer.length > CONSOLE_FORWARD_BUFFER_SIZE) {
				dropped += buffer.length - CONSOLE_FORWARD_BUFFER_SIZE;
				buffer.splice(0, buffer.length - CONSOLE_FORWARD_BUFFER_SIZE);
			}
		});
	}

	function on_message(event: any): void {
		guarded(() => {
			const data = event?.data;
			if (typeof data !== "object" || data === null) return;
			if (data.protocol !== CONSOLE_FORWARD_PROTOCOL) return;
			if (data.type !== "get") return;
			const parent = host.parent;
			if (!parent || event.source !== parent) return;
			const origin = event.origin;
			if (!is_console_forward_origin_allowed(origin, host.location.hostname)) {
				return;
			}
			answered = true;
			if (idle_timer !== null) {
				clearTimeout(idle_timer);
				idle_timer = null;
			}
			wrap_console();
			const reply: Record<string, unknown> = {
				protocol: CONSOLE_FORWARD_PROTOCOL,
				version: CONSOLE_FORWARD_VERSION,
				type: "state",
				session_id,
				gradio_version,
				dropped,
				entries: buffer.slice()
			};
			if (typeof data.id === "string" || typeof data.id === "number") {
				reply.id = data.id;
			}
			parent.postMessage(reply, origin);
		});
	}

	function on_error(event: any): void {
		let error: unknown;
		let message: unknown;
		let location = "";
		try {
			error = event?.error;
			message = event?.message;
			if (event?.filename) {
				location = ` (${event.filename}:${event.lineno}:${event.colno})`;
			}
		} catch {
			// fall through with whatever was read
		}
		capture("exception", () =>
			error !== undefined && error !== null
				? serialize_console_args([error])
				: {
						text:
							(typeof message === "string" && message
								? message
								: "Unknown error") + location
					}
		);
	}

	function on_rejection(event: any): void {
		let reason: unknown;
		try {
			reason = event?.reason;
		} catch {
			reason = undefined;
		}
		capture("rejection", () => serialize_console_args([reason]));
	}

	// a wrapper stays in the chain when another wrapper sits on top of it
	const wrappers = new Map<
		ConsoleLevel,
		{ wrapped: unknown; original: Console[ConsoleLevel] }
	>();
	let console_capturing = false;

	function wrap_console(): void {
		console_capturing = true;
		for (const level of CONSOLE_LEVELS) {
			if (wrappers.has(level)) continue;
			try {
				const target = host.console;
				const original = target[level];
				if (typeof original !== "function") continue;
				const wrapped = function (this: unknown, ...args: unknown[]): unknown {
					try {
						return original.apply(this, args);
					} finally {
						if (console_capturing) {
							capture(level, () => serialize_console_args(args));
						}
					}
				};
				try {
					Object.defineProperty(wrapped, "name", { value: original.name });
				} catch {
					// cosmetic only
				}
				target[level] = wrapped as Console[ConsoleLevel];
				wrappers.set(level, { wrapped, original });
			} catch {
				// leave this method alone
			}
		}
	}

	// gives devtools its call sites back on pages no parent asks about
	function unwrap_console(): void {
		console_capturing = false;
		for (const [level, { wrapped, original }] of wrappers) {
			try {
				if (host.console[level] === wrapped) {
					host.console[level] = original;
					wrappers.delete(level);
				}
			} catch {
				// ignore
			}
		}
	}

	function start_idle_timer(): void {
		if (idle_timer !== null || answered || !active) return;
		idle_timer = setTimeout(() => {
			idle_timer = null;
			if (!answered) unwrap_console();
		}, CONSOLE_FORWARD_IDLE_MS);
	}

	wrap_console();

	const restore: (() => void)[] = [];
	const listeners: [string, Listener][] = [
		["message", on_message],
		["error", on_error],
		["unhandledrejection", on_rejection],
		["load", start_idle_timer]
	];
	for (const [type, listener] of listeners) {
		try {
			host.addEventListener(type, listener);
			restore.push(() => host.removeEventListener(type, listener));
		} catch {
			// skip this source
		}
	}
	try {
		if (host.document?.readyState === "complete") start_idle_timer();
	} catch {
		// wait for load
	}

	return {
		session_id,
		configure,
		uninstall(): void {
			active = false;
			if (idle_timer !== null) clearTimeout(idle_timer);
			idle_timer = null;
			unwrap_console();
			for (const undo of restore) {
				try {
					undo();
				} catch {
					// ignore
				}
			}
		}
	};
}

const GLOBAL_KEY = Symbol.for("gradio.console_forward");

/** installs on window at most once per page even across bundled copies, later calls only configure it */
export function initialize_console_forwarding(
	options: ConsoleForwardOptions = {}
): ConsoleForwarder | null {
	try {
		if (
			typeof window === "undefined" ||
			typeof window.addEventListener !== "function"
		) {
			return null;
		}
		const store = window as unknown as Record<
			symbol,
			ConsoleForwarder | null | undefined
		>;
		const existing = store[GLOBAL_KEY];
		if (existing !== undefined) {
			existing?.configure(options);
			return existing;
		}
		const forwarder = install_console_forwarding(
			window as unknown as ConsoleForwardHost,
			options
		);
		store[GLOBAL_KEY] = forwarder;
		return forwarder;
	} catch {
		return null;
	}
}

/** initializes only when app_url is an absolute url on this page origin, so other sites that use the client are untouched */
export function initialize_console_forwarding_for_app(
	app_url: string | null | undefined,
	gradio_version?: string
): void {
	try {
		if (typeof window === "undefined" || typeof app_url !== "string") return;
		// no base url so space ids like user/space never resolve to this origin
		if (new URL(app_url).origin !== window.location.origin) return;
		initialize_console_forwarding({ gradio_version });
	} catch {
		// not a url or not a browser
	}
}

/** initializes when this page is served from a space host, so custom pages capture from the moment they import the client */
export function initialize_console_forwarding_on_space(): void {
	try {
		if (typeof window === "undefined") return;
		if (get_zerogpu_origin(window.location.hostname) === null) return;
		initialize_console_forwarding();
	} catch {
		// not a browser
	}
}

function create_session_id(): string {
	try {
		const crypto = globalThis.crypto;
		if (crypto && typeof crypto.randomUUID === "function") {
			return crypto.randomUUID();
		}
	} catch {
		// fall back below
	}
	return (
		Date.now().toString(36) +
		"-" +
		Math.random().toString(36).slice(2) +
		Math.random().toString(36).slice(2)
	);
}

function truncate(text: string): string {
	return text.length > CONSOLE_FORWARD_MAX_TEXT
		? text.slice(0, CONSOLE_FORWARD_MAX_TEXT)
		: text;
}

/** joins the arguments as text per the v1 contract and returns the first error stack, never throws */
export function serialize_console_args(args: readonly unknown[]): {
	text: string;
	stack?: string;
} {
	const parts: string[] = [];
	let stack: string | undefined;
	let seen_error = false;
	for (const arg of args) {
		if (!seen_error && arg instanceof Error) {
			seen_error = true;
			try {
				if (typeof arg.stack === "string") stack = arg.stack;
			} catch {
				// no stack
			}
		}
		parts.push(serialize_arg(arg));
	}
	const result: { text: string; stack?: string } = {
		text: truncate(parts.join(" "))
	};
	if (stack !== undefined) result.stack = truncate(stack);
	return result;
}

function serialize_arg(arg: unknown): string {
	try {
		if (typeof arg === "string") return arg;
		if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
		return JSON.stringify(arg) ?? String(arg);
	} catch {
		try {
			return String(arg);
		} catch {
			return UNSERIALIZABLE;
		}
	}
}
