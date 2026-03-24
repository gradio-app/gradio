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

const MARKDOWN_HEADERS = {
	"Content-Type": "text/markdown; charset=utf-8",
	"X-Robots-Tag": "noindex"
};

export async function serveDocMarkdown(context: any): Promise<Response> {
	const { request, params, next } = context;
	if (!isLLMRequest(request)) return next();

	const origin = new URL(request.url).origin;
	try {
		const res = await fetch(`${origin}/api/markdown/${params.doc}`);
		if (res.ok) {
			const data: any = await res.json();
			if (data.markdown) {
				return new Response(data.markdown, { headers: MARKDOWN_HEADERS });
			}
		}
	} catch {}
	return next();
}

export async function serveGuideMarkdown(context: any): Promise<Response> {
	const { request, params, next } = context;
	if (!isLLMRequest(request)) return next();

	const origin = new URL(request.url).origin;
	try {
		const res = await fetch(`${origin}/api/markdown/guide/${params.guide}`);
		if (res.ok) {
			const data: any = await res.json();
			if (data.markdown) {
				return new Response(data.markdown, { headers: MARKDOWN_HEADERS });
			}
		}
	} catch {}
	return next();
}
