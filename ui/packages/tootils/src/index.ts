export function get_text<T extends HTMLElement>(el: T) {
	return el.innerText.trim();
}
