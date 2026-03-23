/**
 * Convert HTML tip/warning divs back to their original markdown "Tip: " / "Warning: " format,
 * and replace <gradio-app> embeds with the actual demo source code.
 * Used when serving guide content as markdown (copy page button, content negotiation).
 */
export async function cleanGuideHtml(content: string): Promise<string> {
	// Convert tip divs back to "Tip: " prefix
	content = content.replace(
		/<div class='tip'>\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<div>([\s\S]*?)<\/div>\s*<\/div>/g,
		(_match, inner) => {
			const text = inner.replace(/<\/?p>/g, "").trim();
			return `\nTip: ${text}`;
		}
	);

	// Convert warning divs back to "Warning: " prefix
	content = content.replace(
		/<div class='warning'>\s*<span[^>]*>[\s\S]*?<\/span>\s*([\s\S]*?)<\/div>/g,
		(_match, inner) => {
			const text = inner.replace(/<\/?p>/g, "").trim();
			return `\nWarning: ${text}`;
		}
	);

	// Replace <gradio-app> embeds with demo source code from Hugging Face
	const appRegex = /<gradio-app\s+space='gradio\/([^']+)'\s*><\/gradio-app>/g;
	const matches = [...content.matchAll(appRegex)];

	const results = await Promise.all(
		matches.map(async (match) => {
			const spaceName = match[1];
			try {
				const res = await fetch(
					`https://huggingface.co/spaces/gradio/${spaceName}/raw/main/app.py`
				);
				if (res.ok) {
					const code = await res.text();
					return {
						full: match[0],
						replacement: `\`\`\`python\n${code}\n\`\`\``
					};
				}
			} catch {}
			return { full: match[0], replacement: "" };
		})
	);

	for (const { full, replacement } of results) {
		content = content.replace(full, replacement);
	}

	return content;
}
