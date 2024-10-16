import { default as sanitize_html_ } from "sanitize-html";

export function sanitize(source: string, root: string): string {
	return sanitize_html_(source);
}
