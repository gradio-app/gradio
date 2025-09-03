import { tick } from "svelte";

/**
 * Svelte action to handle clicks outside of a DOM node
 * @param node DOM node to check the click is outside of
 * @param callback callback function to call if click is outside
 * @returns svelte action return object with destroy method to remove event listener
 */
export function click_outside(
	node: Node,
	callback: (arg: MouseEvent) => void
): any {
	const handle_click = (event: MouseEvent): void => {
		if (
			node &&
			!node.contains(event.target as Node) &&
			!event.defaultPrevented
		) {
			callback(event);
		}
	};

	document.addEventListener("mousedown", handle_click, true);

	return {
		destroy() {
			document.removeEventListener("mousedown", handle_click, true);
		}
	};
}
