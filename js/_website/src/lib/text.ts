const regex_italic = /\*(.*?)\*/g;
const regex_code = /`(.*?)`/g;
const regex_curly_brackets = /\{(.*?)\}/g;

export function style_formatted_text(formatted_text: string): string {
	return formatted_text
		.replace(regex_italic, "<em class='italic font-semibold'>$1</em>")
		.replace(
			regex_code,
			"<code class='text-orange-500' style='font-family: monospace; font-size: large;'>$1</code>"
		)
		.replace(
			regex_curly_brackets,
			"<code class='text-orange-500' style='font-family: monospace; font-size: large;'>$1</code>"
		);
}
