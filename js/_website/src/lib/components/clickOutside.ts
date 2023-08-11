/** Dispatch event on click outside of node */
namespace svelte.JSX {
	interface HTMLProps<T> {
		onclick_outside?: (e: CustomEvent) => void;
	}
}

export function clickOutside(node: Node) {
	const handleClick = (event: MouseEvent) => {
		if (
			node &&
			!node.contains(event.target as Node) &&
			!event.defaultPrevented
		) {
			node.dispatchEvent(new CustomEvent("click_outside", node as any));
		}
	};

	document.addEventListener("click", handleClick, true);

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		}
	};
}
