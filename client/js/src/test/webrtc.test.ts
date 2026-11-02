import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const zerogpu_headers = vi.hoisted(() => ({
	value: null as Record<string, string> | null,
	// Whether the page that embeds the Space never answers
	no_reply: false,
	on_request: (() => {}) as () => void
}));

vi.mock("../helpers/zerogpu", async (importOriginal) => ({
	...(await importOriginal<typeof import("../helpers/zerogpu")>()),
	get_zerogpu_headers: () => {
		zerogpu_headers.on_request();
		return zerogpu_headers.no_reply
			? new Promise(() => {})
			: Promise.resolve(zerogpu_headers.value);
	}
}));

import { Client } from "../client";

function fake_client(token?: `hf_${string}`): {
	client: Client;
	requests: { url: string; init: RequestInit }[];
} {
	const requests: { url: string; init: RequestInit }[] = [];
	const client = {
		config: { root: "https://example.hf.space", components: [] },
		options: { token },
		session_hash: "abc",
		api_prefix: "/gradio_api",
		post_webrtc: (Client.prototype as any).post_webrtc,
		fetch: (url: string, init: RequestInit) => {
			requests.push({ url, init });
			return Promise.resolve(
				new Response(JSON.stringify({ type: "answer" }), { status: 200 })
			);
		}
	} as unknown as Client;
	return { client, requests };
}

describe("WebRTC signalling", () => {
	beforeEach(() => {
		zerogpu_headers.value = null;
		zerogpu_headers.no_reply = false;
		zerogpu_headers.on_request = () => {};
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("sends the offer with the session and the visitor's ZeroGPU headers, so that the handler's GPU work is attributed to the visitor", async () => {
		zerogpu_headers.value = { "X-ZeroGPU-Token": "jwt" };
		const { client, requests } = fake_client();

		const answer = await Client.prototype.webrtc_offer.call(client, {
			sdp: "v=0",
			type: "offer",
			webrtc_id: "one"
		});

		expect(answer).toEqual({ type: "answer" });
		expect(requests[0].url).toBe(
			"https://example.hf.space/gradio_api/webrtc/offer"
		);
		expect(JSON.parse(requests[0].init.body as string)).toEqual({
			sdp: "v=0",
			type: "offer",
			webrtc_id: "one",
			session_hash: "abc"
		});
		expect(requests[0].init.headers).toEqual({
			"X-ZeroGPU-Token": "jwt",
			"Content-Type": "application/json"
		});
	});

	it("does not ask for ZeroGPU headers for an ICE candidate", async () => {
		const asked = vi.fn();
		zerogpu_headers.on_request = asked;
		const { client } = fake_client();

		await Client.prototype.webrtc_offer.call(client, {
			type: "ice-candidate",
			webrtc_id: "one",
			candidate: {}
		});

		expect(asked).not.toHaveBeenCalled();
	});

	it("sends the offer without ZeroGPU headers when the embedding page does not answer", async () => {
		vi.useFakeTimers();
		zerogpu_headers.no_reply = true;
		const { client, requests } = fake_client();

		const call = Client.prototype.webrtc_offer.call(client, {
			sdp: "v=0",
			type: "offer",
			webrtc_id: "one"
		});
		await vi.advanceTimersByTimeAsync(10_000);
		await call;

		expect(requests[0].init.headers).toEqual({
			"Content-Type": "application/json"
		});
	});

	it("asks for the stream's RTC configuration with the session and the token", async () => {
		const { client, requests } = fake_client("hf_token");

		await Client.prototype.webrtc_rtc_configuration.call(client, "one");

		expect(requests[0].url).toBe(
			"https://example.hf.space/gradio_api/webrtc/rtc_configuration"
		);
		expect(JSON.parse(requests[0].init.body as string)).toEqual({
			webrtc_id: "one",
			session_hash: "abc"
		});
		expect(requests[0].init.headers).toEqual({
			"Content-Type": "application/json",
			Authorization: "Bearer hf_token"
		});
	});
});
