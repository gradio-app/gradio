import { afterEach, describe, expect, test, vi } from "vitest";
import { request_embedder_token } from "./hf-auth.svelte";

afterEach(() => vi.unstubAllGlobals());

describe("request_embedder_token", () => {
	test("asks the embedding page and uses the token it sends back", async () => {
		const listeners: ((event: MessageEvent) => void)[] = [];
		const parent = { postMessage: vi.fn() };
		vi.stubGlobal("window", {
			self: {},
			top: parent,
			parent,
			addEventListener: (_: string, fn: (event: MessageEvent) => void) =>
				listeners.push(fn),
			removeEventListener: vi.fn()
		});

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
});
