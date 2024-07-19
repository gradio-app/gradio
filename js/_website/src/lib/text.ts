const regex_italic = /\*(.*?)\*/g;
const regex_code = /`(.*?)`/g;
const regex_curly_brackets = /\{(.*?)\}/g;

export function style_formatted_text(formatted_text: string | null): string {
	if (!formatted_text) return "";
	return formatted_text
		.replace(regex_italic, "<em class='italic font-semibold'>$1</em>")
		.replace(
			regex_code,
			"<code class='text-orange-500' style='font-family: monospace; font-size: 0.9em;'>$1</code>"
		)
		.replace(
			regex_curly_brackets,
			"<code class='text-orange-500' style='font-family: monospace; font-size: 0.9em;'>$1</code>"
		)
		.replace(
			/\[(.*?)\]\((.*?)\)/g,
			"<a href='$2' class= 'text-orange-500'>$1</a>"
		);
}
