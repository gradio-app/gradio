import { default as sanitize_html_ } from "sanitize-html";

export function sanitize(source: string): string {
	return sanitize_html_(source);
}

export function sanitize_fragment(source: string): DocumentFragment {
	throw new Error("sanitize_fragment is only available in the browser");
}
