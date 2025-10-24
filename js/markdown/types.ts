export interface MarkdownProps {
	value: string;
	sanitize_html: boolean;
	header_links: boolean;
	latex_delimiters: { left: string; right: string; display: boolean }[];
	rtl: boolean;
	line_breaks: boolean;
	padding: boolean;
	buttons: string[] | null;
}

export interface MarkdownEvents {
	change: string;
	copy: never;
}
