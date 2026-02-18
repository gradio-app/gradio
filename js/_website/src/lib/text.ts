const regex_italic = /\*(.*?)\*/g;
const regex_code = /`(.*?)`/g;
const regex_curly_brackets = /\{(.*?)\}/g;
const regex_auto_links = /\b(https?:\/\/\S+)/g;
const regex_double_dash = /(^|\n)--\s+(.+)/g;
const regex_single_dash = /(^|\n)-\s+(.+)/g;
const regex_new_line = /\\n/g;

export function style_formatted_text(formatted_text: string | null): string {
	if (!formatted_text) return "";
	return formatted_text
		.replace(regex_new_line, "\n")
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
			regex_auto_links,
			"<a href='$1' target='_blank' class='text-orange-500'>$1</a>"
		)
		.replace(regex_double_dash, "$1<ul><ul><li>$2</li></ul></ul>")
		.replace(regex_single_dash, "$1<ul><li>$2</li></ul>");
}
