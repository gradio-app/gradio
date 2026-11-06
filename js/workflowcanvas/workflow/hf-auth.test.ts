import { afterEach, describe, expect, test, vi } from "vitest";
import { request_embedder_token } from "./hf-auth.svelte";

afterEach(() => vi.restoreAllMocks());

describe("request_embedder_token", () => {
	test("asks the embedding page and uses the token it sends back", async () => {
		const listeners: ((event: MessageEvent) => void)[] = [];
		const parent = { postMessage: vi.fn() };
		Object.defineProperty(window, "self", { value: {}, configurable: true });
		Object.defineProperty(window, "parent", {
			value: parent,
			configurable: true
		});
		vi.spyOn(window, "addEventListener").mockImplementation(((
			_: string,
			fn: (event: MessageEvent) => void
		) => listeners.push(fn)) as typeof window.addEventListener);

		const pending = request_embedder_token();
		listeners[0]({
			source: {},
			data: { type: "INFERENCE_JWT_RESPONSE", token: "spoofed", exp: 1 }
		} as unknown as MessageEvent);
		listeners[0]({
			source: parent,
			data: { type: "INFERENCE_JWT_RESPONSE", token: "hf_jwt_x", exp: 100 }
		} as unknown as MessageEvent);

		expect(parent.postMessage).toHaveBeenCalledWith(
			{ type: "INFERENCE_JWT_REQUEST" },
			"*"
		);
		expect(await pending).toEqual({ token: "hf_jwt_x", expires: 100_000 });
	});

	test("a probe only accepts the probe's answer", async () => {
		const listeners: ((event: MessageEvent) => void)[] = [];
		const parent = { postMessage: vi.fn() };
		Object.defineProperty(window, "self", { value: {}, configurable: true });
		Object.defineProperty(window, "parent", {
			value: parent,
			configurable: true
		});
		vi.spyOn(window, "addEventListener").mockImplementation(((
			_: string,
			fn: (event: MessageEvent) => void
		) => listeners.push(fn)) as typeof window.addEventListener);

		const pending = request_embedder_token(true);
		listeners[0]({
			source: parent,
			data: { type: "INFERENCE_JWT_RESPONSE", token: "not_for_probe", exp: 1 }
		} as unknown as MessageEvent);
		listeners[0]({
			source: parent,
			data: {
				type: "INFERENCE_JWT_PROBE_RESPONSE",
				token: "hf_jwt_x",
				exp: 100
			}
		} as unknown as MessageEvent);

		expect(parent.postMessage).toHaveBeenCalledWith(
			{ type: "INFERENCE_JWT_PROBE" },
			"*"
		);
		expect(await pending).toEqual({ token: "hf_jwt_x", expires: 100_000 });
	});
});
