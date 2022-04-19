export function get_text<T extends HTMLElement>(el: T) {
	return el.innerText.trim();
}

export function wait(n: number) {
	return new Promise((r) => setTimeout(r, n));
}

export * from "./render";
