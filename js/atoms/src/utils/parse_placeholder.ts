export function parse_placeholder(text: string): string {
	if (!text) return "";

	const lines = text.split("\n");

	const processed_lines = lines.map((line) => {
		line = line.trim();

		if (line.startsWith("# ")) {
			return `<h1>${line.slice(2)}</h1>`;
		}

		if (line) {
			return `<p>${line}</p>`;
		}

		return "";
	});

	return processed_lines.join("");
}
