export function clickOutside(
	element: HTMLDivElement,
	callbackFunction: () => void
) {
	function onClick(event: MouseEvent) {
		if (!element.contains(event.target as Node)) {
			callbackFunction();
		}
	}

	document.body.addEventListener("click", onClick);

	return {
		update(newCallbackFunction: () => void) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener("click", onClick);
		}
	};
}
