const RE_HEADING = /^(#\s*)(.+)$/m;

export function inject(text: string): [string | false, string | false] {
	const trimmed_text = text.trim();

	const heading_match = trimmed_text.match(RE_HEADING);
	if (!heading_match) {
		return [false, trimmed_text || false];
	}

	const [full_match, , heading_content] = heading_match;
	const _heading = heading_content.trim();

	if (trimmed_text === full_match) {
		return [_heading, false];
	}

	const heading_end_index =
		heading_match.index !== undefined
			? heading_match.index + full_match.length
			: 0;
	const remaining_text = trimmed_text.substring(heading_end_index).trim();

	const _paragraph = remaining_text || false;

	return [_heading, _paragraph];
}
