/**
 * Console forwarding for embedded Gradio apps: the frame side of the
 * `gradio-console` postMessage protocol, version 1.
 *
 * When a Gradio app runs inside an iframe, it captures console output, window
 * errors and unhandled rejections into a small ring buffer. Nothing is posted
 * until the parent page asks for it with an `init` message from an allowlisted
 * origin. The frame then acks, sends what it has buffered and streams new
 * entries in batches. A frame that never gets `init` posts nothing.
 *
 * Everything here is defensive: the wrapped console methods always call the
 * original first, and capturing, serializing and posting never throw into
 * the app.
 */
import { get_zerogpu_origin } from "./zerogpu";

export const CONSOLE_FORWARD_PROTOCOL = "gradio-console";
export const CONSOLE_FORWARD_VERSION = 1;

/** Entries kept while waiting to be sent. Older ones are evicted and counted as `dropped`. */
export const CONSOLE_FORWARD_BUFFER_SIZE = 100;
/** Most entries in one `entries` message. */
export const CONSOLE_FORWARD_BATCH_SIZE = 50;
/** Longest wait before a partial batch is sent. */
export const CONSOLE_FORWARD_BATCH_MS = 250;
/** Longest `text` or `stack`, including the truncation marker. */
export const CONSOLE_FORWARD_MAX_TEXT = 4096;

const TRUNCATED_SUFFIX = "…[truncated]";
const UNSERIALIZABLE = "[Unserializable]";
const MAX_DEPTH = 4;
// Bounds the work done for one huge value. The text is cut to 4096 chars anyway.
const MAX_ITEMS_PER_CONTAINER = 100;
const MAX_CONTAINERS = 1000;

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

/**
 * The v1 allowlist of parent origins that may send `init`: the Hub, the dev
 * Hub that `get_zerogpu_origin` maps `.dev.` hosts to, and local dev servers
 * on localhost or 127.0.0.1 (any port).
 */
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

/** The parts of `window` the forwarder uses, so tests can pass a fake. */
export interface ConsoleForwardHost {
	parent: { postMessage(message: any, target_origin: string): void } | null;
	location: { hostname: string };
	console: Console;
	addEventListener(type: string, listener: Listener): void;
	removeEventListener(type: string, listener: Listener): void;
}

export interface ConsoleForwardOptions {
	/** Reported in the ack. Defaults to "". */
	gradio_version?: string;
}

export interface ConsoleForwarder {
	readonly session_id: string;
	/** Sets the version reported in later acks, if none is set yet. */
	set_gradio_version(version: string): void;
	/** Restores the console and removes the listeners. For tests. */
	uninstall(): void;
}

interface PendingCapture {
	seq: number;
	ts: number;
	level: ConsoleForwardLevel;
	serialize: () => { text: string; stack?: string };
}

/**
 * Installs console forwarding on `host` if it is embedded in another window.
 * Returns null, and installs nothing, when it isn't.
 */
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
	let gradio_version =
		typeof options.gradio_version === "string" ? options.gradio_version : "";

	let active = true;
	// True while the forwarder itself is running. Console calls, errors and
	// messages that happen meanwhile are not captured, so nothing recurses.
	let busy = false;
	let seq = 0;
	let dropped = 0;
	let target_origin: string | null = null;
	let flush_timer: ReturnType<typeof setTimeout> | null = null;
	let drain_scheduled = false;
	// Captured but not yet serialized. Serializing happens in a microtask so
	// that reading a logged object can't register reactive dependencies (e.g.
	// Svelte or Vue) in whatever effect made the console call.
	const pending: PendingCapture[] = [];
	// Serialized but not yet posted, oldest first.
	const unsent: ConsoleForwardEntry[] = [];

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

	function post(message: Record<string, unknown>): void {
		const p = host.parent;
		if (!p || target_origin === null) return;
		p.postMessage(
			{
				protocol: CONSOLE_FORWARD_PROTOCOL,
				version: CONSOLE_FORWARD_VERSION,
				...message
			},
			target_origin
		);
	}

	function flush(): void {
		if (flush_timer !== null) {
			clearTimeout(flush_timer);
			flush_timer = null;
		}
		if (target_origin === null) return;
		while (unsent.length > 0) {
			const entries = unsent.slice(0, CONSOLE_FORWARD_BATCH_SIZE);
			post({ type: "entries", session_id, entries, dropped });
			unsent.splice(0, entries.length);
			dropped = 0;
		}
	}

	function schedule_flush(): void {
		if (target_origin === null) return;
		if (unsent.length >= CONSOLE_FORWARD_BATCH_SIZE) {
			flush();
		} else if (flush_timer === null && unsent.length > 0) {
			flush_timer = setTimeout(() => {
				flush_timer = null;
				guarded(flush);
			}, CONSOLE_FORWARD_BATCH_MS);
		}
	}

	function drain(): void {
		while (pending.length > 0) {
			const capture = pending.shift()!;
			let result: { text: string; stack?: string };
			try {
				result = capture.serialize();
			} catch {
				result = { text: UNSERIALIZABLE };
			}
			const entry: ConsoleForwardEntry = {
				seq: capture.seq,
				ts: capture.ts,
				level: capture.level,
				text: truncate(result.text)
			};
			if (typeof result.stack === "string") {
				entry.stack = truncate(result.stack);
			}
			unsent.push(entry);
			if (unsent.length > CONSOLE_FORWARD_BUFFER_SIZE) {
				const evicted = unsent.length - CONSOLE_FORWARD_BUFFER_SIZE;
				unsent.splice(0, evicted);
				dropped += evicted;
			}
			schedule_flush();
		}
	}

	function schedule_drain(): void {
		if (drain_scheduled) return;
		drain_scheduled = true;
		Promise.resolve().then(() => {
			drain_scheduled = false;
			guarded(drain);
		});
	}

	function capture(
		level: ConsoleForwardLevel,
		serialize: PendingCapture["serialize"]
	): void {
		guarded(() => {
			pending.push({ seq: ++seq, ts: Date.now(), level, serialize });
			// A burst of console calls in one task can't grow past what the
			// ring buffer would keep anyway.
			if (pending.length > CONSOLE_FORWARD_BUFFER_SIZE) {
				const evicted = pending.length - CONSOLE_FORWARD_BUFFER_SIZE;
				pending.splice(0, evicted);
				dropped += evicted;
			}
			schedule_drain();
		});
	}

	function on_message(event: any): void {
		guarded(() => {
			const data = event?.data;
			if (typeof data !== "object" || data === null) return;
			if (data.protocol !== CONSOLE_FORWARD_PROTOCOL) return;
			if (data.type !== "init") return;
			if (event.source !== host.parent) return;
			const origin = event.origin;
			if (!is_console_forward_origin_allowed(origin, host.location.hostname)) {
				return;
			}
			target_origin = origin;
			post({ type: "ack", session_id, gradio_version, dropped });
			dropped = 0;
			drain();
			flush();
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

	const restore: (() => void)[] = [];

	for (const level of CONSOLE_LEVELS) {
		try {
			const target = host.console;
			const original = target[level];
			if (typeof original !== "function") continue;
			const wrapped = function (this: unknown, ...args: unknown[]): unknown {
				try {
					return original.apply(this, args);
				} finally {
					capture(level, () => serialize_console_args(args));
				}
			};
			try {
				Object.defineProperty(wrapped, "name", { value: original.name });
			} catch {
				// cosmetic only
			}
			target[level] = wrapped as Console[ConsoleLevel];
			restore.push(() => {
				if (target[level] === wrapped) target[level] = original;
			});
		} catch {
			// leave this method alone
		}
	}

	const listeners: [string, Listener][] = [
		["message", on_message],
		["error", on_error],
		["unhandledrejection", on_rejection]
	];
	for (const [type, listener] of listeners) {
		try {
			host.addEventListener(type, listener);
			restore.push(() => host.removeEventListener(type, listener));
		} catch {
			// skip this source
		}
	}

	return {
		session_id,
		set_gradio_version(version: string): void {
			if (!gradio_version && typeof version === "string") {
				gradio_version = version;
			}
		},
		uninstall(): void {
			active = false;
			if (flush_timer !== null) clearTimeout(flush_timer);
			flush_timer = null;
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

/**
 * Installs console forwarding on this page's `window`, at most once per page,
 * even if several copies of this code are loaded. Later calls only fill in
 * the Gradio version if it wasn't known yet. Does nothing outside a browser
 * or when the page isn't embedded.
 */
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
			if (existing && options.gradio_version) {
				existing.set_gradio_version(options.gradio_version);
			}
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

/**
 * Calls `initialize_console_forwarding` if `app_url` is an absolute URL on this
 * page's origin, meaning the page is the app's own frontend (for example a
 * `gr.Server` custom page) rather than another site that uses the client.
 */
export function initialize_console_forwarding_for_app(
	app_url: string | null | undefined,
	gradio_version?: string
): void {
	try {
		if (typeof window === "undefined" || typeof app_url !== "string") return;
		// no base URL: space ids like "user/space" must not count as same-origin
		if (new URL(app_url).origin !== window.location.origin) return;
		initialize_console_forwarding({ gradio_version });
	} catch {
		// not a URL, or not a browser
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
	if (text.length <= CONSOLE_FORWARD_MAX_TEXT) return text;
	return (
		text.slice(0, CONSOLE_FORWARD_MAX_TEXT - TRUNCATED_SUFFIX.length) +
		TRUNCATED_SUFFIX
	);
}

/**
 * Turns console arguments into one line of text, per the v1 contract. Each
 * argument is converted on its own and the results are joined with a space.
 * The first Error argument's stack is returned as `stack`. Never throws.
 */
export function serialize_console_args(args: readonly unknown[]): {
	text: string;
	stack?: string;
} {
	const parts: string[] = [];
	let stack: string | undefined;
	let seen_error = false;
	for (const arg of args) {
		try {
			if (!seen_error && is_error(arg)) {
				seen_error = true;
				const s = (arg as Error).stack;
				if (typeof s === "string") stack = s;
			}
		} catch {
			// no stack
		}
		let part: string;
		try {
			part = serialize_value(arg);
		} catch {
			part = UNSERIALIZABLE;
		}
		parts.push(part);
	}
	const result: { text: string; stack?: string } = {
		text: truncate(parts.join(" "))
	};
	if (stack !== undefined) result.stack = truncate(stack);
	return result;
}

function serialize_value(value: unknown): string {
	switch (typeof value) {
		case "string":
			return value;
		case "number":
		case "boolean":
		case "undefined":
		case "bigint":
		case "symbol":
			return String(value);
		case "function":
			return format_function(value);
	}
	if (value === null) return "null";
	if (is_error(value)) return format_error(value);
	if (is_dom_node(value)) return format_dom_node(value);
	const clone = to_json_value(value, 0, [], { remaining: MAX_CONTAINERS });
	if (clone === UNSERIALIZABLE) return UNSERIALIZABLE;
	const json = JSON.stringify(clone);
	return typeof json === "string" ? json : String(json);
}

function to_json_value(
	value: unknown,
	depth: number,
	ancestors: unknown[],
	budget: { remaining: number }
): unknown {
	switch (typeof value) {
		case "string":
		case "boolean":
		case "undefined":
			return value;
		case "number":
			return Number.isFinite(value) ? value : String(value);
		case "bigint":
		case "symbol":
			return String(value);
		case "function":
			return format_function(value);
	}
	if (value === null) return null;
	try {
		if (is_error(value)) return format_error(value);
		if (is_dom_node(value)) return format_dom_node(value);
		if (ancestors.includes(value)) return "[Circular]";
		const is_array = Array.isArray(value);
		if (depth > MAX_DEPTH || budget.remaining-- <= 0) {
			return is_array ? "[Array]" : "[Object]";
		}
		const to_json = (value as { toJSON?: unknown }).toJSON;
		if (typeof to_json === "function") {
			const replaced = to_json.call(value);
			if (replaced !== value) {
				return to_json_value(replaced, depth, ancestors, budget);
			}
		}

		ancestors.push(value);
		try {
			if (is_array) {
				const array = value as unknown[];
				const out: unknown[] = [];
				const length = array.length;
				const shown = Math.min(length, MAX_ITEMS_PER_CONTAINER);
				for (let i = 0; i < shown; i++) {
					out.push(read_child(() => array[i], depth, ancestors, budget));
				}
				if (length > shown) out.push(`…[${length - shown} more]`);
				return out;
			}
			const object = value as Record<string, unknown>;
			const out: Record<string, unknown> = {};
			const keys = Object.keys(object);
			const shown = Math.min(keys.length, MAX_ITEMS_PER_CONTAINER);
			for (let i = 0; i < shown; i++) {
				const key = keys[i];
				out[key] = read_child(() => object[key], depth, ancestors, budget);
			}
			if (keys.length > shown) out["…"] = `[${keys.length - shown} more]`;
			return out;
		} finally {
			ancestors.pop();
		}
	} catch {
		return UNSERIALIZABLE;
	}
}

function read_child(
	read: () => unknown,
	depth: number,
	ancestors: unknown[],
	budget: { remaining: number }
): unknown {
	try {
		return to_json_value(read(), depth + 1, ancestors, budget);
	} catch {
		return UNSERIALIZABLE;
	}
}

function is_error(value: unknown): boolean {
	if (typeof value !== "object" || value === null) return false;
	return (
		value instanceof Error ||
		Object.prototype.toString.call(value) === "[object Error]"
	);
}

function format_error(value: unknown): string {
	const error = value as Error;
	return `${String(error.name)}: ${String(error.message)}`;
}

function format_function(value: unknown): string {
	const name = (value as { name?: unknown }).name;
	return `[Function ${typeof name === "string" && name ? name : "anonymous"}]`;
}

function is_dom_node(value: unknown): boolean {
	if (typeof value !== "object" || value === null) return false;
	if (typeof Node !== "undefined" && value instanceof Node) return true;
	// Nodes from another realm (e.g. a child iframe) fail instanceof.
	const node = value as { nodeType?: unknown; nodeName?: unknown };
	return (
		typeof node.nodeType === "number" &&
		typeof node.nodeName === "string" &&
		typeof (value as { cloneNode?: unknown }).cloneNode === "function"
	);
}

function format_dom_node(value: unknown): string {
	const node = value as Element;
	if (node.nodeType !== 1) {
		return `<${String(node.nodeName).toLowerCase()}>`;
	}
	let out = String(node.localName || node.nodeName).toLowerCase();
	if (typeof node.id === "string" && node.id) out += `#${node.id}`;
	const class_attr =
		typeof node.getAttribute === "function" ? node.getAttribute("class") : null;
	if (class_attr) {
		for (const name of class_attr.split(/\s+/)) {
			if (name) out += `.${name}`;
		}
	}
	return `<${out}>`;
}
