export const INLINE_CODE_RE = /`([^`]+)`/g;
export const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
export const BOLD_ASTERISK_RE = /\*\*(.+?)\*\*/g;
export const BOLD_UNDERSCORE_RE = /__(.+?)__/g;
export const ITALIC_ASTERISK_RE = /\*(.+?)\*/g;
export const ITALIC_UNDERSCORE_RE = /(?<!\w)_(.+?)_(?!\w)/g;
export const PROTOCOL_RE = /^\w+:/;

export function escape_html(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function render_link(_match: string, text: string, url: string): string {
	const trimmed = url.trim();
	if (PROTOCOL_RE.test(trimmed)) {
		if (/^https?:/i.test(trimmed)) {
			return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${text}</a>`;
		}
		return text;
	}
	return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${text}</a>`;
}

export function render_inline_markdown(text: string): string {
	let result = escape_html(text);

	result = result.replace(INLINE_CODE_RE, "<code>$1</code>");
	result = result.replace(LINK_RE, render_link);
	result = result.replace(BOLD_ASTERISK_RE, "<strong>$1</strong>");
	result = result.replace(BOLD_UNDERSCORE_RE, "<strong>$1</strong>");
	result = result.replace(ITALIC_ASTERISK_RE, "<em>$1</em>");
	result = result.replace(ITALIC_UNDERSCORE_RE, "<em>$1</em>");
	result = result.replace(/\n/g, "<br>");

	return result;
}
