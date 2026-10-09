import { describe, it, expect, vi, beforeEach } from "vitest";

const zerogpu_headers = vi.hoisted(() => ({
	value: null as Record<string, string> | null
}));

vi.mock("../helpers/zerogpu", async (importOriginal) => ({
	...(await importOriginal<typeof import("../helpers/zerogpu")>()),
	get_zerogpu_headers: () => Promise.resolve(zerogpu_headers.value)
}));

import { Client } from "../client";

function fake_client(token?: `hf_${string}`): {
	client: Client;
	requests: RequestInit[];
} {
	const requests: RequestInit[] = [];
	const client = {
		config: { root: "https://example.hf.space", components: [] },
		options: { token },
		session_hash: "abc",
		api_prefix: "/gradio_api",
		fetch: (_url: string, init: RequestInit) => {
			requests.push(init);
			return Promise.resolve(
				new Response(JSON.stringify({ ok: true }), { status: 200 })
			);
		}
	} as unknown as Client;
	return { client, requests };
}

describe("component_server", () => {
	beforeEach(() => {
		zerogpu_headers.value = null;
	});

	it("sends the visitor's ZeroGPU headers, so that GPU work started by a server function is attributed to the visitor", async () => {
		zerogpu_headers.value = {
			"X-ZeroGPU-Token": "jwt",
			"X-ZeroGPU-UUID": "uuid"
		};
		const { client, requests } = fake_client();

		await Client.prototype.component_server.call(client, 1, "offer", {
			sdp: "v=0"
		});

		const headers = requests[0].headers as Record<string, string>;
		expect(headers["X-ZeroGPU-Token"]).toBe("jwt");
		expect(headers["X-ZeroGPU-UUID"]).toBe("uuid");
		expect(headers["Content-Type"]).toBe("application/json");
	});

	it("sends no ZeroGPU headers outside a ZeroGPU iframe", async () => {
		const { client, requests } = fake_client("hf_token");

		await Client.prototype.component_server.call(client, 1, "offer", {});

		expect(requests[0].headers).toEqual({
			Authorization: "Bearer hf_token",
			"Content-Type": "application/json"
		});
	});
});
