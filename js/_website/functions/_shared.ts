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

export async function serveDocMarkdown(context: any): Promise<Response> {
	const { request, params, next } = context;
	if (!isLLMRequest(request)) return next();

	const url = new URL(request.url);
	return Response.redirect(`${url.origin}/api/markdown/${params.doc}`, 302);
}

export async function serveGuideMarkdown(context: any): Promise<Response> {
	const { request, params, next } = context;
	if (!isLLMRequest(request)) return next();

	const url = new URL(request.url);
	return Response.redirect(
		`${url.origin}/api/markdown/guide/${params.guide}`,
		302
	);
}
