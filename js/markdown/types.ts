import type { LoadingStatus } from "js/statustracker";

export interface MarkdownProps {
	value: string;
	sanitize_html: boolean;
	header_links: boolean;
	latex_delimiters: { left: string; right: string; display: boolean }[];
	rtl: boolean;
	line_breaks: boolean;
	padding: boolean;
	buttons: string[] | null;
	height: number | null;
	min_height: number | null;
	max_height: number | null;
}

export interface MarkdownEvents {
	change: string;
	copy: any;
	clear_status: LoadingStatus;
}
