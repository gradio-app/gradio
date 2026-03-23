import type { Handle } from "@sveltejs/kit";
import { readFileSync } from "fs";
import { resolve as pathResolve } from "path";

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

export function isLLMRequest(req: Request): boolean {
	const ua = req.headers.get("user-agent") || "";
	const accept = req.headers.get("accept") || "";

	if (accept.includes("text/markdown")) {
		return true;
	}

	return AI_UA_PATTERNS.some((re) => re.test(ua));
}

function parseDocsPath(
	pathname: string
): { version: string | null; doc: string } | null {
	const match = pathname.match(
		/^\/(?:([^/]+)\/)?docs\/gradio\/([a-z_-]+)\/?$/i
	);

	if (match) {
		const version = match[1] || null;
		const doc = match[2];

		if (version && !version.match(/^(\d+\.\d+\.\d+|main)$/)) {
			return null;
		}

		return { version, doc };
	}

	return null;
}

function parseGuidePath(
	pathname: string
): { version: string | null; guide: string } | null {
	const match = pathname.match(/^\/(?:([^/]+)\/)?guides\/([a-z0-9_-]+)\/?$/i);

	if (match) {
		const version = match[1] || null;
		const guide = match[2];

		if (version && !version.match(/^(\d+\.\d+\.\d+|main)$/)) {
			return null;
		}

		return { version, guide };
	}

	return null;
}

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	if (isLLMRequest(event.request)) {
		const docsParams = parseDocsPath(pathname);

		if (docsParams) {
			try {
				const { svxToMarkdown } = await import("$lib/utils/svx-to-markdown");

				const docsJson = await import("$lib/templates/docs.json");
				const pages = docsJson.pages;

				let svxPath: string | null = null;
				for (const category of pages.gradio) {
					for (const page of category.pages) {
						if (page.name === docsParams.doc) {
							svxPath = page.path;
							break;
						}
					}
					if (svxPath) break;
				}

				if (svxPath) {
					const fullPath = pathResolve(
						process.cwd(),
						"src/lib/templates",
						svxPath
					);
					const svxContent = readFileSync(fullPath, "utf-8");

					const markdown = await svxToMarkdown(svxContent, docsParams.doc);

					return new Response(markdown, {
						status: 200,
						headers: {
							"Content-Type": "text/markdown; charset=utf-8",
							"X-Robots-Tag": "noindex"
						}
					});
				}
			} catch (error) {
				console.error("Error generating markdown for LLM:", error);
			}
		}

		const guideParams = parseGuidePath(pathname);

		if (guideParams) {
			try {
				const guideModule = await import(
					`$lib/json/guides/${guideParams.guide}.json`
				);
				const guideData = guideModule.default || guideModule;

				const markdown = guideData.guide?.content;

				if (markdown) {
					return new Response(markdown, {
						status: 200,
						headers: {
							"Content-Type": "text/markdown; charset=utf-8",
							"X-Robots-Tag": "noindex"
						}
					});
				}
			} catch (error) {
				console.error("Error serving guide markdown for LLM:", error);
			}
		}
	}
	return resolve(event);
};
