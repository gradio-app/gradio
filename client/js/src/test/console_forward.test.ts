import { describe, it, expect, vi, afterEach } from "vitest";
import {
	CONSOLE_FORWARD_BUFFER_SIZE,
	CONSOLE_FORWARD_IDLE_MS,
	CONSOLE_FORWARD_PROTOCOL,
	initialize_console_forwarding,
	initialize_console_forwarding_for_app,
	initialize_console_forwarding_on_space,
	install_console_forwarding,
	is_console_forward_origin_allowed,
	serialize_console_args,
	stringify_bounded,
	type ConsoleForwardHost,
	type ConsoleForwardOptions,
	type ConsoleForwarder
} from "../helpers/console_forward";
import { initialize_zerogpu_handshake } from "../helpers/zerogpu";

const HUB = "https://huggingface.co";
const GET = { protocol: CONSOLE_FORWARD_PROTOCOL, version: 1, type: "get" };
const LEVELS = ["log", "info", "warn", "error", "debug"] as const;
const in_browser = typeof window !== "undefined";

type Listener = (event: any) => void;

function make_host({
	embedded = true,
	hostname = "user-space.hf.space",
	ready_state = "loading"
}: { embedded?: boolean; hostname?: string; ready_state?: string } = {}) {
	const listeners = new Map<string, Set<Listener>>();
	const posted: { message: any; origin: string }[] = [];
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
		document: { readyState: ready_state },
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

	function get(
		options: { origin?: string; source?: unknown; data?: unknown } = {}
	): void {
		dispatch("message", {
			data: "data" in options ? options.data : GET,
			origin: options.origin ?? HUB,
			source: "source" in options ? options.source : parent
		});
	}

	function last_state(): any {
		return posted.at(-1)?.message;
	}

	function texts(): string[] {
		return last_state().entries.map((e: any) => e.text);
	}

	return {
		host,
		parent,
		posted,
		calls,
		original,
		listeners,
		dispatch,
		get,
		last_state,
		texts
	};
}

let installed: ConsoleForwarder[] = [];

function install(
	host: ReturnType<typeof make_host>["host"],
	options: ConsoleForwardOptions = {}
): ConsoleForwarder | null {
	const forwarder = install_console_forwarding(host, options);
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

	it("listens only through addEventListener and leaves onerror alone", () => {
		const env = make_host();
		const existing = env.host.onerror;
		install(env.host);
		expect([...env.listeners.keys()].sort()).toEqual([
			"error",
			"load",
			"message",
			"unhandledrejection"
		]);
		expect(env.host.onerror).toBe(existing);
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

describe("console forwarding: capture", () => {
	it("calls the original console method first, with the same arguments and this", () => {
		const env = make_host();
		install(env.host);
		const arg = { a: 1 };

		expect(env.host.console.log("hello", arg, 3)).toBe("log-result");
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
	});

	it("still captures when the original throws, and rethrows its error", () => {
		const env = make_host();
		const boom = new Error("original failed");
		env.host.console.error = vi.fn(() => {
			throw boom;
		});
		install(env.host);
		expect(() => env.host.console.error("x")).toThrow(boom);
		env.get();
		expect(env.texts()).toEqual(["x"]);
	});

	it("never posts anything without a get", () => {
		vi.useFakeTimers();
		const env = make_host();
		install(env.host);
		for (let i = 0; i < 120; i++) env.host.console.info(i);
		env.dispatch("error", { error: new Error("e"), preventDefault: vi.fn() });
		env.dispatch("unhandledrejection", {
			reason: "r",
			preventDefault: vi.fn()
		});
		env.dispatch("load", {});
		vi.advanceTimersByTime(60_000);
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it("converts values at the moment of the call", () => {
		const env = make_host();
		install(env.host);
		const o = { x: 1 };
		env.host.console.log("mutate", o);
		o.x = 2;
		env.get();
		expect(env.texts()).toEqual(['mutate {"x":1}']);
	});

	it("records seq from 1 and the time of the call", () => {
		vi.useFakeTimers();
		vi.setSystemTime(1_000);
		const env = make_host();
		install(env.host);
		env.host.console.log("a");
		vi.setSystemTime(2_000);
		env.host.console.debug("b");
		env.get();
		expect(env.last_state().entries).toEqual([
			{ seq: 1, ts: 1_000, level: "log", text: "a" },
			{ seq: 2, ts: 2_000, level: "debug", text: "b" }
		]);
	});

	it("keeps the last 100 entries and counts the evicted ones in dropped", () => {
		const env = make_host();
		install(env.host);
		for (let i = 1; i <= 150; i++) env.host.console.log(`line ${i}`);
		env.get();
		const state = env.last_state();
		expect(state.dropped).toBe(50);
		expect(state.entries).toHaveLength(CONSOLE_FORWARD_BUFFER_SIZE);
		expect(state.entries.map((e: any) => e.seq)).toEqual(
			Array.from({ length: 100 }, (_, i) => i + 51)
		);

		for (let i = 151; i <= 160; i++) env.host.console.log(`line ${i}`);
		env.get();
		expect(env.last_state().dropped).toBe(60);
		expect(env.last_state().entries[0].seq).toBe(61);
	});
});

describe("console forwarding: get and state", () => {
	it("answers a valid get with the whole buffer, sent only to the get's origin", () => {
		const env = make_host();
		const forwarder = install(env.host, { gradio_version: "6.0.0" })!;
		env.host.console.warn("one", { n: 1 });
		env.get({ origin: "http://localhost:5173", data: { ...GET, id: 7 } });

		expect(env.posted).toHaveLength(1);
		expect(env.posted[0].origin).toBe("http://localhost:5173");
		expect(env.posted[0].message).toEqual({
			protocol: "gradio-console",
			version: 1,
			type: "state",
			id: 7,
			session_id: forwarder.session_id,
			gradio_version: "6.0.0",
			dropped: 0,
			entries: [
				{ seq: 1, ts: expect.any(Number), level: "warn", text: 'one {"n":1}' }
			]
		});
	});

	it("answers every get with a snapshot and does not clear the buffer", () => {
		const env = make_host();
		install(env.host);
		env.host.console.log("a");
		env.get({ data: { ...GET, id: "first" } });
		env.host.console.log("b");
		env.get();
		env.get();

		expect(env.posted).toHaveLength(3);
		expect(env.posted[0].message.id).toBe("first");
		expect("id" in env.posted[1].message).toBe(false);
		expect(env.posted[0].message.entries.map((e: any) => e.text)).toEqual([
			"a"
		]);
		expect(env.posted[2].message.entries.map((e: any) => e.text)).toEqual([
			"a",
			"b"
		]);
	});

	it("copies only a string or number id", () => {
		const env = make_host();
		install(env.host);
		env.get({ data: { ...GET, id: { nested: true } } });
		expect("id" in env.last_state()).toBe(false);
	});

	it("uses a new random session_id per page load", () => {
		const a = install(make_host().host)!;
		const b = install(make_host().host)!;
		expect(a.session_id).not.toBe("");
		expect(a.session_id).not.toBe(b.session_id);
	});

	it("reports an empty gradio_version when it is unknown, and fills it in later", () => {
		const env = make_host();
		const forwarder = install(env.host)!;
		env.get();
		expect(env.last_state().gradio_version).toBe("");
		forwarder.configure({ gradio_version: "6.1.0" });
		forwarder.configure({ gradio_version: "ignored" });
		env.get();
		expect(env.last_state().gradio_version).toBe("6.1.0");
	});

	it("accepts a higher version and ignores unknown fields", () => {
		const env = make_host();
		install(env.host);
		env.get({ data: { ...GET, version: 2, extra: { nested: true } } });
		expect(env.last_state()).toMatchObject({ version: 1, type: "state" });
	});
});

describe("console forwarding: ignored messages", () => {
	it.each([
		"https://evil.example",
		"https://huggingface.co.evil.example",
		"http://huggingface.co",
		"https://localhost:3000",
		"http://localhost.evil.example",
		"http://127.0.0.1.evil.example:80",
		"null",
		""
	])("a get from a disallowed origin: %s", (origin) => {
		const env = make_host();
		install(env.host);
		env.get({ origin });
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it("a get from a window that is not the parent", () => {
		const env = make_host();
		install(env.host);
		env.get({ source: { postMessage: vi.fn() } });
		env.get({ source: null });
		env.get({ source: env.host });
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it.each([
		["a string", "get"],
		["the zerogpu string", "supports-zerogpu-headers"],
		["null", null],
		["a number", 42],
		["undefined", undefined],
		["an array", ["get"]],
		["another protocol", { ...GET, protocol: "trackio-view" }],
		["no protocol", { version: 1, type: "get" }],
		["the superseded init", { ...GET, type: "init" }],
		["a frame-to-parent type", { ...GET, type: "state" }],
		["no type", { protocol: CONSOLE_FORWARD_PROTOCOL, version: 1 }]
	])("%s", (_, data) => {
		const env = make_host();
		install(env.host);
		expect(() => env.get({ data })).not.toThrow();
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it("a malformed event does not throw", () => {
		const env = make_host();
		install(env.host);
		expect(() => env.dispatch("message", null)).not.toThrow();
		expect(() =>
			env.dispatch("message", {
				get data() {
					throw new Error("no");
				}
			})
		).not.toThrow();
		expect(env.parent.postMessage).not.toHaveBeenCalled();
	});

	it("a postMessage that throws does not reach the app", () => {
		const env = make_host();
		install(env.host);
		env.parent.postMessage.mockImplementation(() => {
			throw new Error("post failed");
		});
		expect(() => env.get()).not.toThrow();
	});
});

describe("console forwarding: origin allowlist", () => {
	it.each([
		[HUB, "user-space.hf.space"],
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
		["https://huggingface.co/", "user-space.hf.space"]
	])("rejects %s for a frame on %s", (origin, hostname) => {
		expect(is_console_forward_origin_allowed(origin, hostname)).toBe(false);
	});
});

describe("console forwarding: serialization", () => {
	it("follows the v1 rules", () => {
		const cyclic: any = { name: "a" };
		cyclic.self = cyclic;
		function named(): void {}
		expect(
			serialize_console_args([
				"str",
				1.5,
				true,
				null,
				undefined,
				10n,
				Symbol("s"),
				{ a: [1, "x"] },
				cyclic,
				named
			]).text
		).toBe(
			`str 1.5 true null undefined 10 Symbol(s) {"a":[1,"x"]} [object Object] ${String(named)}`
		);
	});

	it("formats an Error as name: message and returns the first Error's stack", () => {
		const first = new TypeError("bad thing");
		const result = serialize_console_args([
			"failed:",
			first,
			new RangeError("other")
		]);
		expect(result.text).toBe("failed: TypeError: bad thing RangeError: other");
		expect(result.stack).toBe(first.stack);
	});

	it("falls back to String, then to [Unserializable]", () => {
		const to_json_throws = {
			toJSON() {
				throw new Error("no json");
			},
			toString() {
				return "custom";
			}
		};
		const both_throw = {
			toJSON() {
				throw new Error("no json");
			},
			toString() {
				throw new Error("no string");
			}
		};
		expect(serialize_console_args([to_json_throws, both_throw]).text).toBe(
			"custom [Unserializable]"
		);
	});

	it("cuts a long array to its first 100 items, also when nested", () => {
		const text = serialize_console_args([
			{ rows: Array.from({ length: 250 }, (_, i) => i) }
		]).text;
		const expected_items = Array.from({ length: 100 }, (_, i) => i).join(",");
		expect(text).toBe(`{"rows":[${expected_items},"…[150 more]"]}`);
	});

	it("does not expand typed arrays, DataView or ArrayBuffer", () => {
		const buffer = new ArrayBuffer(8);
		expect(
			serialize_console_args([
				{
					bytes: new Uint8Array(1_000_000),
					floats: new Float32Array(3),
					view: new DataView(buffer),
					buffer
				}
			]).text
		).toBe(
			'{"bytes":"[Uint8Array length 1000000]","floats":"[Float32Array length 3]","view":"[DataView length 8]","buffer":"[ArrayBuffer length 8]"}'
		);
	});

	it("turns every value after 1000 replacer calls into …", () => {
		const many = Object.fromEntries(
			Array.from({ length: 5_000 }, (_, i) => [`k${i}`, i])
		);
		const json = stringify_bounded(many)!;
		expect(json.startsWith('{"k0":0,"k1":1,')).toBe(true);
		expect(json).toContain('"k998":998,"k999":"…","k1000":"…"');
		expect(json.endsWith('"k4999":"…"}')).toBe(true);

		const zeros = "[" + Array(10).fill(0).join(",") + "]";
		const nested = Array.from({ length: 100 }, () => Array(10).fill(0));
		expect(serialize_console_args([nested]).text).toBe(
			"[" +
				[
					...Array(90).fill(zeros),
					'[0,0,0,0,0,0,0,0,"…","…"]',
					...Array(9).fill('"…"')
				].join(",") +
				"]"
		);
	});

	it("logs a 500k-row array about as fast as the original call", () => {
		const env = make_host();
		install(env.host);
		const rows = Array.from({ length: 500_000 }, (_, i) => ({
			id: i,
			name: `row ${i}`
		}));
		const start = performance.now();
		env.host.console.log(rows);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(50);
		env.get();
		expect(env.texts()[0]).toContain(
			'{"id":99,"name":"row 99"},"…[499900 more]"'
		);
	});

	it("cuts text and stack to 4096 chars", () => {
		expect(serialize_console_args(["x".repeat(5000)]).text).toHaveLength(4096);
		const error = new Error("e");
		error.stack = "s".repeat(5000);
		expect(serialize_console_args([error]).stack).toHaveLength(4096);
	});
});

describe("console forwarding: re-entry guard", () => {
	it("a console call made while converting reaches the original but is not captured", () => {
		const env = make_host();
		install(env.host);
		const sneaky = {
			get value() {
				env.host.console.log("from getter");
				return 1;
			}
		};
		env.host.console.log("outer", sneaky);
		env.get();
		expect(env.calls.map((c) => c.args[0])).toEqual(["outer", "from getter"]);
		expect(env.texts()).toEqual(['outer {"value":1}']);
	});

	it("a console call made while posting doesn't loop", () => {
		const env = make_host();
		install(env.host);
		env.parent.postMessage.mockImplementation((message: any, origin) => {
			env.posted.push({ message, origin });
			env.host.console.log("logged by postMessage");
		});
		env.host.console.log("a");
		env.get();
		expect(env.posted).toHaveLength(1);
		env.get();
		expect(env.texts()).toEqual(["a"]);
	});
});

describe("console forwarding: errors and rejections", () => {
	function error_event(fields: Record<string, unknown>) {
		return { preventDefault: vi.fn(), ...fields };
	}

	it("captures window errors as exception entries without preventDefault", () => {
		const env = make_host();
		install(env.host);
		const error = new Error("boom");
		const events = [
			error_event({ error, message: "Uncaught Error: boom" }),
			error_event({
				message: "Script error.",
				filename: "https://x.hf.space/app.js",
				lineno: 3,
				colno: 7
			}),
			error_event({ error: "just a string" })
		];
		const results = events.flatMap((e) => env.dispatch("error", e));
		env.get();

		expect(results.every((r) => !r)).toBe(true);
		for (const e of events) expect(e.preventDefault).not.toHaveBeenCalled();
		expect(env.last_state().entries).toMatchObject([
			{ level: "exception", text: "Error: boom", stack: error.stack },
			{
				level: "exception",
				text: "Script error. (https://x.hf.space/app.js:3:7)"
			},
			{ level: "exception", text: "just a string" }
		]);
	});

	it("captures unhandled rejections without preventDefault", () => {
		const env = make_host();
		install(env.host);
		const reason = new TypeError("rejected");
		const events = [
			error_event({ reason }),
			error_event({ reason: { code: 42 } })
		];
		events.forEach((e) => env.dispatch("unhandledrejection", e));
		env.get();

		for (const e of events) expect(e.preventDefault).not.toHaveBeenCalled();
		expect(env.last_state().entries).toMatchObject([
			{ level: "rejection", text: "TypeError: rejected", stack: reason.stack },
			{ level: "rejection", text: '{"code":42}' }
		]);
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

describe("console forwarding: idle restore", () => {
	it("gives the console back after the idle time, and a later get takes it again", () => {
		vi.useFakeTimers();
		const env = make_host();
		install(env.host);
		expect(env.host.console.log).not.toBe(env.original.log);
		env.host.console.log("before");
		env.dispatch("load", {});

		vi.advanceTimersByTime(CONSOLE_FORWARD_IDLE_MS - 1);
		expect(env.host.console.log).not.toBe(env.original.log);
		vi.advanceTimersByTime(1);
		for (const level of LEVELS) {
			expect(env.host.console[level]).toBe(env.original[level]);
		}

		env.host.console.log("not captured");
		env.dispatch("error", {
			error: new Error("late"),
			preventDefault: vi.fn()
		});
		env.get();
		expect(env.texts()).toEqual(["before", "Error: late"]);
		expect(env.host.console.log).not.toBe(env.original.log);
		env.host.console.log("again");
		env.get();
		expect(env.texts()).toEqual(["before", "Error: late", "again"]);
	});

	it("starts the idle timer at install when the page has already loaded", () => {
		vi.useFakeTimers();
		const env = make_host({ ready_state: "complete" });
		install(env.host);
		vi.advanceTimersByTime(CONSOLE_FORWARD_IDLE_MS);
		expect(env.host.console.log).toBe(env.original.log);
	});

	it("keeps the console after a valid get", () => {
		vi.useFakeTimers();
		const env = make_host();
		install(env.host);
		env.dispatch("load", {});
		vi.advanceTimersByTime(3_000);
		env.get();
		vi.advanceTimersByTime(CONSOLE_FORWARD_IDLE_MS * 3);
		expect(env.host.console.log).not.toBe(env.original.log);
	});

	it("an ignored get does not cancel the idle restore", () => {
		vi.useFakeTimers();
		const env = make_host();
		install(env.host);
		env.dispatch("load", {});
		env.get({ origin: "https://evil.example" });
		vi.advanceTimersByTime(CONSOLE_FORWARD_IDLE_MS);
		expect(env.host.console.log).toBe(env.original.log);
	});

	it("leaves alone a console method that something else replaced", () => {
		vi.useFakeTimers();
		const env = make_host();
		install(env.host);
		const theirs = vi.fn();
		env.host.console.warn = theirs;
		env.dispatch("load", {});
		vi.advanceTimersByTime(CONSOLE_FORWARD_IDLE_MS);
		expect(env.host.console.warn).toBe(theirs);
		expect(env.host.console.log).toBe(env.original.log);
	});

	it("does not capture twice when another wrapper is chained on top", () => {
		vi.useFakeTimers();
		const env = make_host();
		install(env.host);
		const ours = env.host.console.log;
		const theirs = function (this: unknown, ...args: unknown[]) {
			return ours.apply(this, args);
		};
		env.host.console.log = theirs;
		env.dispatch("load", {});
		vi.advanceTimersByTime(CONSOLE_FORWARD_IDLE_MS);
		expect(env.host.console.log).toBe(theirs);

		env.host.console.log("idle");
		env.get();
		expect(env.host.console.log).toBe(theirs);
		env.host.console.log("after get");
		env.get();

		expect(env.texts()).toEqual(["after get"]);
		expect(env.calls.map((c) => c.args[0])).toEqual(["idle", "after get"]);
	});
});

describe.skipIf(!in_browser)("console forwarding: svelte reactivity", () => {
	it("converts a logged $state value under untrack, so the effect gains no dependency", async () => {
		const { untrack, flushSync } = await import("svelte");
		const { log_state_in_effect } =
			await import("./console_forward_fixture.svelte");
		const env = make_host();
		install(env.host, { untrack });
		const fx = log_state_in_effect((...args) => env.host.console.log(...args));
		expect(fx.runs()).toBe(1);

		fx.state.nested.count = 1;
		flushSync();
		expect(fx.runs()).toBe(1);
		fx.cleanup();

		env.get();
		expect(env.texts()).toEqual(['state {"nested":{"count":0}}']);
	});

	it("without untrack the same log would add the dependency", async () => {
		const { flushSync } = await import("svelte");
		const { log_state_in_effect } =
			await import("./console_forward_fixture.svelte");
		const env = make_host();
		install(env.host);
		const fx = log_state_in_effect((...args) => env.host.console.log(...args));
		fx.state.nested.count = 1;
		flushSync();
		expect(fx.runs()).toBe(2);
		fx.cleanup();
	});
});

describe("console forwarding: page-level initialisation", () => {
	const KEY = Symbol.for("gradio.console_forward");

	function clear(): void {
		if (!in_browser) return;
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
		if (!in_browser || window.parent === window) {
			expect(first).toBeNull();
		} else {
			// vitest browser mode runs tests in an iframe
			expect(first).not.toBeNull();
		}
	});

	it.skipIf(!in_browser)(
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

	it.skipIf(!in_browser)("initialises on import only on a space host", () => {
		clear();
		initialize_console_forwarding_on_space();
		expect(KEY in window).toBe(false);
	});
});

describe("existing message listeners ignore a gradio-console get", () => {
	it.skipIf(!in_browser)("the ZeroGPU handshake listener", () => {
		initialize_zerogpu_handshake();
		delete window.supports_zerogpu_headers;

		window.dispatchEvent(new MessageEvent("message", { data: GET }));
		window.dispatchEvent(
			new MessageEvent("message", { data: { ...GET, version: 2, id: 1 } })
		);
		expect(window.supports_zerogpu_headers).toBeUndefined();

		window.dispatchEvent(
			new MessageEvent("message", { data: "supports-zerogpu-headers" })
		);
		expect(window.supports_zerogpu_headers).toBeUndefined();
	});
});
