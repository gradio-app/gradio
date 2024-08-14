export function clean_indent(code: string): string {
	const lines = code.split("\n");
	let min_indent: any = null;
	lines.forEach((line) => {
		const current_indent = line.match(/^(\s*)\S/);
		if (current_indent) {
			const indent_length = current_indent[1].length;
			min_indent =
				min_indent !== null
					? Math.min(min_indent, indent_length)
					: indent_length;
		}
	});
	if (min_indent === null || min_indent === 0) {
		return code.trim();
	}
	const normalized_lines = lines.map((line) => line.substring(min_indent));
	return normalized_lines.join("\n").trim();
}
