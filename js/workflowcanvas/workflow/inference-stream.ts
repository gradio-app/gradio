/**
 * Browser-side streaming client for HF Inference text generation.
 *
 * Routes through `https://router.huggingface.co/v1/chat/completions`, HF's
 * OpenAI-compatible unified endpoint. This bypasses our Python `call_model`
 * server function for text-generation specifically so tokens stream into
 * the canvas as they arrive instead of waiting for the full response.
 *
 * Other tasks (image, audio, classification, etc.) still go through the
 * Python path — only text-generation gets the streaming treatment because
 * it's the one task where partial output is meaningful.
 */

const ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";

export interface StreamTextOptions {
	modelId: string;
	prompt: string;
	hfToken?: string;
	provider?: string;
	maxTokens?: number;
	signal?: AbortSignal;
	onChunk: (delta: string, accumulated: string) => void;
}

/**
 * Stream a text-generation response token-by-token. Returns the final
 * accumulated string when the stream ends. `onChunk` fires for each
 * incremental delta with both the new delta and the running accumulator.
 *
 * Throws if the request fails or the stream cannot be opened — the caller
 * is expected to surface the error (toast / node status).
 */
export async function streamTextGeneration(
	opts: StreamTextOptions
): Promise<string> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json"
	};
	if (opts.hfToken) headers["Authorization"] = `Bearer ${opts.hfToken}`;

	const model =
		opts.provider && opts.provider !== "auto"
			? `${opts.modelId}:${opts.provider}`
			: opts.modelId;

	const body = JSON.stringify({
		model,
		messages: [{ role: "user", content: opts.prompt }],
		max_tokens: opts.maxTokens ?? 512,
		stream: true
	});

	const res = await fetch(ROUTER_URL, {
		method: "POST",
		headers,
		body,
		signal: opts.signal
	});

	if (!res.ok || !res.body) {
		const detail = await res.text().catch(() => "");
		throw new Error(
			`HF router ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`
		);
	}

	const reader = res.body.getReader();
	const decoder = new TextDecoder("utf-8");
	let buffer = "";
	let accumulated = "";

	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });

			// SSE frames are separated by blank lines; each `data:` line is a JSON
			// chunk or the literal `[DONE]` sentinel.
			let nl: number;
			while ((nl = buffer.indexOf("\n")) !== -1) {
				const line = buffer.slice(0, nl).trim();
				buffer = buffer.slice(nl + 1);
				if (!line.startsWith("data:")) continue;
				const payload = line.slice(5).trim();
				if (payload === "[DONE]") return accumulated;
				try {
					const chunk = JSON.parse(payload);
					const delta = chunk?.choices?.[0]?.delta?.content ?? "";
					if (delta) {
						accumulated += delta;
						opts.onChunk(delta, accumulated);
					}
				} catch {
					// Malformed frame — skip; the next one usually recovers.
				}
			}
		}
	} finally {
		try { reader.releaseLock(); } catch { /* noop */ }
	}

	return accumulated;
}

/**
 * Pipeline tags eligible for browser-side streaming. Only text-generation
 * variants benefit — image / audio / classification tasks are
 * single-shot in nature, so the streaming router endpoint adds no value
 * and would in fact be incorrect (it's a chat-completions API).
 */
export function isStreamableTextTask(pipelineTag: string | undefined): boolean {
	if (!pipelineTag) return false;
	return (
		pipelineTag === "text-generation" ||
		pipelineTag === "text2text-generation" ||
		pipelineTag === "conversational"
	);
}
