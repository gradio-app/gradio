import { default as sanitize_html_ } from "sanitize-html";

export function sanitize(source: string): string {
	return sanitize_html_(source);
}
