/**
 * Lightweight inline markdown renderer for short descriptive text (e.g. component info).
 * Supports: bold, italic, inline code, links, and line breaks.
 * No block-level elements, no heavy dependencies.
 */

function escape_html(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function render_inline_markdown(text: string): string {
	let result = escape_html(text);

	// inline code (must come before bold/italic to avoid conflicts)
	result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

	// links [text](url)
	result = result.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
	);

	// bold **text** or __text__
	result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
	result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

	// italic *text* or _text_
	result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
	result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, "<em>$1</em>");

	// line breaks
	result = result.replace(/\n/g, "<br>");

	return result;
}
