import { afterEach, describe, expect, test, vi } from "vitest";
import { createHFAuth, request_embedder_token } from "./hf-auth.svelte";

vi.mock("@gradio/client", () => ({
	get_zerogpu_origin: () => "https://huggingface.co"
}));

const HUB = "https://huggingface.co";
type Win = { supports_zerogpu_headers?: boolean };

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	delete (window as Win).supports_zerogpu_headers;
});

// The browser's window can't be replaced, and `top` can't be redefined, but
// `self` and `parent` can: enough to look embedded.
function embed(handshake = true) {
	(window as Win).supports_zerogpu_headers = handshake;
	const parent = { postMessage: vi.fn() };
	const listeners: ((event: MessageEvent) => void)[] = [];
	Object.defineProperty(window, "self", { value: {}, configurable: true });
	Object.defineProperty(window, "parent", {
		value: parent,
		configurable: true
	});
	vi.spyOn(window, "addEventListener").mockImplementation(((
		_: string,
		fn: (event: MessageEvent) => void
	) => listeners.push(fn)) as typeof window.addEventListener);
	const send = (
		token: string | null,
		{
			exp = Date.now() / 1000 + 600,
			source = parent as unknown,
			origin = HUB,
			probe = false
		} = {}
	): void =>
		listeners.at(-1)?.({
			source,
			origin,
			data: {
				type: probe ? "INFERENCE_JWT_PROBE_RESPONSE" : "INFERENCE_JWT_RESPONSE",
				token,
				exp
			}
		} as unknown as MessageEvent);
	const asked = (): number =>
		parent.postMessage.mock.calls.filter(
			([data]) => data.type === "INFERENCE_JWT_REQUEST"
		).length;
	return { parent, send, asked };
}

describe("request_embedder_token", () => {
	test("doesn't ask a page that never answered the ZeroGPU handshake", async () => {
		const { parent } = embed(false);

		expect(await request_embedder_token()).toBeNull();
		expect(parent.postMessage).not.toHaveBeenCalled();
	});

	test("asks the Hub only, and uses only its answer", async () => {
		const { parent, send } = embed();

		const pending = request_embedder_token();
		send("spoofed", { source: {} });
		send("spoofed", { origin: "https://evil.example" });
		send("hf_jwt_x", { exp: 100 });

		expect(parent.postMessage).toHaveBeenCalledWith(
			{ type: "INFERENCE_JWT_REQUEST" },
			HUB
		);
		expect(await pending).toEqual({ token: "hf_jwt_x", expires: 100_000 });
	});
});

describe("inferenceToken", () => {
	const auth = () => createHFAuth(() => ({}));

	test("reuses a token until it nears expiry", async () => {
		const { send, asked } = embed();
		const a = auth();

		let pending = a.inferenceToken();
		send("hf_old", { exp: Date.now() / 1000 + 10 });
		await pending;
		pending = a.inferenceToken();
		send("hf_new");

		expect(await pending).toBe("hf_new");
		expect(await a.inferenceToken()).toBe("hf_new");
		expect(asked()).toBe(2);
	});

	test("asks once per session after a no, and prefers the signed-in token", async () => {
		const { send, asked } = embed();
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => Response.json({ name: "hmb" }))
		);
		const a = auth();

		const pending = a.inferenceToken();
		send(null);
		expect(await pending).toBe("");
		expect(await a.inferenceToken()).toBe("");

		await a.setPAT("hf_pat");
		localStorage.removeItem("hf_token");
		expect(await a.inferenceToken()).toBe("hf_pat");
		expect(asked()).toBe(1);
	});

	test("uses the load probe's token without asking", async () => {
		const { send, asked } = embed(false);
		const a = auth();

		await a.init();
		send("hf_probe", { probe: true });
		await Promise.resolve();

		expect(a.embedded).toBe(true);
		expect(await a.inferenceToken()).toBe("hf_probe");
		expect(asked()).toBe(0);
	});
});
