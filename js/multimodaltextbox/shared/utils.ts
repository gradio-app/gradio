import { tick } from "svelte";

interface Value {
	lines: number;
	max_lines: number;
	text: string;
}

export async function resize(
	target: HTMLTextAreaElement | HTMLInputElement,
	lines: number,
	max_lines: number
): Promise<void> {
	await tick();
	if (lines === max_lines) return;

	const computed_styles = window.getComputedStyle(target);
	const padding_top = parseFloat(computed_styles.paddingTop);
	const padding_bottom = parseFloat(computed_styles.paddingBottom);
	const line_height = parseFloat(computed_styles.lineHeight);

	let max =
		max_lines === undefined
			? false
			: padding_top + padding_bottom + line_height * max_lines;
	let min = padding_top + padding_bottom + lines * line_height;

	target.style.height = "1px";

	let scroll_height;
	if (max && target.scrollHeight > max) {
		scroll_height = max;
	} else if (target.scrollHeight < min) {
		scroll_height = min;
	} else {
		scroll_height = target.scrollHeight;
	}

	target.style.height = `${scroll_height}px`;
}

export function text_area_resize(
	_el: HTMLTextAreaElement,
	_value: Value
): any | undefined {
	if (_value.lines === _value.max_lines) return;
	_el.style.overflowY = "scroll";

	function handle_input(event: Event): void {
		resize(event.target as HTMLTextAreaElement, _value.lines, _value.max_lines);
	}
	_el.addEventListener("input", handle_input);

	if (!_value.text.trim()) return;
	resize(_el, _value.lines, _value.max_lines);

	return {
		destroy: () => _el.removeEventListener("input", handle_input)
	};
}
