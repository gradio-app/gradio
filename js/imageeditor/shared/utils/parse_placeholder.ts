const RE_HEADING = /^#\s*(.+)$/m;

export function inject(text: string): [string | false, string | false] {
	const trimmed_text = text.trim();

	const heading_match = trimmed_text.match(RE_HEADING);
	const _heading = heading_match ? heading_match[1].trim() : false;

	const heading_end_index = heading_match
		? trimmed_text.indexOf("\n", heading_match.index)
		: -1;

	const remaining_text =
		heading_end_index !== -1
			? trimmed_text.substring(heading_end_index + 1).trim()
			: trimmed_text;

	const _paragraph = remaining_text || false;

	return [_heading, _paragraph];
}
