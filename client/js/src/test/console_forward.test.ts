import { describe, it, expect, vi, afterEach } from "vitest";
import {
	CONSOLE_FORWARD_PROTOCOL,
	initialize_console_forwarding,
	initialize_console_forwarding_for_app,
	install_console_forwarding,
	is_console_forward_origin_allowed,
	serialize_console_args,
	type ConsoleForwardHost,
	type ConsoleForwarder
} from "../helpers/console_forward";
import { initialize_zerogpu_handshake } from "../helpers/zerogpu";

const HUB = "https://huggingface.co";
const INIT = { protocol: CONSOLE_FORWARD_PROTOCOL, version: 1, type: "init" };
const LEVELS = ["log", "info", "warn", "error", "debug"] as const;
const has_dom = typeof document !== "undefined";

type Listener = (event: any) => void;

interface Posted {
	message: any;
	origin: string;
}

function make_host({
	embedded = true,
	hostname = "user-space.hf.space"
}: { embedded?: boolean; hostname?: string } = {}) {
	const listeners = new Map<string, Set<Listener>>();
	const posted: Posted[] = [];
	const parent = {
		postMessage: vi.fn((message: any, origin: string) => {
			posted.push({ message, origin });
		})
	};
	const calls: { level: string; self: unknown; args: unknown[] }[] = [];
	const original: Record<string, (...args: unknown[]) => unknown> = {};
	const console_impl: Record<string, unknown> = {};
	for (const level of LEVELS) {
		original[level] = vi.fn(function (this: unknown, ...args: unknown[]) {
			calls.push({ level, self: this, args });
			return `${level}-result`;
		});
		console_impl[level] = original[level];
	}
	const onerror = vi.fn();
	const host = {
		parent: parent as ConsoleForwardHost["parent"],
		location: { hostname },
		console: console_impl as unknown as Console,
		onerror,
		addEventListener: vi.fn((type: string, listener: Listener) => {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type)!.add(listener);
		}),
		removeEventListener: vi.fn((type: string, listener: Listener) => {
			listeners.get(type)?.delete(listener);
		})
	};
	if (!embedded) host.parent = host as unknown as ConsoleForwardHost["parent"];

	function dispatch(type: string, event: unknown): unknown[] {
		return [...(listeners.get(type) ?? [])].map((listener) => listener(event));
	}

	function init(
		options: { origin?: string; source?: unknown; data?: unknown } = {}
	): void {
		dispatch("message", {
			data: "data" in options ? options.data : INIT,
			origin: options.origin ?? HUB,
			source: "source" in options ? options.source : parent
		});
	}

	function messages(type?: string): any[] {
		return posted
			.map((p) => p.message)
			.filter((m) => type === undefined || m.type === type);
	}

	function entries(): any[] {
		return messages("entries").flatMap((m) => m.entries);
	}

	return {
		host,
		parent,
		posted,
		calls,
		original,
		listeners,
		dispatch,
		init,
		messages,
		entries
	};
}

// serialization runs in a microtask after the console call
async function settle(): Promise<void> {
	for (let i = 0; i < 5; i++) await Promise.resolve();
}

let installed: ConsoleForwarder[] = [];

function install(
	host: ReturnType<typeof make_host>["host"],
	gradio_version?: string
): ConsoleForwarder | null {
	const forwarder = install_console_forwarding(host, { gradio_version });
	if (forwarder) installed.push(forwarder);
	return forwarder;
}

afterEach(() => {
	installed.forEach((f) => f.uninstall());
	installed = [];
	vi.useRealTimers();
});

describe("console forwarding: install", () => {
	it("installs nothing when the page is not embedded", () => {
		const env = make_host({ embedded: false });
		expect(install(env.host)).toBeNull();
		for (const level of LEVELS) {
			expect(env.host.console[level]).toBe(env.original[level]);
		}
		expect(env.host.addEventListener).not.toHaveBeenCalled();
	});

	it("installs nothing when there is no parent", () => {
		const env = make_host();
		env.host.parent = null;
		expect(install(env.host)).toBeNull();
		expect(env.host.addEventListener).not.toHaveBeenCalled();
	});

	it("listens for messages, errors and rejections only through addEventListener", () => {
		const env = make_host();
		install(env.host);
		expect([...env.listeners.keys()].sort()).toEqual([
			"error",
			"message",
			"unhandledrejection"
		]);
	});

	it("uninstall restores the console and removes the listeners", () => {
		const env = make_host();
		install(env.host)!.uninstall();
		for (const level of LEVELS) {
			expect(env.host.console[level]).toBe(env.original[level]);
		}
		for (const set of env.listeners.values()) expect(set.size).toBe(0);
	});
});

describe("console forwarding: before init", () => {
	it("calls the original console method first, with the same arguments and this", async () => {
		const env = make_host();
		install(env.host);
		const arg = { a: 1 };

		const result = env.host.console.log("hello", arg, 3);
		expect(result).toBe("log-result");
		expect(env.calls).toEqual([
			{ level: "log", self: env.host.console, args: ["hello", arg, 3] }
		]);

		const other_this = { me: true };
		env.host.console.warn.call(other_this, "w");
		expect(env.calls[1]).toEqual({
			level: "warn",
			self: other_this,
			args: ["w"]
		});

		await settle();
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it("still calls the original when it throws, and rethrows its error", async () => {
		const env = make_host();
		const boom = new Error("original failed");
		env.host.console.error = vi.fn(() => {
			throw boom;
		});
		install(env.host);
		expect(() => env.host.console.error("x")).toThrow(boom);
		await settle();
		env.init();
		expect(env.entries().map((e) => e.text)).toEqual(["x"]);
	});

	it("posts nothing, ever, without an init", async () => {
		vi.useFakeTimers();
		const env = make_host();
		install(env.host);
		for (let i = 0; i < 120; i++) env.host.console.info(i);
		env.dispatch("error", { error: new Error("e"), preventDefault: vi.fn() });
		env.dispatch("unhandledrejection", {
			reason: "r",
			preventDefault: vi.fn()
		});
		await settle();
		vi.advanceTimersByTime(10_000);
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it("keeps the last 100 entries and counts the evicted ones as dropped", async () => {
		const env = make_host();
		install(env.host);
		for (let i = 1; i <= 150; i++) {
			env.host.console.log(`line ${i}`);
			// spread over several microtask drains
			if (i % 30 === 0) await settle();
		}
		await settle();
		env.init();

		const [ack] = env.messages("ack");
		expect(ack.dropped).toBe(50);
		const entries = env.entries();
		expect(entries.map((e) => e.seq)).toEqual(
			Array.from({ length: 100 }, (_, i) => i + 51)
		);
		expect(entries[0].text).toBe("line 51");
		for (const message of env.messages("entries")) {
			expect(message.entries.length).toBeGreaterThan(0);
			expect(message.entries.length).toBeLessThanOrEqual(50);
			expect(message.dropped).toBe(0);
		}
	});

	it("caps a synchronous burst too, counting what was evicted", async () => {
		const env = make_host();
		install(env.host);
		for (let i = 1; i <= 1000; i++) env.host.console.log(i);
		await settle();
		env.init();
		expect(env.messages("ack")[0].dropped).toBe(900);
		expect(env.entries().map((e) => e.seq)).toEqual(
			Array.from({ length: 100 }, (_, i) => i + 901)
		);
	});
});

describe("console forwarding: init, ack and entries", () => {
	it("acks a valid init, flushes the buffer, then batches new entries", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(1_000);
		const env = make_host();
		const forwarder = install(env.host, "6.0.0")!;

		env.host.console.log("first");
		vi.setSystemTime(2_000);
		env.host.console.warn("second", { n: 2 });
		vi.setSystemTime(3_000);
		await settle();

		env.init();
		expect(env.posted).toHaveLength(2);
		expect(env.posted.every((p) => p.origin === HUB)).toBe(true);

		expect(env.posted[0].message).toEqual({
			protocol: "gradio-console",
			version: 1,
			type: "ack",
			session_id: forwarder.session_id,
			gradio_version: "6.0.0",
			dropped: 0
		});
		expect(env.posted[1].message).toEqual({
			protocol: "gradio-console",
			version: 1,
			type: "entries",
			session_id: forwarder.session_id,
			dropped: 0,
			entries: [
				{ seq: 1, ts: 1_000, level: "log", text: "first" },
				{ seq: 2, ts: 2_000, level: "warn", text: 'second {"n":2}' }
			]
		});

		env.host.console.error("third");
		await settle();
		expect(env.posted).toHaveLength(2);
		vi.advanceTimersByTime(249);
		expect(env.posted).toHaveLength(2);
		vi.advanceTimersByTime(1);
		expect(env.posted).toHaveLength(3);
		expect(env.posted[2].message.entries).toEqual([
			{ seq: 3, ts: 3_000, level: "error", text: "third" }
		]);

		for (let i = 0; i < 50; i++) env.host.console.debug(i);
		await settle();
		expect(env.posted).toHaveLength(4);
		expect(env.posted[3].message.entries).toHaveLength(50);
		expect(env.posted[3].message.entries[0].seq).toBe(4);
		vi.advanceTimersByTime(1_000);
		expect(env.posted).toHaveLength(4);
	});

	it("a repeated init re-acks and only sends entries not yet sent", async () => {
		vi.useFakeTimers();
		const env = make_host();
		const forwarder = install(env.host)!;
		env.host.console.log("a");
		await settle();

		env.init();
		env.init();
		expect(env.messages("ack")).toHaveLength(2);
		expect(env.entries().map((e) => e.text)).toEqual(["a"]);

		env.host.console.log("b");
		await settle();
		env.init();
		expect(env.messages("ack")).toHaveLength(3);
		expect(env.entries().map((e) => e.text)).toEqual(["a", "b"]);
		vi.advanceTimersByTime(1_000);
		expect(env.entries().map((e) => e.text)).toEqual(["a", "b"]);

		const acks = env.messages("ack");
		expect(new Set(acks.map((a) => a.session_id))).toEqual(
			new Set([forwarder.session_id])
		);
	});

	it("reports evictions since the previous message in the next entries message", async () => {
		const env = make_host();
		install(env.host);
		env.init();
		for (let i = 1; i <= 130; i++) env.host.console.log(i);
		await settle();
		const messages = env.messages("entries");
		const dropped = messages.reduce((sum, m) => sum + m.dropped, 0);
		const seqs = env.entries().map((e) => e.seq);
		expect(dropped + seqs.length).toBe(130);
		expect(seqs).toEqual([...seqs].sort((a, b) => a - b));
	});

	it("posts to the exact origin of the latest init", async () => {
		const env = make_host();
		install(env.host);
		env.init({ origin: "http://localhost:5173" });
		env.host.console.log("x");
		env.init({ origin: "http://127.0.0.1:8080" });
		expect(env.posted.map((p) => p.origin)).toEqual([
			"http://localhost:5173",
			"http://127.0.0.1:8080",
			"http://127.0.0.1:8080"
		]);
	});

	it("uses a new random session_id per page load", () => {
		const a = install(make_host().host)!;
		const b = install(make_host().host)!;
		expect(typeof a.session_id).toBe("string");
		expect(a.session_id).not.toBe("");
		expect(a.session_id).not.toBe(b.session_id);
	});

	it("reports an empty gradio_version when it is unknown, and fills it in later", () => {
		const env = make_host();
		const forwarder = install(env.host)!;
		env.init();
		expect(env.messages("ack")[0].gradio_version).toBe("");
		forwarder.set_gradio_version("6.1.0");
		forwarder.set_gradio_version("ignored");
		env.init();
		expect(env.messages("ack")[1].gradio_version).toBe("6.1.0");
	});
});

describe("console forwarding: ignored init", () => {
	it.each([
		"https://evil.example",
		"https://huggingface.co.evil.example",
		"http://huggingface.co",
		"https://localhost:3000",
		"http://localhost.evil.example",
		"http://127.0.0.1.evil.example:80",
		"null",
		""
	])("from a disallowed origin: %s", (origin) => {
		const env = make_host();
		install(env.host);
		env.init({ origin });
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it("from a window that is not the parent", () => {
		const env = make_host();
		install(env.host);
		env.init({ source: { postMessage: vi.fn() } });
		env.init({ source: null });
		env.init({ source: env.host });
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it.each([
		["a string", "init"],
		["the zerogpu string", "supports-zerogpu-headers"],
		["null", null],
		["a number", 42],
		["undefined", undefined],
		["an array", ["init"]],
		["another protocol", { ...INIT, protocol: "something-else" }],
		["no protocol", { version: 1, type: "init" }],
		["an unknown type", { ...INIT, type: "flush" }],
		["a frame-to-parent type", { ...INIT, type: "ack" }],
		["no type", { protocol: CONSOLE_FORWARD_PROTOCOL, version: 1 }]
	])("when the data is %s", (_, data) => {
		const env = make_host();
		install(env.host);
		expect(() => env.init({ data })).not.toThrow();
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it("accepts a higher version and ignores unknown fields", () => {
		const env = make_host();
		install(env.host);
		env.init({ data: { ...INIT, version: 2, extra: { nested: true } } });
		const [ack] = env.messages("ack");
		expect(ack.version).toBe(1);
		expect(ack.type).toBe("ack");
	});

	it("does not throw when the event itself is malformed", () => {
		const env = make_host();
		install(env.host);
		expect(() => env.dispatch("message", null)).not.toThrow();
		expect(() => env.dispatch("message", undefined)).not.toThrow();
		expect(() =>
			env.dispatch("message", {
				get data() {
					throw new Error("no");
				}
			})
		).not.toThrow();
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});
});

describe("console forwarding: origin allowlist", () => {
	it.each([
		[HUB, "user-space.hf.space"],
		[HUB, "localhost"],
		["http://localhost:5173", "user-space.hf.space"],
		["http://localhost", "user-space.hf.space"],
		["http://127.0.0.1:65535", "user-space.hf.space"],
		[
			"https://moon-user.dev.spaces.huggingface.tech",
			"space.user.dev.example.hf.space"
		]
	])("allows %s for a frame on %s", (origin, hostname) => {
		expect(is_console_forward_origin_allowed(origin, hostname)).toBe(true);
	});

	it.each([
		["https://moon-user.dev.spaces.huggingface.tech", "user-space.hf.space"],
		["https://moon-other.dev.spaces.huggingface.tech", "x.user.dev.hf.space"],
		["https://hf.co", "user-space.hf.space"],
		["https://huggingface.co:443", "user-space.hf.space"],
		["https://huggingface.co/", "user-space.hf.space"]
	])("rejects %s for a frame on %s", (origin, hostname) => {
		expect(is_console_forward_origin_allowed(origin, hostname)).toBe(false);
	});

	it("acks the dev hub origin for a .dev. frame", () => {
		const env = make_host({ hostname: "space.user.dev.example.hf.space" });
		install(env.host);
		env.init({ origin: "https://moon-user.dev.spaces.huggingface.tech" });
		expect(env.messages("ack")).toHaveLength(1);
	});
});

describe("console forwarding: serialization", () => {
	it("joins arguments with a space and uses String() for primitives", () => {
		expect(
			serialize_console_args([
				"str",
				1.5,
				true,
				null,
				undefined,
				10n,
				Symbol("s"),
				NaN
			])
		).toEqual({ text: "str 1.5 true null undefined 10 Symbol(s) NaN" });
	});

	it("serializes objects and arrays as JSON", () => {
		expect(
			serialize_console_args([{ a: [1, "x", null], b: { c: true } }])
		).toEqual({ text: '{"a":[1,"x",null],"b":{"c":true}}' });
		expect(serialize_console_args([new Date(0)]).text).toBe(
			'"1970-01-01T00:00:00.000Z"'
		);
	});

	it("marks cycles as [Circular] but repeats shared references", () => {
		const a: any = { name: "a" };
		a.self = a;
		a.list = [a];
		expect(serialize_console_args([a]).text).toBe(
			'{"name":"a","self":"[Circular]","list":["[Circular]"]}'
		);
		const shared = { s: 1 };
		expect(serialize_console_args([{ x: shared, y: shared }]).text).toBe(
			'{"x":{"s":1},"y":{"s":1}}'
		);
	});

	it("replaces values deeper than 4 with [Object] or [Array]", () => {
		const deep = { l1: { l2: { l3: { l4: { l5: { l6: 1 } } } } } };
		expect(serialize_console_args([deep]).text).toBe(
			'{"l1":{"l2":{"l3":{"l4":{"l5":"[Object]"}}}}}'
		);
		expect(serialize_console_args([[[[[[[1]]]]]]]).text).toBe(
			'[[[[["[Array]"]]]]]'
		);
	});

	it("formats an Error as name: message and returns the first Error's stack", () => {
		const first = new TypeError("bad thing");
		const second = new RangeError("other");
		const result = serialize_console_args(["failed:", first, second]);
		expect(result.text).toBe("failed: TypeError: bad thing RangeError: other");
		expect(result.stack).toBe(first.stack);
		expect(result.stack).toContain("bad thing");
	});

	it("formats nested Errors without their stack", () => {
		const result = serialize_console_args([{ error: new Error("inner") }]);
		expect(result).toEqual({ text: '{"error":"Error: inner"}' });
	});

	it("formats functions as [Function name]", () => {
		function named_fn(): void {}
		expect(
			serialize_console_args([named_fn, () => {}, { cb: named_fn }]).text
		).toBe(
			'[Function named_fn] [Function anonymous] {"cb":"[Function named_fn]"}'
		);
	});

	it.skipIf(!has_dom)("formats DOM nodes as <tag#id.classes>", () => {
		const div = document.createElement("div");
		div.id = "main";
		div.className = "a  b";
		const span = document.createElement("span");
		const text = document.createTextNode("hi");
		expect(serialize_console_args([div, span, text, { el: div }]).text).toBe(
			'<div#main.a.b> <span> <#text> {"el":"<div#main.a.b>"}'
		);
	});

	it("uses [Unserializable] for values that throw or can't be read", () => {
		const getter_throws = {
			ok: 1,
			get bad() {
				throw new Error("nope");
			}
		};
		expect(serialize_console_args([getter_throws]).text).toBe(
			'{"ok":1,"bad":"[Unserializable]"}'
		);

		const keys_throw = new Proxy(
			{},
			{
				ownKeys() {
					throw new Error("no keys");
				}
			}
		);
		expect(serialize_console_args(["x", keys_throw]).text).toBe(
			"x [Unserializable]"
		);

		const to_json_throws = {
			toJSON() {
				throw new Error("no json");
			}
		};
		expect(serialize_console_args([to_json_throws]).text).toBe(
			"[Unserializable]"
		);

		const error_with_bad_name = new Error("m");
		Object.defineProperty(error_with_bad_name, "name", {
			get() {
				throw new Error("no name");
			}
		});
		expect(serialize_console_args([error_with_bad_name]).text).toBe(
			"[Unserializable]"
		);
	});

	it("cuts text and stack to 4096 chars, ending with …[truncated]", () => {
		const result = serialize_console_args(["x".repeat(5000)]);
		expect(result.text).toHaveLength(4096);
		expect(result.text.endsWith("…[truncated]")).toBe(true);

		const error = new Error("e");
		error.stack = "s".repeat(5000);
		expect(serialize_console_args([error]).stack!.length).toBe(4096);

		expect(serialize_console_args(["y".repeat(4096)]).text).toBe(
			"y".repeat(4096)
		);
	});

	it("bounds the work done for huge values", () => {
		const big = Array.from({ length: 10_000 }, (_, i) => ({ i }));
		const text = serialize_console_args([big]).text;
		expect(text.length).toBeLessThanOrEqual(4096);
		expect(text.startsWith('[{"i":0},{"i":1}')).toBe(true);
	});
});

describe("console forwarding: re-entry guard", () => {
	it("a console call made while serializing reaches the original but is not captured", async () => {
		const env = make_host();
		install(env.host);
		const sneaky = {
			get value() {
				env.host.console.log("from getter");
				return 1;
			}
		};
		env.host.console.log("outer", sneaky);
		await settle();
		env.init();
		await settle();

		expect(env.calls.map((c) => c.args[0])).toEqual(["outer", "from getter"]);
		expect(env.entries().map((e) => e.text)).toEqual(['outer {"value":1}']);
	});

	it("a console call made while posting doesn't loop", async () => {
		const env = make_host();
		install(env.host);
		env.parent.postMessage.mockImplementation((message: any, origin) => {
			env.posted.push({ message, origin });
			env.host.console.log("logged by postMessage");
		});
		env.host.console.log("a");
		await settle();
		env.init();
		await settle();
		expect(env.messages("entries")).toHaveLength(1);
		expect(env.entries().map((e) => e.text)).toEqual(["a"]);
	});

	it("never throws into the app when postMessage throws", async () => {
		vi.useFakeTimers();
		const env = make_host();
		install(env.host);
		env.parent.postMessage.mockImplementation(() => {
			throw new Error("post failed");
		});
		expect(() => env.init()).not.toThrow();
		expect(() => env.host.console.log("x")).not.toThrow();
		await settle();
		expect(() => vi.advanceTimersByTime(1_000)).not.toThrow();
	});
});

describe("console forwarding: errors and rejections", () => {
	function error_event(fields: Record<string, unknown>) {
		return { preventDefault: vi.fn(), ...fields };
	}

	it("captures window errors as exception entries without preventDefault", async () => {
		const env = make_host();
		install(env.host);
		const error = new Error("boom");
		const event = error_event({ error, message: "Uncaught Error: boom" });
		const results = env.dispatch("error", event);
		const no_error_object = error_event({
			message: "Script error.",
			filename: "https://x.hf.space/app.js",
			lineno: 3,
			colno: 7
		});
		env.dispatch("error", no_error_object);
		const thrown_string = error_event({ error: "just a string" });
		env.dispatch("error", thrown_string);
		await settle();
		env.init();

		expect(results.every((r) => !r)).toBe(true);
		for (const e of [event, no_error_object, thrown_string]) {
			expect(e.preventDefault).not.toHaveBeenCalled();
		}
		expect(env.entries()).toMatchObject([
			{ level: "exception", text: "Error: boom", stack: error.stack },
			{
				level: "exception",
				text: "Script error. (https://x.hf.space/app.js:3:7)"
			},
			{ level: "exception", text: "just a string" }
		]);
	});

	it("captures unhandled rejections without preventDefault", async () => {
		const env = make_host();
		install(env.host);
		const reason = new TypeError("rejected");
		const event = error_event({ reason });
		const plain = error_event({ reason: { code: 42 } });
		env.dispatch("unhandledrejection", event);
		env.dispatch("unhandledrejection", plain);
		await settle();
		env.init();

		expect(event.preventDefault).not.toHaveBeenCalled();
		expect(plain.preventDefault).not.toHaveBeenCalled();
		expect(env.entries()).toMatchObject([
			{ level: "rejection", text: "TypeError: rejected", stack: reason.stack },
			{ level: "rejection", text: '{"code":42}' }
		]);
	});

	it("leaves an existing onerror handler in place", () => {
		const env = make_host();
		const existing = env.host.onerror;
		install(env.host);
		expect(env.host.onerror).toBe(existing);
	});

	it.skipIf(typeof ErrorEvent === "undefined")(
		"does not mark a real ErrorEvent as handled",
		() => {
			const env = make_host();
			install(env.host);
			const event = new ErrorEvent("error", {
				error: new Error("real"),
				message: "real",
				cancelable: true
			});
			env.dispatch("error", event);
			expect(event.defaultPrevented).toBe(false);
		}
	);
});

describe("console forwarding: page-level initialisation", () => {
	const KEY = Symbol.for("gradio.console_forward");

	function clear(): void {
		if (typeof window === "undefined") return;
		const store = window as any;
		store[KEY]?.uninstall();
		delete store[KEY];
	}

	afterEach(clear);

	it("installs at most once per page", () => {
		clear();
		const first = initialize_console_forwarding({ gradio_version: "1" });
		const second = initialize_console_forwarding({ gradio_version: "2" });
		expect(second).toBe(first);
		if (typeof window === "undefined") {
			expect(first).toBeNull();
		} else if (window.parent === window) {
			expect(first).toBeNull();
		} else {
			// vitest browser mode runs tests in an iframe
			expect(first).not.toBeNull();
		}
	});

	it.skipIf(typeof window === "undefined")(
		"only initialises for an app on this page's origin",
		() => {
			clear();
			initialize_console_forwarding_for_app("user/space");
			initialize_console_forwarding_for_app("https://other.example/");
			initialize_console_forwarding_for_app(undefined);
			expect(KEY in window).toBe(false);

			initialize_console_forwarding_for_app(window.location.origin + "/app/");
			expect(KEY in window).toBe(true);
		}
	);
});

describe("existing message listeners ignore a gradio-console init", () => {
	it.skipIf(typeof window === "undefined")(
		"the ZeroGPU handshake listener",
		() => {
			initialize_zerogpu_handshake();
			delete window.supports_zerogpu_headers;

			window.dispatchEvent(new MessageEvent("message", { data: INIT }));
			window.dispatchEvent(
				new MessageEvent("message", {
					data: { ...INIT, version: 2, extra: "x" }
				})
			);
			expect(window.supports_zerogpu_headers).toBeUndefined();

			window.dispatchEvent(
				new MessageEvent("message", { data: "supports-zerogpu-headers" })
			);
			expect(window.supports_zerogpu_headers).toBe(true);
			delete window.supports_zerogpu_headers;
		}
	);
});
