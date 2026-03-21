/**
 * Convert HTML tip/warning divs back to their original markdown "Tip: " / "Warning: " format.
 * Used when serving guide content as markdown (copy page button, content negotiation).
 */
export function cleanGuideHtml(content: string): string {
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

	return content;
}
