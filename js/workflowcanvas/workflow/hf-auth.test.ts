import { afterEach, describe, expect, test, vi } from "vitest";
import { request_embedder_token } from "./hf-auth.svelte";

type Win = { supports_zerogpu_headers?: boolean };

afterEach(() => {
	vi.restoreAllMocks();
	delete (window as Win).supports_zerogpu_headers;
});

// The browser's window can't be replaced, and `top` can't be redefined, but
// `self` and `parent` can: enough to look embedded.
function embed() {
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
	const send = (source: unknown, token: string, exp: number): void =>
		listeners[0]({
			source,
			data: { type: "INFERENCE_JWT_RESPONSE", token, exp }
		} as unknown as MessageEvent);
	return { parent, send };
}

describe("request_embedder_token", () => {
	test("doesn't ask a page that never answered the ZeroGPU handshake", async () => {
		const { parent } = embed();

		expect(await request_embedder_token()).toBeNull();
		expect(parent.postMessage).not.toHaveBeenCalled();
	});

	test("asks the embedding page and uses only its answer", async () => {
		(window as Win).supports_zerogpu_headers = true;
		const { parent, send } = embed();

		const pending = request_embedder_token();
		send({}, "spoofed", 1);
		send(parent, "hf_jwt_x", 100);

		expect(parent.postMessage).toHaveBeenCalledWith(
			{ type: "INFERENCE_JWT_REQUEST" },
			"*"
		);
		expect(await pending).toEqual({ token: "hf_jwt_x", expires: 100_000 });
	});
});
