import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { is_streamable_text_task, stream_text_generation } from "./inference-stream";

/**
 * Build a mock `Response` whose `body.getReader()` yields the given UTF-8
 * chunks in order. The router endpoint streams SSE frames, so test inputs
 * are formatted like `data: {...}\n\n`.
 */
function sseResponse(chunks: string[]): Response {
	const encoder = new TextEncoder();
	let i = 0;
	const reader = {
		async read() {
			if (i >= chunks.length) return { value: undefined, done: true };
			const value = encoder.encode(chunks[i++]);
			return { value, done: false };
		},
		releaseLock() {
			// noop
		}
	};
	return {
		ok: true,
		status: 200,
		body: { getReader: () => reader } as unknown as ReadableStream,
		text: async () => ""
	} as unknown as Response;
}

const origFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = origFetch;
});

describe("is_streamable_text_task", () => {
	test("accepts known text-generation tags", () => {
		expect(is_streamable_text_task("text-generation")).toBe(true);
		expect(is_streamable_text_task("text2text-generation")).toBe(true);
		expect(is_streamable_text_task("conversational")).toBe(true);
	});

	test("rejects other modalities", () => {
		expect(is_streamable_text_task("text-to-image")).toBe(false);
		expect(is_streamable_text_task("automatic-speech-recognition")).toBe(false);
		expect(is_streamable_text_task("summarization")).toBe(false);
	});

	test("rejects empty / undefined", () => {
		expect(is_streamable_text_task(undefined)).toBe(false);
		expect(is_streamable_text_task("")).toBe(false);
	});
});

describe("stream_text_generation — request", () => {
	beforeEach(() => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(sseResponse(["data: [DONE]\n"]));
	});

	test("hits the HF unified router endpoint", async () => {
		await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			onChunk: () => {}
		});
		const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(call[0]).toBe("https://router.huggingface.co/v1/chat/completions");
		expect(call[1].method).toBe("POST");
	});

	test("sends the Authorization header when hfToken is provided", async () => {
		await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			hfToken: "hf_secret",
			onChunk: () => {}
		});
		const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(call[1].headers.Authorization).toBe("Bearer hf_secret");
	});

	test("omits Authorization header when no token", async () => {
		await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			onChunk: () => {}
		});
		const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(call[1].headers.Authorization).toBeUndefined();
	});

	test("sends model unqualified when provider is undefined or 'auto'", async () => {
		await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			provider: "auto",
			onChunk: () => {}
		});
		const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(JSON.parse(call[1].body).model).toBe("user/m");
	});

	test("appends provider suffix when set to a specific provider", async () => {
		await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			provider: "together",
			onChunk: () => {}
		});
		const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(JSON.parse(call[1].body).model).toBe("user/m:together");
	});

	test("requests streaming with max_tokens", async () => {
		await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			maxTokens: 100,
			onChunk: () => {}
		});
		const body = JSON.parse(
			(globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
		);
		expect(body.stream).toBe(true);
		expect(body.max_tokens).toBe(100);
		expect(body.messages).toEqual([{ role: "user", content: "hi" }]);
	});
});

describe("stream_text_generation — SSE parsing", () => {
	test("accumulates content deltas across frames", async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(
				sseResponse([
					'data: {"choices":[{"delta":{"content":"Hel"}}]}\n',
					'data: {"choices":[{"delta":{"content":"lo "}}]}\n',
					'data: {"choices":[{"delta":{"content":"world"}}]}\n',
					"data: [DONE]\n"
				])
			);
		const seen: string[] = [];
		const final = await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			onChunk: (_delta, accumulated) => seen.push(accumulated)
		});
		expect(seen).toEqual(["Hel", "Hello ", "Hello world"]);
		expect(final).toBe("Hello world");
	});

	test("each onChunk call also receives the new delta", async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(
				sseResponse([
					'data: {"choices":[{"delta":{"content":"A"}}]}\n',
					'data: {"choices":[{"delta":{"content":"B"}}]}\n',
					"data: [DONE]\n"
				])
			);
		const deltas: string[] = [];
		await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			onChunk: (delta) => deltas.push(delta)
		});
		expect(deltas).toEqual(["A", "B"]);
	});

	test("ignores frames with no content delta", async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(
				sseResponse([
					'data: {"choices":[{"delta":{}}]}\n',
					'data: {"choices":[{"delta":{"content":"only this"}}]}\n',
					"data: [DONE]\n"
				])
			);
		const onChunk = vi.fn();
		const final = await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			onChunk
		});
		expect(onChunk).toHaveBeenCalledTimes(1);
		expect(final).toBe("only this");
	});

	test("skips malformed JSON frames without aborting", async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(
				sseResponse([
					'data: {"choices":[{"delta":{"content":"good"}}]}\n',
					"data: {not json\n",
					'data: {"choices":[{"delta":{"content":"!"}}]}\n',
					"data: [DONE]\n"
				])
			);
		const final = await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			onChunk: () => {}
		});
		expect(final).toBe("good!");
	});

	test("handles content split across reader chunks (partial line buffer)", async () => {
		// Single SSE frame arrives as two TCP chunks — the parser must
		// hold the partial line until the newline arrives.
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(
				sseResponse([
					'data: {"choices":[{"delta":{"con',
					'tent":"split"}}]}\n',
					"data: [DONE]\n"
				])
			);
		const final = await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			onChunk: () => {}
		});
		expect(final).toBe("split");
	});

	test("returns immediately on [DONE] without emitting", async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(sseResponse(["data: [DONE]\n"]));
		const onChunk = vi.fn();
		const final = await stream_text_generation({
			modelId: "user/m",
			prompt: "hi",
			onChunk
		});
		expect(onChunk).not.toHaveBeenCalled();
		expect(final).toBe("");
	});
});

describe("stream_text_generation — errors", () => {
	test("throws when the router returns a non-OK status", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			body: null,
			text: async () => "Not Found"
		} as unknown as Response);
		await expect(
			stream_text_generation({
				modelId: "user/m",
				prompt: "hi",
				onChunk: () => {}
			})
		).rejects.toThrow(/404/);
	});

	test("throws when the response has no body", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			body: null,
			text: async () => ""
		} as unknown as Response);
		await expect(
			stream_text_generation({
				modelId: "user/m",
				prompt: "hi",
				onChunk: () => {}
			})
		).rejects.toThrow();
	});
});
