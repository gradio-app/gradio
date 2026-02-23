import type { Handle } from "@sveltejs/kit";
import { readFileSync } from "fs";
import { resolve as pathResolve } from "path";

const LLM_USER_AGENTS = [
	"GPTBot",
	"ChatGPT-User",
	"Claude-Web",
	"Anthropic",
	"CCBot",
	"Google-Extended",
	"PerplexityBot",
	"Bytespider",
	"Amazonbot",
	"cohere-ai",
	"FacebookBot",
	"Google-InspectionTool",
	"Applebot-Extended"
];

function isLLMUserAgent(userAgent: string | null): boolean {
	if (!userAgent) return false;

	return LLM_USER_AGENTS.some((bot) => userAgent.includes(bot));
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
	const userAgent = event.request.headers.get("user-agent");

	const pathname = event.url.pathname;

	if (isLLMUserAgent(userAgent)) {
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
