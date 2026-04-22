const AI_UA_PATTERNS: RegExp[] = [
	/\bgptbot\b/i,
	/\bchatgpt-user\b/i,
	/\bclaudebot\b/i,
	/\bclaude-web\b/i,
	/\bclaude-user\b/i,
	/\banthropic\b/i,
	/\bperplexitybot\b/i,
	/\bmeta-external(fetcher|agent)\b/i,
	/\bfacebookbot\b/i,
	/\bamazonbot\b/i,
	/\bapplebot\b/i,
	/\bbytespider\b/i,
	/\bccbot\b/i,
	/\bcohere\b/i,
	/\bgoogle-extended\b/i
];

function isLLMRequest(request: Request): boolean {
	const ua = request.headers.get("user-agent") || "";
	const accept = request.headers.get("accept") || "";
	if (accept.includes("text/markdown")) return true;
	return AI_UA_PATTERNS.some((re) => re.test(ua));
}

const DOC_PREFIXES = ["/docs/gradio/", "/main/docs/gradio/"];
const GUIDE_PREFIXES = ["/guides/", "/main/guides/"];

function matchSingleSegment(
	pathname: string,
	prefixes: readonly string[]
): string | null {
	for (const prefix of prefixes) {
		if (pathname.startsWith(prefix)) {
			const rest = pathname.slice(prefix.length).replace(/\/$/, "");
			if (rest && !rest.includes("/")) return rest;
		}
	}
	return null;
}

interface Env {
	ASSETS: Fetcher;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === "GET" && isLLMRequest(request)) {
			const url = new URL(request.url);

			const doc = matchSingleSegment(url.pathname, DOC_PREFIXES);
			if (doc) {
				return Response.redirect(`${url.origin}/api/markdown/${doc}`, 302);
			}

			const guide = matchSingleSegment(url.pathname, GUIDE_PREFIXES);
			if (guide) {
				return Response.redirect(
					`${url.origin}/api/markdown/guide/${guide}`,
					302
				);
			}
		}
		return env.ASSETS.fetch(request);
	}
} satisfies ExportedHandler<Env>;
